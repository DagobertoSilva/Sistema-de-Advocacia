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
        role: message.remetente === "Chatbot" ? "assistant" : "user",
        content: message.conteudo,
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

async function prepararConversa(req, res, campoMensagem) {
    const idCliente = obterIdCliente(req.body);
    if (!idCliente) {
        res.status(400).json({ erro: "O campo 'idCliente' e obrigatorio e deve ser um numero inteiro." });
        return null;
    }

    const conteudo = req.body[campoMensagem];
    if (!conteudo || !String(conteudo).trim()) {
        res.status(400).json({ erro: `O campo '${campoMensagem}' e obrigatorio.` });
        return null;
    }

    const cliente = await buscarCliente(idCliente);
    if (!cliente) {
        res.status(404).json({ erro: "Cliente nao encontrado.", idCliente });
        return null;
    }

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
// TRIAGEM JURÍDICA CRIMINAL (COM CONFIRMAÇÃO DE NOME E URGÊNCIA BLINDADA)
// =======================

app.post("/chat/triagem", async (req, res) => {
    try {
        if (!verificarGroqConfigurada(res)) return;

        const dados = await prepararConversa(req, res, "mensagem");
        if (!dados) return;

        const historico = await carregarHistorico(dados.idConversa);
        await salvarMensagem(dados.idConversa, "Cliente", dados.conteudo, "Recebida");

        const resposta = await ia.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `
Voce e uma assistente virtual focada EXCLUSIVAMENTE em Triagem Juridica Criminal.
Seu objetivo e coletar dados basicos do usuario de maneira segura.

O cliente atual no sistema se chama: "${dados.cliente.nome}" (ID: ${dados.idCliente}).

REGRA DO NOME (MECANICA DE CONFIRMACAO):
1. No inicio da conversa, pergunte o nome do usuario.
2. Assim que o usuario responder o nome dele, na proxima mensagem voce DEVE obrigatoriamente validar enviando o nome de volta para ele confirmar.
   Exemplo:
   IA: "Qual o seu nome?"
   Usuario: "Meu nome e Luiz e estou preso."
   IA: "Seu nome e: Luiz, esta correto?"
3. Se o usuario disser "nao", pergunte novamente e repita o processo de confirmacao.
4. Enquanto o usuario nao disser "sim" ou confirmar de forma clara que o nome exibido na tela esta correto, a chave "nomeConfirmadoESalvar" DEVE ser null.
5. Somente quando o usuario confirmar explicitamente que aquele nome esta correto (ex: "sim", "correto", "isso"), voce atribui o nome limpo na chave "nomeConfirmadoESalvar".

REGRA CRITICA DE URGENGIA:
Avalie minuciosamente o relato do cliente. Voce DEVE classificar a chave "urgente" como true se o usuario relatar:
- Que esta atualmente na DELEGACIA (ou DP).
- Que foi PRESO HÁ POUCO TEMPO (horas, hoje, agora).
- Que foi preso em FLAGRANTE.
- Qualquer evento de prisao ocorrendo no momento.
Caso contrario, classifique como false.

PERGUNTAS RESTANTES (Apos o nome estar confirmado, faça uma por vez):
- Tipo do caso/problema relatado
- Ja teve audiencia?
- Ja possui sentenca?
- Onde esta preso e ha quanto tempo?

ENCERRAMENTO OBRIGATORIO:
Ao obter todas as informacoes, use exatamente este texto:
"Perfeito! Informo que a triagem foi concluída com sucesso. Seus dados e relatórios foram salvos no painel. Por favor, feche esta aba e aguarde, pois um de nossos advogados entrará em contato em breve para dar o retorno."

Sua resposta DEVE ser estritamente este objeto JSON:
{
  "mensagemParaOCliente": "O texto da sua resposta/pergunta atual para o cliente",
  "nomeConfirmadoESalvar": "O nome limpo APENAS se o usuario confirmou que esta correto na interacao atual. Caso contrario, envie null",
  "urgente": true ou false
}
`,
                },
                ...historico,
                { role: "user", content: dados.conteudo },
            ],
        });

        const resultadoIa = JSON.parse(resposta.choices[0].message.content);
        const textoParaCliente = resultadoIa.mensagemParaOCliente;
        const nomeConfirmado = resultadoIa.nomeConfirmadoESalvar;
        const ehUrgente = resultadoIa.urgente;

        // 1. Só altera o nome no banco se ele foi explicitly confirmado pelo usuário
        if (nomeConfirmado && nomeConfirmado.trim().toLowerCase() !== "null") {
            await db.query(
                "UPDATE cliente SET nome = $1 WHERE id_cliente = $2",
                [nomeConfirmado.trim(), dados.idCliente]
            );
            console.log(`[DATABASE] Nome validado e atualizado para: ${nomeConfirmado}`);
        }

        // 2. Aciona o alerta de emergência máxima se a pessoa estiver na delegacia ou flagrante
        if (ehUrgente === true) {
            await db.query(
                "UPDATE cliente SET status_lead = 'Emergencia_max' WHERE id_cliente = $1 AND status_lead = 'Em_triagem'",
                [dados.idCliente]
            );
            console.log(`[DATABASE] Alerta acionado! Lead ${dados.idCliente} classificado como URGENTE.`);
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
                WHERE id_cliente = $1 AND status = 'Aberta'
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