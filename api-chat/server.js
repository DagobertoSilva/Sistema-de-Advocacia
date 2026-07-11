require("dotenv").config();

const express = require("express");
const multer = require("multer");
const Groq = require("groq-sdk");
const { Pool } = require("pg");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const upload = multer({
    storage: multer.memoryStorage(),
});

const ia = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const db = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || "sistema_advocacia",
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "adminpassword",
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        servico: "api-chat",
        groqConfigurada: Boolean(process.env.GROQ_API_KEY),
        bancoConfigurado: Boolean(db),
    });
});

function verificarGroqConfigurada(res) {
    if (process.env.GROQ_API_KEY) {
        return true;
    }
    res.status(500).json({ erro: "GROQ_API_KEY nao configurada." });
    return false;
}

function obterIdCliente(body) {
    const idCliente = Number(body.idCliente || body.id_cliente);
    if (!Number.isInteger(idCliente) || idCliente <= 0) {
        return null;
    }
    return idCliente;
}

async function buscarCliente(idCliente) {
    const resultado = await db.query(
        "SELECT id_cliente, nome FROM cliente WHERE id_cliente = $1",
        [idCliente],
    );
    return resultado.rows[0] || null;
}

async function obterOuCriarConversa(idCliente) {
    const conversaAberta = await db.query(
        `
        SELECT id_conversa
        FROM conversa
        WHERE id_cliente = $1
        ORDER BY ultima_interacao DESC, data_inicio DESC
        LIMIT 1
        `,
        [idCliente],
    );

    if (conversaAberta.rows[0]) {
        return conversaAberta.rows[0].id_conversa;
    }

    const novaConversa = await db.query(
        `
        INSERT INTO conversa (id_cliente, canal, status)
        VALUES ($1, 'Chatbot', 'MENU_PRINCIPAL')
        RETURNING id_conversa
        `,
        [idCliente],
    );

    return novaConversa.rows[0].id_conversa;
}

async function carregarHistorico(idConversa) {
    const resultado = await db.query(
        `
        SELECT remetente, conteudo
        FROM (
            SELECT remetente, conteudo, data_envio, id_mensagem
            FROM mensagem
            WHERE id_conversa = $1
              AND tipo_mensagem = 'Texto'
              AND conteudo IS NOT NULL
            ORDER BY data_envio DESC, id_mensagem DESC
            LIMIT 20
        ) historico_recente
        ORDER BY data_envio ASC, id_mensagem ASC
        `,
        [idConversa],
    );

    return resultado.rows.map((mensagem) => ({
        role: mensagem.remetente === "Chatbot" ? "assistant" : "user",
        content: mensagem.conteudo,
    }));
}

async function salvarMensagem(idConversa, remetente, conteudo, statusProcessamentoIa = null) {
    await db.query(
        `
        INSERT INTO mensagem (id_conversa, remetente, tipo_mensagem, conteudo, status_processamento_ia)
        VALUES ($1, $2, 'Texto', $3, $4)
        `,
        [idConversa, remetente, conteudo, statusProcessamentoIa],
    );

    await db.query(
        "UPDATE conversa SET ultima_interacao = CURRENT_TIMESTAMP WHERE id_conversa = $1",
        [idConversa],
    );
}

function detectarUrgencia(texto) {
    if (!texto) return false;

    const mensagem = texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const expressoesUrgentes = [
        "estou preso", "estou presa", "fui preso", "fui presa", "foi preso", "foi presa",
        "acabei de ser preso", "acabei de ser presa", "me prenderam", "delegacia",
        "distrito policial", "dp", "central de flagrantes", "flagrante", "cadeia",
        "presidio", "cela", "custodia", "detido", "detida", "detencao", "prisao",
        "policia levou", "me levaram", "meu filho foi preso", "meu filho esta preso",
        "minha filha foi presa", "minha filha esta presa", "meu marido foi preso",
        "meu marido esta preso", "minha esposa foi presa", "minha esposa esta presa",
        "meu pai foi preso", "meu pai esta preso", "minha mae foi presa",
        "meu irmao foi preso", "meu irmao esta preso", "minha irma foi presa",
        "um familiar foi preso", "um amigo foi preso", "habeas corpus", "audiencia de custodia"
    ];

    return expressoesUrgentes.some(exp => mensagem.includes(exp));
}

async function prepararConversa(req, res, campoMensagem) {
    const conteudo = req.body[campoMensagem];
    if (!conteudo || !String(conteudo).trim()) {
        res.status(400).json({ erro: `O campo '${campoMensagem}' e obrigatorio.` });
        return null;
    }

    let idCliente = obterIdCliente(req.body);
    let numeroWhatsapp = req.body.numero_whatsapp || req.body.numeroWhatsapp || (req.body.cliente ? (req.body.cliente.numero_whatsapp || req.body.cliente.numeroWhatsapp) : null);
    let cliente = null;

    // 1. Se veio idCliente (comportamento padrão do Spring Boot), busca o cliente no banco
    if (idCliente) {
        cliente = await buscarCliente(idCliente);
        if (cliente && !numeroWhatsapp) {
            // Puxa o WhatsApp cadastrado no banco para alimentar o fluxo da IA
            const resultadoWhats = await db.query("SELECT numero_whatsapp FROM cliente WHERE id_cliente = $1", [idCliente]);
            if (resultadoWhats.rows[0]) {
                numeroWhatsapp = resultadoWhats.rows[0].numero_whatsapp;
            }
        }
    }

    // 2. Se não achou por ID mas tem número (visto em testes diretos), busca por número
    if (!cliente && numeroWhatsapp) {
        const resultadoBusca = await db.query(
            "SELECT id_cliente, nome FROM cliente WHERE numero_whatsapp = $1",
            [numeroWhatsapp]
        );
        cliente = resultadoBusca.rows[0];
    }

    // 3. Se é uma nova pessoa total (não achou de jeito nenhum) e tem número, cadastra
    if (!cliente && numeroWhatsapp) {
        console.log(`[AUTO-CADASTRO] Criando novo cliente para o WhatsApp: ${numeroWhatsapp}`);
        const novoCliente = await db.query(
            `
            INSERT INTO cliente (nome, numero_whatsapp, status_lead, chatbot_ativo, data_cadastro)
            VALUES ($1, $2, 'Em_triagem', true, CURRENT_TIMESTAMP)
            RETURNING id_cliente, nome
            `,
            [`Lead #${numeroWhatsapp.slice(-4)}`, numeroWhatsapp]
        );
        cliente = novoCliente.rows[0];
    }

    // Se no fim de tudo não tiver cliente nem número, barra com erro descritivo
    if (!cliente) {
        res.status(400).json({ erro: "Nao foi possivel identificar ou criar o cliente com os dados fornecidos." });
        return null;
    }

    idCliente = cliente.id_cliente;
    const idConversa = await obterOuCriarConversa(idCliente);

    return {
        cliente,
        idCliente,
        idConversa,
        conteudo: String(conteudo).trim(),
    };
}

// =======================
// ROTA DE TEXTO
// =======================

app.post("/chat/texto", async (req, res) => {
    try {
        if (!verificarGroqConfigurada(res)) return;

        const dados = await prepararConversa(req, res, "pergunta");
        if (!dados) return;

        const historico = await carregarHistorico(dados.idConversa);
        await salvarMensagem(dados.idConversa, "Cliente", dados.conteudo, "Recebida");

        const resposta = await ia.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `Voce e uma assistente virtual de um escritorio de advocacia. Responda somente com base na conversa do cliente atual. O cliente atual e ${dados.cliente.nome} (id ${dados.idCliente}). Nunca use informacoes de outros clientes.`,
                },
                ...historico,
                { role: "user", content: dados.conteudo },
            ],
        });

        const conteudoResposta = resposta.choices[0].message.content;
        await salvarMensagem(dados.idConversa, "Chatbot", conteudoResposta, "Processada");

        res.status(200).json({
            resposta: conteudoResposta,
            idCliente: dados.idCliente,
            idConversa: dados.idConversa,
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao comunicar com a IA.", detalhes: erro.message });
    }
});

// =======================
// TRIAGEM JURÍDICA CRIMINAL
// =======================

app.post("/chat/triagem", async (req, res) => {
    try {
        if (!verificarGroqConfigurada(res)) return;

        const dados = await prepararConversa(req, res, "mensagem");
        if (!dados) return;

        const historico = await carregarHistorico(dados.idConversa);
        await salvarMensagem(dados.idConversa, "Cliente", dados.conteudo, "Recebida");

        const TEXTO_ENCERRAMENTO_PADRAO = "Perfeito! Informo que a triagem foi concluída com sucesso. Seus dados e relatórios foram salvos no painel. Por favor, feche esta aba e aguarde, pois um de nossos advogados entrará em contato em breve para dar o retorno.";

        const mensagens = [
            {
                role: "system",
                content: `
Você é um ALGORITMO DE TRIAGEM automatizado. Você NÃO é humano e NÃO possui sentimentos.
Seu único objetivo é coletar dados para preencher o relatório interno estruturado.

TEXTO PADRÃO DE ENCERRAMENTO:
"${TEXTO_ENCERRAMENTO_PADRAO}"

REGRAS CRÍTICAS DE PARADA:
1. Se o usuário já informou o Nome, Caso, se há Audiência, se há Sentença e Local, a triagem ACABOU. Você DEVE responder EXATAMENTE e APENAS o TEXTO PADRÃO DE ENCERRAMENTO.
2. Se o usuário exigir falar com um advogado (ex: "quero falar com o advogado") e já tiver dado detalhes do problema, você DEVE responder EXATAMENTE e APENAS o TEXTO PADRÃO DE ENCERRAMENTO. 
3. Não adicione nenhuma saudação, justificativa ou introdução antes ou depois do texto padrão.

MECÂNICA DO NOME:
- Assim que o usuário disser o nome dele, envie de volta: "Seu nome é [Nome], está correto?". Assim que ele disser "sim" ou confirmar, envie o nome limpo no campo "nomeConfirmadoESalvar". Caso contrário, deixe como null.

CLASSIFICAÇÃO DE RISCO:
- Defina "urgente" como true se o usuário relatar prisão em andamento, flagrante ou detenção recente em delegacia/presídio/DP. Caso contrário, false.

Sua resposta DEVE ser estritamente este JSON:
{
  "mensagemParaOCliente": "Texto da sua pergunta atual ou o texto padrão de encerramento",
  "nomeConfirmadoESalvar": "Nome limpo se confirmado, senão null",
  "urgente": true ou false,
  "coletaFinalizada": true ou false
}
`,
            },
            ...historico,
            {
                role: "user",
                content: dados.conteudo,
            },
        ];

        const resposta = await ia.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: mensagens,
        });

        const resultadoIa = JSON.parse(resposta.choices[0].message.content);
        let textoParaCliente = resultadoIa.mensagemParaOCliente;
        let nomeConfirmado = resultadoIa.nomeConfirmadoESalvar;
        const urgenteIA = resultadoIa.urgente === true;
        const finalizadoPelaIA = resultadoIa.coletaFinalizada === true;

        const urgenteServidor =
            detectarUrgencia(dados.conteudo) ||
            detectarUrgencia(textoParaCliente);

        const ehUrgente = urgenteIA || urgenteServidor;

        // --- INTERCEPÇÃO PROGRAMÁTICA CONTRA ALUCINAÇÕES ---
        const termosDeEncerramento = ["triagem foi concluida", "chamar o advogado", "encaminhar para um advogado", "aguarde um momento", "assistente virtual", "mientras"];
        const detectouFimNoTexto = termosDeEncerramento.some(termo => 
            textoParaCliente.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(termo)
        );

        if (finalizadoPelaIA || detectouFimNoTexto) {
            textoParaCliente = TEXTO_ENCERRAMENTO_PADRAO;
        }
        // ----------------------------------------------------

        // 1. Atualiza o nome se confirmado pela IA
        if (nomeConfirmado && nomeConfirmado.trim().toLowerCase() !== "null") {
            await db.query(
                "UPDATE cliente SET nome = $1 WHERE id_cliente = $2",
                [nomeConfirmado.trim(), dados.idCliente]
            );
            console.log(`[DATABASE] Nome atualizado para: ${nomeConfirmado}`);
        }

        // 2. CORREÇÃO DA QUERY DE URGÊNCIA (Removida a trava fixa de status anterior)
        // Se em qualquer momento for detectado como urgente, força "Emergencia_max" no banco.
        if (ehUrgente) {
            await db.query(
                "UPDATE cliente SET status_lead = 'Emergencia_max' WHERE id_cliente = $1",
                [dados.idCliente]
            );
            console.log(`[DATABASE] Lead ${dados.idCliente} atualizado/mantido como Emergencia_max`);
        } else {
            // Só muda para normal se não estiver definido como emergência
            await db.query(
                "UPDATE cliente SET status_lead = 'Normal' WHERE id_cliente = $1 AND status_lead = 'Em_triagem'",
                [dados.idCliente]
            );
        }

        await salvarMensagem(dados.idConversa, "Chatbot", textoParaCliente, "Processada");

        res.status(200).json({
            resposta: textoParaCliente,
            idCliente: dados.idCliente,
            idConversa: dados.idConversa,
            urgente: ehUrgente
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro na triagem.",
            detalhes: erro.message,
        });
    }
});

// =======================
// LIMPAR HISTORICO
// =======================

app.post("/chat/limpar", async (req, res) => {
    try {
        const idCliente = obterIdCliente(req.body);
        if (!idCliente) {
            return res.status(400).json({ erro: "O campo 'idCliente' e obrigatorio e deve ser um numero inteiro." });
        }

        const cliente = await buscarCliente(idCliente);
        if (!cliente) {
            return res.status(404).json({ erro: "Cliente nao encontrado.", idCliente });
        }

        await db.query(
            `
            DELETE FROM mensagem
            WHERE id_conversa IN (
                SELECT id_conversa
                FROM conversa
                WHERE id_cliente = $1
            )
            `,
            [idCliente],
        );

        res.json({ mensagem: "Historico apagado para o cliente informado.", idCliente });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao limpar historico.", detalhes: erro.message });
    }
});

// =======================
// IMAGEM
// =======================

app.post("/chat/imagem", upload.single("imagem"), async (req, res) => {
    res.status(501).json({ erro: "O modelo configurado atualmente nao possui suporte a imagens." });
});

// =======================

app.listen(3000, () => {
   console.log("Servidor da Groq rodando na porta 3000 e salvando metadados de forma inteligente!");
});