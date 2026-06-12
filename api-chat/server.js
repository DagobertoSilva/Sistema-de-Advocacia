require("dotenv").config();

const express = require("express");
const multer = require("multer");
const Groq = require("groq-sdk");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const upload = multer({
    storage: multer.memoryStorage(),
});

// Cliente da Groq
const ia = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Histórico da conversa
const historico = [];

// =======================
// ROTA DE TEXTO
// =======================

app.post("/chat/texto", async (req, res) => {
    try {
        const { pergunta } = req.body;

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
        });
    }
});

// =======================
// TRIAGEM
// =======================

app.post("/chat/triagem", async (req, res) => {

    try {

        const { mensagem } = req.body;

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