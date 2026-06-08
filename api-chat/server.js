const express = require("express");
const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const upload = multer({ storage: multer.memoryStorage() });

//Esta SEM A CHAVE DA APIKEY, POIS NÃO PODE SUBIR COM A CHAVE PARA O GITHUB
const ia = new GoogleGenAI({
    apiKey: "",
});

//HISTORICO DE CONVERSA COM UM CLIENTE
const historico = [];

//ROTA DE TEXTO
app.post("/chat/texto", async (req, res) => {
    try {
        const { pergunta } = req.body;
        const response = await ia.models.generateContent({
            model: "gemini-2.5-flash",
            contents: pergunta,
        });

        res.status(200).json({ resposta: response.text });
    } catch (error){
        console.error(error);
        res.status(500).json({ erro: "Erro na comunicação com a IA." });
    }
});

//ROTA DE TRIAGEM
app.post("/chat/triagem", async (req, res) => {
    try {

        const { mensagem } = req.body;

        historico.push(`Cliente: ${mensagem}`);

        const prompt = `
Você é uma assistente virtual de um escritório de advocacia criminal.

Faça apenas uma pergunta por vez.

Informações necessárias:

- Nome
- Tipo do caso
- Já teve audiência?
- Já possui sentença?
- Onde está preso?
- Há quanto tempo está preso?

Quando terminar a coleta, informe que a triagem foi concluída.
`;

        const conversaCompleta = `
${prompt}

${historico.join("\n")}
`;

        const response = await ia.models.generateContent({
            model: "gemini-2.5-flash",
            contents: conversaCompleta
        });

        historico.push(`IA: ${response.text}`);

        res.status(200).json({
            resposta: response.text
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro na triagem."
        });
    }
});

//LIMPAR HISTORICO
app.post("/chat/limpar", (req, res) => {

    historico.length = 0;

    res.json({
        mensagem: "Histórico apagado."
    });

});

//ROTA DE IMAGEM
app.post("/chat/imagem", upload.single("imagem"), async (req, res) => {
    try{
        const imagemBuffer = req.file.buffer;
        const tipoImagem = req.file.mimetype;
        const pergunta = req.body.pergunta;


        const response = await ia.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    inlineData: {
                        data: imagemBuffer.toString("base64"),
                        mimeType: tipoImagem,
                    },
                },
                pergunta,
            ],
        });

      res.status(200).json({ resposta: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao processar a imagem." });
    }
});

app.listen(3000, () => {
    console.log("Servidor do Gemini rodando na porta 3000!")
});