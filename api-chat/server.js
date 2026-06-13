require("dotenv").config();

const express = require("express");
const multer = require("multer");
const Groq = require("groq-sdk");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        servico: "api-chat",
        groqConfigurada: Boolean(process.env.GROQ_API_KEY),
    });
});

const upload = multer({
    storage: multer.memoryStorage(),
});

// Cliente da Groq
const ia = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

function verificarGroqConfigurada(res) {
    if (process.env.GROQ_API_KEY) {
        return true;
    }

    res.status(503).json({
        erro: "GROQ_API_KEY nao configurada.",
        detalhes: "Crie um arquivo .env na raiz do projeto e reinicie o container api-chat.",
    });

    return false;
}

// Histórico da conversa
const historico = [];

// =======================
// ROTA DE TEXTO
// =======================

app.post("/chat/texto", async (req, res) => {
    try {
        if (!verificarGroqConfigurada(res)) {
            return;
        }

        const { pergunta } = req.body;

        if (!pergunta) {
            return res.status(400).json({
                erro: "O campo 'pergunta' e obrigatorio.",
            });
        }

        const resposta = await ia.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: pergunta,
                },
            ],
        });

        res.status(200).json({
    resposta: resposta.choices[0].message.content,
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

        const { mensagem } = req.body;

        if (!mensagem) {
            return res.status(400).json({
                erro: "O campo 'mensagem' e obrigatorio.",
            });
        }

        historico.push({
            role: "user",
            content: mensagem,
        });

        const mensagens = [
            {
                role: "system",
                content: `
Você é uma assistente virtual de um escritório de advocacia criminal.

Faça apenas UMA pergunta por vez.

Colete:

- Nome
- Tipo do caso
- Já teve audiência?
- Já possui sentença?
- Onde está preso?
- Há quanto tempo está preso?

Quando todas as informações forem coletadas, informe que a triagem foi concluída.
                `,
            },

            ...historico,
        ];

        const resposta = await ia.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: mensagens,
        });

        historico.push({
            role: "assistant",
            content: resposta.choices[0].message.content,
        });

        res.status(200).json({
    resposta: resposta.choices[0].message.content,
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
// LIMPAR HISTÓRICO
// =======================

app.post("/chat/limpar", (req, res) => {

    historico.length = 0;

    res.json({
        mensagem: "Histórico apagado.",
    });

});

// =======================
// IMAGEM
// =======================

// Atenção:
// Nem todos os modelos da Groq aceitam imagens.
// Se sua conta não suportar visão computacional,
// esta rota retornará erro.

app.post("/chat/imagem", upload.single("imagem"), async (req, res) => {

    res.status(501).json({
        erro: "O modelo configurado atualmente não possui suporte a imagens.",
    });

});

// =======================

app.listen(3000, () => {

    console.log("Servidor da Groq rodando na porta 3000!");

});
