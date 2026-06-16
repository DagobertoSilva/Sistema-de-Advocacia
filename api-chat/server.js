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

    res.status(500).json({
        erro: "GROQ_API_KEY nao configurada."
    });

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
        WHERE id_cliente = $1 AND status = 'Aberta'
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
        VALUES ($1, 'Chatbot', 'Aberta')
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
        INSERT INTO mensagem (
            id_conversa,
            remetente,
            tipo_mensagem,
            conteudo,
            status_processamento_ia
        )
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
        res.status(400).json({
            erro: "O campo 'idCliente' e obrigatorio e deve ser um numero inteiro.",
        });
        return null;
    }

    const conteudo = req.body[campoMensagem];

    if (!conteudo || !String(conteudo).trim()) {
        res.status(400).json({
            erro: `O campo '${campoMensagem}' e obrigatorio.`,
        });
        return null;
    }

    const cliente = await buscarCliente(idCliente);

    if (!cliente) {
        res.status(404).json({
            erro: "Cliente nao encontrado.",
            idCliente,
        });
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
        if (!verificarGroqConfigurada(res)) {
            return;
        }

        const dados = await prepararConversa(req, res, "pergunta");

        if (!dados) {
            return;
        }

        const historico = await carregarHistorico(dados.idConversa);
        await salvarMensagem(dados.idConversa, "Cliente", dados.conteudo, "Recebida");

        const resposta = await ia.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `
Voce e uma assistente virtual de um escritorio de advocacia.
Responda somente com base na conversa do cliente atual.
O cliente atual e ${dados.cliente.nome} (id ${dados.idCliente}).
Nunca use informacoes de outros clientes.
                    `,
                },
                ...historico,
                {
                    role: "user",
                    content: dados.conteudo,
                },
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

        res.status(500).json({
            erro: "Erro ao comunicar com a IA.",
            detalhes: erro.message,
        });
    }
});

// =======================
// TRIAGEM
// =======================

app.post("/chat/triagem", async (req, res) => {
    try {
        if (!verificarGroqConfigurada(res)) {
            return;
        }

        const dados = await prepararConversa(req, res, "mensagem");

        if (!dados) {
            return;
        }

        const historico = await carregarHistorico(dados.idConversa);
        await salvarMensagem(dados.idConversa, "Cliente", dados.conteudo, "Recebida");

        const mensagens = [
            {
                role: "system",
                content: `
Voce e uma assistente virtual de um escritorio de advocacia criminal.

Atenda somente o cliente atual: ${dados.cliente.nome} (id ${dados.idCliente}).
Use apenas o historico desta conversa.
Nunca misture nomes, fatos, documentos ou dados de outros clientes.

Faca apenas UMA pergunta por vez.

Colete:

- Nome
- Tipo do caso
- Ja teve audiencia?
- Ja possui sentenca?
- Onde esta preso?
- Ha quanto tempo esta preso?

Quando todas as informacoes forem coletadas, informe que a triagem foi concluida.
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
            messages: mensagens,
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
            return res.status(400).json({
                erro: "O campo 'idCliente' e obrigatorio e deve ser um numero inteiro.",
            });
        }

        const cliente = await buscarCliente(idCliente);

        if (!cliente) {
            return res.status(404).json({
                erro: "Cliente nao encontrado.",
                idCliente,
            });
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

        res.json({
            mensagem: "Historico apagado para o cliente informado.",
            idCliente,
        });
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao limpar historico.",
            detalhes: erro.message,
        });
    }
});

// =======================
// IMAGEM
// =======================

app.post("/chat/imagem", upload.single("imagem"), async (req, res) => {
    res.status(501).json({
        erro: "O modelo configurado atualmente nao possui suporte a imagens.",
    });
});

// =======================

app.listen(3000, () => {
   console.log("Servidor da Groq rodando na porta 3000!");
});