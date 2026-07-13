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

// Nova função para buscar ou criar dinamicamente o cliente usando o número do WhatsApp
async function garantirClientePorWhatsapp(numeroWhatsapp) {
    if (!numeroWhatsapp) return null;
    
    // Tenta buscar o cliente existente
    const busca = await db.query(
        "SELECT id_cliente, nome, status_lead FROM cliente WHERE numero_whatsapp = $1",
        [numeroWhatsapp]
    );
    
    if (busca.rows.length > 0) {
        return busca.rows[0];
    }
    
    // Se não existir, insere um novo cliente no banco automaticamente
    const novoCliente = await db.query(
        "INSERT INTO cliente (nome, numero_whatsapp, status_lead) VALUES ($1, $2, 'Em_triagem') RETURNING id_cliente, nome, status_lead",
        ["Novo Lead - Whats", numeroWhatsapp]
    );
    
    console.log(`[DATABASE] Novo cliente cadastrado automaticamente via WhatsApp: ${numeroWhatsapp}`);
    return novoCliente.rows[0];
}

async function garantirConversaAtiva(idCliente) {
    const resultadoExistente = await db.query(
        "SELECT id_conversa FROM conversa WHERE id_cliente = $1 ORDER BY data_inicio DESC LIMIT 1",
        [idCliente],
    );

    if (resultadoExistente.rows.length > 0) {
        return resultadoExistente.rows[0].id_conversa;
    }

    const novoResultado = await db.query(
        "INSERT INTO conversa (id_cliente, data_inicio) VALUES ($1, NOW()) RETURNING id_conversa",
        [idCliente],
    );
    return novoResultado.rows[0].id_conversa;
}

async function carregarHistoricoMensagens(idConversa) {
    const resultado = await db.query(
        "SELECT remetente, conteudo FROM mensagem WHERE id_conversa = $1 ORDER BY data_envio ASC",
        [idConversa],
    );
    return resultado.rows.map((row) => ({
        role: row.remetente === "Cliente" ? "user" : "assistant",
        content: row.conteudo,
    }));
}

async function salvarMensagemNoBanco(idConversa, papel, conteudo) {
    const remetente = papel === "user" ? "Cliente" : "Chatbot";
    await db.query(
        "INSERT INTO mensagem (id_conversa, remetente, tipo_mensagem, conteudo, data_envio, status_processamento_ia) VALUES ($1, $2, 'Texto', $3, NOW(), 'Processada')",
        [idConversa, remetente, conteudo],
    );
}

function detectarUrgencia(texto) {
    if (!texto) return false;
    const t = texto.toLowerCase();
    const termos = [
        "preso", "prisao", "flagrante", "delegacia", "detido", "policia", "algema",
        "bateram", "roubado", "urgente", "socorro", "enquadro", "mandado", "prenderam"
    ];
    return termos.some((termo) => t.includes(termo));
}

function normalizarNivelUrgencia(nivel) {
    if (!nivel) return null;

    const valor = nivel.toString().trim().toLowerCase();
    if (["alta", "alto", "emergencia", "emergencia_max"].includes(valor)) return "alta";
    if (["normal", "media", "média", "medio", "médio"].includes(valor)) return "normal";
    if (["baixa", "baixo"].includes(valor)) return "baixa";
    return null;
}

function analisarNivelUrgencia(cliente, triagem, mensagens) {
    const nivelTriagem = normalizarNivelUrgencia(triagem?.nivel_urgencia);
    if (nivelTriagem) {
        return {
            nivel: nivelTriagem,
            fonte: "triagem",
            motivo: "Classificação registrada na triagem mais recente.",
        };
    }

    if (cliente.status_lead === "Emergencia_max") {
        return {
            nivel: "alta",
            fonte: "status_lead",
            motivo: "O caso está marcado como emergência no cadastro.",
        };
    }

    const textoDoCaso = [cliente.resumo_fatos, cliente.assunto_tipificado, ...mensagens]
        .filter(Boolean)
        .join(" ");

    if (detectarUrgencia(textoDoCaso)) {
        return {
            nivel: "alta",
            fonte: "historico",
            motivo: "O histórico contém indícios de prisão, flagrante, detenção ou outra situação imediata.",
        };
    }

    if (["Encerrado", "Contrato_fechado"].includes(cliente.status_lead)) {
        return {
            nivel: "baixa",
            fonte: "status_lead",
            motivo: "O caso consta como encerrado ou com contrato já fechado, sem sinal de emergência registrado.",
        };
    }

    return {
        nivel: "normal",
        fonte: "historico",
        motivo: "Há informações do caso, mas nenhum indício de emergência foi identificado.",
    };
}

const TEXTO_ENCERRAMENTO_PADRAO = "Perfeito! Informo que a triagem foi concluída com sucesso. Seus dados e relatórios foram salvos no painel. Por favor, feche esta aba e aguarde, pois um de nossos advogados entrará em contato em breve para dar o retorno.";

// =======================
// FLUXO DE TRIAGEM PRINCIPAL (Mapeado por número de WhatsApp)
// =======================
app.get("/clientes/:id/urgencia", async (req, res) => {
    const idCliente = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(idCliente) || idCliente <= 0) {
        return res.status(400).json({ erro: "O id do cliente deve ser um número inteiro positivo." });
    }

    try {
        const [clienteResultado, triagemResultado, mensagensResultado] = await Promise.all([
            db.query(
                "SELECT id_cliente, status_lead, assunto_tipificado, resumo_fatos FROM cliente WHERE id_cliente = $1",
                [idCliente],
            ),
            db.query(
                "SELECT nivel_urgencia FROM triagem WHERE id_cliente = $1 ORDER BY data_inicio DESC, id_triagem DESC LIMIT 1",
                [idCliente],
            ),
            db.query(
                `SELECT m.conteudo
                 FROM mensagem m
                 JOIN conversa c ON c.id_conversa = m.id_conversa
                 WHERE c.id_cliente = $1 AND m.conteudo IS NOT NULL
                 ORDER BY m.data_envio ASC`,
                [idCliente],
            ),
        ]);

        if (clienteResultado.rows.length === 0) {
            return res.status(404).json({ erro: "Cliente não encontrado." });
        }

        const cliente = clienteResultado.rows[0];
        const triagem = triagemResultado.rows[0];
        const mensagens = mensagensResultado.rows.map(({ conteudo }) => conteudo);
        const possuiHistorico = Boolean(
            triagem || mensagens.length > 0 || cliente.resumo_fatos || cliente.assunto_tipificado
        );

        if (!possuiHistorico) {
            return res.json({
                idCliente,
                possuiHistorico: false,
                nivelUrgencia: null,
                analise: "Não há histórico ou dados de triagem suficientes para classificar a urgência do caso.",
            });
        }

        const analise = analisarNivelUrgencia(cliente, triagem, mensagens);
        return res.json({
            idCliente,
            possuiHistorico: true,
            nivelUrgencia: analise.nivel,
            analise: analise.motivo,
            fonte: analise.fonte,
        });
    } catch (erro) {
        console.error("[URGENCIA]", erro);
        return res.status(500).json({
            erro: "Erro ao consultar a urgência do caso.",
            detalhes: erro.message,
        });
    }
});

app.post("/chat/triagem", async (req, res) => {
    try {
        if (!verificarGroqConfigurada(res)) return;

        const numeroWhatsapp = req.body.numeroWhatsapp || req.body.whatsapp;
        const conteudoMensagem = req.body.mensagem || req.body.conteudo;

        if (!numeroWhatsapp || !conteudoMensagem) {
            return res.status(400).json({
                erro: "Os campos 'numeroWhatsapp' e 'mensagem' ou 'conteudo' são obrigatórios.",
            });
        }

        // Busca ou cria o registro do cliente na hora usando o número do telefone
        const cliente = await garantirClientePorWhatsapp(numeroWhatsapp);
        const idCliente = cliente.id_cliente;

        const idConversa = await garantirConversaAtiva(idCliente);
        const historico = await carregarHistoricoMensagens(idConversa);

        await salvarMensagemNoBanco(idConversa, "user", conteudoMensagem);

        const mensagens = [
            {
                role: "system",
                content: `
Você é um ALGORITMO DE TRIAGEM automatizado para um escritório de advocacia criminal. Você NÃO é humano e NÃO possui sentimentos.
Seu único objetivo é fazer perguntas estratégicas, uma por uma, para extrair os dados e preencher o relatório interno estruturado.

TEXTO PADRÃO DE ENCERRAMENTO:
"${TEXTO_ENCERRAMENTO_PADRAO}"

CHECKLIST OBRIGATÓRIO DE DADOS (SEU OBJETIVO):
1. Nome do cliente ou do familiar preso.
2. Qual o motivo/crime ou o que aconteceu com detalhes.
3. O Local exato da prisão ou ocorrência (Cidade, Bairro, ou se está em uma Delegacia/Central de Flagrantes específica).
4. Se já possui Audiência de Custódia agendada ou se a prisão é recente.

REGRAS CRÍTICAS DE PARADA E ENCERRAMENTO:
1. Você SÓ PODE enviar o TEXTO PADRÃO DE ENCERRAMENTO se TODOS os 4 pontos do CHECKLIST OBRIGATÓRIO tiverem sido respondidos pelo usuário ao longo do histórico.
2. Se o usuário disser "quero falar com o advogado" ou "chama o advogado", mas ainda NÃO informou o Local exato (Cidade/Delegacia) ou o motivo, NÃO encerre a triagem. Responda firmemente que, para encaminhá-lo ao especialista plantonista, você precisa saber primeiro em qual cidade/delegacia ele está e qual é o caso.
3. Quando todos os dados do checklist forem coletados, responda APENAS o TEXTO PADRÃO DE ENCERRAMENTO e mude "coletaFinalizada" para true.

MECÂNICA DO NOME:
- Assim que o usuário disser o nome, envie de volta: "Seu nome é [Nome], está correto?". Assim que ele confirmar, envie o nome limpo no campo "nomeConfirmadoESalvar".

CLASSIFICAÇÃO DE RISCO E ASSUNTO:
- Defina "urgente" as true se o usuário relatar prisão em andamento, flagrante ou detenção recente. Caso contrário, false.
- No campo "assuntoTipificado", analise o crime/motivo relatado e classifique em uma frase curta de 2 a 4 palavras (Ex: "Tráfico de Drogas", "Busca e Apreensão", "Furto Qualificado", "Divórcio Cível", "Estelionato"). Se ainda não souber o crime, mande "Triagem Chatbot".
- No campo "resumoFatos", conforme o andamento da conversa, crie um parágrafo descritivo e formal resumindo os fatos apurados (Quem foi preso, qual o motivo alegado, local e se há audiência). Atualize este resumo a cada mensagem.

Sua resposta DEVE ser estritamente este JSON válido, sem markdown ou blocos de código adicionais:
{
  "mensagemParaOCliente": "Sua próxima pergunta para preencher o checklist ou o texto padrão de encerramento",
  "nomeConfirmadoESalvar": "Nome limpo se confirmado, senão null",
  "urgente": true ou false,
  "coletaFinalizada": true ou false,
  "assuntoTipificado": "Classificação curta do crime ou caso",
  "resumoFatos": "Resumo analítico e formal dos acontecimentos colhidos até agora"
}
`,
            },
            ...historico,
            {
                role: "user",
                content: conteudoMensagem,
            },
        ];

        const completions = await ia.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: mensagens,
            temperature: 0.1,
            response_format: { type: "json_object" },
        });

        let respostaTexto = completions.choices[0].message.content;
        let respostaObjeto;

        try {
            respostaObjeto = JSON.parse(respostaTexto);
        } catch (e) {
            console.error("[GROQ ERROR] Falha ao parsear JSON nativo da IA:", respostaTexto);
            return res.status(500).json({ erro: "Erro ao estruturar resposta do Llama." });
        }

        let textoParaCliente = respostaObjeto.mensagemParaOCliente;
        let nomeCapturado = respostaObjeto.nomeConfirmadoESalvar;
        let sinalizaUrgenteIA = respostaObjeto.urgente;
        let finalizadoIA = respostaObjeto.coletaFinalizada;
        let assuntoIA = respostaObjeto.assuntoTipificado || "Triagem Chatbot";
        let resumoIA = respostaObjeto.resumoFatos || "";

        await salvarMensagemNoBanco(idConversa, "assistant", textoParaCliente);

        if (nomeCapturado && nomeCapturado.toLowerCase() !== "null") {
            await db.query("UPDATE cliente SET nome = $1 WHERE id_cliente = $2", [
                nomeCapturado,
                idCliente,
            ]);
            console.log(`[DATABASE] Nome atualizado para: ${nomeCapturado}`);
        }

        await db.query(
            "UPDATE cliente SET assunto_tipificado = $1, resumo_fatos = $2 WHERE id_cliente = $3",
            [assuntoIA, resumoIA, idCliente]
        );
        console.log(`[DATABASE] Caso ${idCliente} atualizado. Assunto: ${assuntoIA}`);

        const urgenteServidor = detectarUrgencia(conteudoMensagem) || detectarUrgencia(textoParaCliente);
        const ehUrgente = sinalizaUrgenteIA === true || urgenteServidor === true;

        if (ehUrgente) {
            await db.query(
                "UPDATE cliente SET status_lead = 'Emergencia_max' WHERE id_cliente = $1",
                [idCliente]
            );
            console.log(`[DATABASE] Lead ${idCliente} marcado como Emergencia_max`);
        } else {
            const temUrgenciaNoHistorico = historico.some(msg => detectarUrgencia(msg.content));
            
            if (!temUrgenciaNoHistorico) {
                await db.query(
                    "UPDATE cliente SET status_lead = 'Em_triagem' WHERE id_cliente = $1 AND status_lead = 'Em_triagem'",
                    [idCliente]
                );
            }
        }

        if (finalizadoIA === true || textoParaCliente === TEXTO_ENCERRAMENTO_PADRAO) {
            await db.query(
                "UPDATE cliente SET status_lead = 'Aguardando_retorno' WHERE id_cliente = $1",
                [idCliente],
            );
            console.log(`[DATABASE] Fim da triagem para o cliente ${idCliente}. Status alterado para Aguardando_retorno.`);
        }

        res.json({
            resposta: textoParaCliente,
            idCliente: idCliente,
            idConversa: idConversa,
            numeroWhatsapp: numeroWhatsapp,
            urgente: ehUrgente,
            assuntoTipificado: assuntoIA,
            resumoFatos: resumoIA,
            origem: "api-chat",
            chatApiUrl: "http://localhost:3000",
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro interno no processamento da triagem.",
            detalhes: erro.message,
        });
    }
});

// =======================
// LIMPAR HISTORICO
// =======================
app.post("/chat/limpar", async (req, res) => {
    try {
        const numeroWhatsapp = req.body.numeroWhatsapp || req.body.whatsapp;
        if (!numeroWhatsapp) {
            return res.status(400).json({ erro: "O campo 'numeroWhatsapp' é obrigatório." });
        }

        await db.query(
            `
            DELETE FROM mensagem
            WHERE id_conversa IN (
                SELECT id_conversa
                FROM conversa c
                JOIN cliente cl ON c.id_cliente = cl.id_cliente
                WHERE cl.numero_whatsapp = $1
            )
            `,
            [numeroWhatsapp],
        );

        res.json({ mensagem: "Histórico apagado para o número informado.", numeroWhatsapp });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao limpar historico.", detalhes: erro.message });
    }
});

app.post("/chat/imagem", upload.single("imagem"), async (req, res) => {
    res.status(501).json({ erro: "O modelo configurado atualmente nao possui suporte a imagens." });
});

app.listen(3000, () => {
    console.log("Servidor da Groq API-Chat rodando com sucesso na porta 3000.");
});
