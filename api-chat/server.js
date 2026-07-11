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
    return isNaN(idCliente) ? null : idCliente;
}

async function buscarCliente(idCliente) {
    const resultado = await db.query(
        "SELECT id_cliente, nome, status_lead FROM cliente WHERE id_cliente = $1",
        [idCliente],
    );
    return resultado.rows[0] || null;
}

async function garantirConversaAtiva(idCliente) {
    // Ajustado de data_criacao para data_inicio conforme especificado no init.sql
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
    // Mapeado com uma string para o papel para evitar conflitos com palavras reservadas
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

const TEXTO_ENCERRAMENTO_PADRAO = "Perfeito! Informo que a triagem foi concluída com sucesso. Seus dados e relatórios foram salvos no painel. Por favor, feche esta aba e aguarde, pois um de nossos advogados entrará em contato em breve para dar o retorno.";

// =======================
// FLUXO DE TRIAGEM PRINCIPAL
// =======================

app.post("/chat/triagem", async (req, res) => {
    try {
        if (!verificarGroqConfigurada(res)) return;

        const idCliente = obterIdCliente(req.body);
        const conteudoMensagem = req.body.mensagem || req.body.conteudo;

        if (!idCliente || !conteudoMensagem) {
            return res.status(400).json({
                erro: "Os campos 'idCliente' (inteiro) e 'mensagem' ou 'conteudo' sao obrigatorios.",
            });
        }

        const cliente = await buscarCliente(idCliente);
        if (!cliente) {
            return res.status(404).json({ erro: "Cliente nao encontrado.", idCliente: idCliente });
        }

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

CLASSIFICAÇÃO DE RISCO:
- Defina "urgente" como true se o usuário relatar prisão em andamento, flagrante ou detenção recente. Caso contrário, false.

Sua resposta DEVE ser estritamente este JSON válido, sem markdown ou blocos de código adicionais:
{
  "mensagemParaOCliente": "Sua próxima pergunta para preencher o checklist ou o texto padrão de encerramento",
  "nomeConfirmadoESalvar": "Nome limpo se confirmado, senão null",
  "urgente": true ou false,
  "coletaFinalizada": true ou false
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

        await salvarMensagemNoBanco(idConversa, "assistant", textoParaCliente);

        if (nomeCapturado && nomeCapturado.toLowerCase() !== "null") {
            await db.query("UPDATE cliente SET nome = $1 WHERE id_cliente = $2", [
                nomeCapturado,
                idCliente,
            ]);
            console.log(`[DATABASE] Nome atualizado para: ${nomeCapturado}`);
        }

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
                "UPDATE cliente SET status_lead = 'Encerrado' WHERE id_cliente = $1 AND status_lead != 'Emergencia_max'",
                [idCliente],
            );
        }

        res.json({
            resposta: textoParaCliente,
            idCliente: idCliente,
            idConversa: idConversa,
            urgente: ehUrgente,
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
// IMAGEM (Nao suportado)
// =======================

app.post("/chat/imagem", upload.single("imagem"), async (req, res) => {
    res.status(501).json({ erro: "O modelo configurado atualmente nao possui suporte a imagens." });
});

// =======================

app.listen(3000, () => {
    console.log("Servidor da Groq API-Chat rodando com sucesso na porta 3000.");
});