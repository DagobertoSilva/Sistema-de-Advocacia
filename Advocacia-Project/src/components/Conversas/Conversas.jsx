import React, { useState, useEffect } from "react";
import { MessageSquare, FileText, Calendar, ShieldAlert, Copy, Check } from "lucide-react";
import "./Conversas.css";

const UTILIZAR_BACKEND_REAL = true;

// MOCK
const mockClientes = [
    { id: 1, nome: "João Silva", area: "Direito Trabalhista", urgencia: "Alta", data: "Hoje" },
    { id: 2, nome: "Maria Oliveira", area: "Direito de Família", urgencia: "Normal", data: "Ontem" },
    { id: 3, nome: "Carlos Souza", area: "Direito Civil", urgencia: "Alta", data: "28/06/2026" }
];

const mockResumos = {
    1: {
        contexto: "Cliente relata demissão sem justa causa e falta de pagamento de horas extras nos últimos 2 anos.",
        pontosChave: ["Trabalho noturno sem adicional", "Férias vencidas não pagas", "Testemunhas disponíveis"],
        documentos: "Contrato de trabalho, holerites (últimos 6 meses), registro de ponto.",
        proximaAcao: "Preparar petição inicial para reclamação trabalhista."
    },
    2: {
        contexto: "Processo de divórcio litigioso e disputa de guarda de menores.",
        pontosChave: ["Desacordo sobre pensão alimentícia", "Bens a partilhar (imóvel e carro)"],
        documentos: "Certidão de casamento, certidão de nascimento dos filhos, escritura do imóvel.",
        proximaAcao: "Agendar reunião para mediação de acordo antes da audiência."
    },
    3: {
        contexto: "Disputa contratual por prestação de serviços não concluída por empreiteira.",
        pontosChave: ["Atraso de 4 meses na obra", "Pagamento de 70% já efetuado", "Danos materiais relatados"],
        documentos: "Contrato de prestação de serviços, comprovantes de PIX, fotos da obra inacabada.",
        proximaAcao: "Enviar notificação extrajudicial para a empreiteira."
    }
};


export default function Conversas() {
    const [clientes, setClientes] = useState([]);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [resumoIA, setResumoIA] = useState(null);
    const [carregandoClientes, setCarregandoClientes] = useState(true);
    const [carregandoResumo, setCarregandoResumo] = useState(false);
    const [copiado, setCopiado] = useState(false);

    const API_BASE_URL = "http://localhost:8080/api";


    useEffect(() => {
        setCarregandoClientes(true);
        if (UTILIZAR_BACKEND_REAL) {
            fetch(`${API_BASE_URL}/clientes`)
                .then((res) => {
                    if (!res.ok) throw new Error("Erro ao buscar clientes");
                    return res.json();
                })
                .then((data) => {
                    const lista = Array.isArray(data) ? data : data.content || [];
                    setClientes(lista);
                    if (lista.length > 0) setClienteSelecionado(lista[0]);
                })
                .catch((err) => console.error("Erro no fetch de clientes:", err))
                .finally(() => setCarregandoClientes(false));
        } else {
            // Usando mock
            setTimeout(() => {
                setClientes(mockClientes);
                if (mockClientes.length > 0) setClienteSelecionado(mockClientes[0]);
                setCarregandoClientes(false);
            }, 800);
        }
    }, []);

    useEffect(() => {
        const idCliente = clienteSelecionado?.id;
        if (!idCliente) return;

        setCarregandoResumo(true);
        setResumoIA(null);

        if (UTILIZAR_BACKEND_REAL) {
            fetch(`${API_BASE_URL}/conversas/cliente/${idCliente}`)
                .then((res) => {
                    if (!res.ok) {
                        return fetch(`${API_BASE_URL}/chat/resumo/${idCliente}`).then(r => r.json());
                    }
                    return res.json();
                })
                .then((data) => setResumoIA(data))
                .catch((err) => console.error("Erro ao buscar o resumo da IA:", err))
                .finally(() => setCarregandoResumo(false));
        } else {
            setTimeout(() => {
                setResumoIA(mockResumos[idCliente] || null);
                setCarregandoResumo(false);
            }, 600);
        }
    }, [clienteSelecionado]);

    const lidarComCopia = () => {
        if (!resumoIA || !clienteSelecionado) return;
        const textoResumo = `
            Resumo de Atendimento Jurídico
            Cliente: ${clienteSelecionado.nome} (${clienteSelecionado.area || "Geral"})
            Contexto: ${resumoIA.contexto || resumoIA.contextoGeral || ""}
            Documentos citados: ${resumoIA.documentos || ""}
        `.trim();

        navigator.clipboard.writeText(textoResumo);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const extrairPontosChave = (dados) => {
        if (!dados) return [];
        const pontos = dados.pontosChave || dados.pontos_chave || dados.pontosImportantes || dados.conteudo;
        if (Array.isArray(pontos)) return pontos;
        if (typeof pontos === "string") return pontos.split("\n").filter(p => p.trim() !== "");
        return [];
    };

    return (
        <div className="conversas-container">
            <div className="sidebar-conversas">
                <div className="sidebar-header">
                    <h2>Histórico de Conversas</h2>
                    <p>Resumos integrados (IA)</p>
                </div>

                <div className="lista-clientes">
                    {carregandoClientes ? (
                        <div className="status-container">Carregando clientes...</div>
                    ) : clientes.length === 0 ? (
                        <div className="status-container">Nenhum cliente encontrado.</div>
                    ) : (
                        clientes.map((c) => {
                            const id = c.id || c.id_cliente;
                            const nome = c.nome || "Cliente Sem Nome";
                            const area = c.area || c.tipoCaso || "Geral";
                            const urgencia = c.urgencia || c.prioridade || "Normal";
                            const dataExibicao = c.data || c.dataCriacao || "Recente";

                            return (
                                <div
                                    key={id}
                                    className={`item-cliente ${clienteSelecionado?.id === id ? "ativo" : ""}`}
                                    onClick={() => setClienteSelecionado(c)}
                                >
                                    <div className="card-cliente-linha">
                                        <span className="cliente-nome">{nome}</span>
                                        <span className="cliente-data">{dataExibicao}</span>
                                    </div>
                                    <div className="cliente-sublinha">
                                        <span className="cliente-area">{area}</span>
                                        <span className={`badge-status ${urgencia.toLowerCase() === "alta" || urgencia.toLowerCase() === "altamente urgente" ? "badge-urgente" : "badge-normal"}`}>
                                            {urgencia}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="painel-resumo">
                {carregandoResumo ? (
                    <div className="status-container">Carregando resumo da IA...</div>
                ) : resumoIA ? (
                    <>
                        <div className="painel-header">
                            <div>
                                <h1>{clienteSelecionado?.nome || "Cliente"}</h1>
                                <div className="painel-meta">
                                    <span>{clienteSelecionado?.area || clienteSelecionado?.tipoCaso || "Geral"}</span>
                                    <span>{clienteSelecionado?.data || "Histórico"}</span>
                                </div>
                            </div>
                            <button className="btn-copiar" onClick={lidarComCopia}>
                                {copiado ? <><Check size={16} style={{ marginRight: 6 }} /> Copiado</> : <><Copy size={16} style={{ marginRight: 6 }} /> Copiar Resumo</>}
                            </button>
                        </div>

                        <div className="conteudo-resumo">
                            <div className="bloco-contexto">
                                <h3>Contexto Geral do Atendimento</h3>
                                <p>{resumoIA.contexto || resumoIA.contextoGeral || resumoIA.descricao || "Nenhum contexto gerado para esta conversa."}</p>
                            </div>

                            <div className="secao-pontos">
                                <h3>Pontos Importantes Coletados</h3>
                                <ul>
                                    {extrairPontosChave(resumoIA).length > 0 ? (
                                        extrairPontosChave(resumoIA).map((ponto, idx) => <li key={idx}>{ponto}</li>)
                                    ) : (
                                        <li>Nenhum ponto de destaque extraído.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="bloco-documentos">
                                <h3>Documentos Citados/Disponíveis</h3>
                                <p>{resumoIA.documentos || resumoIA.documentosDisponiveis || "Nenhum documento anexado ou citado nesta conversa."}</p>
                            </div>

                            <div className="bloco-acao">
                                <h3>Próxima Ação Sugerida</h3>
                                <p>{resumoIA.proximaAcao || resumoIA.proxima_acao || "Aguardando definição da próxima etapa processual."}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="status-container">Selecione um cliente para visualizar o resumo da IA.</div>
                )}
            </div>
        </div>
    );
}
