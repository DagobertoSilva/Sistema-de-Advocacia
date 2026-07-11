import React, { useState, useEffect } from "react";
import { MessageSquare, User, Clock, AlertCircle } from "lucide-react";
import "./Conversas.css";

const UTILIZAR_BACKEND_REAL = true;

export default function Conversas() {
    const [conversas, setConversas] = useState([]);
    const [conversasFiltradas, setConversasFiltradas] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [historicoMensagens, setHistoricoMensagens] = useState([]);
    const [carregandoMensagens, setCarregandoMensagens] = useState(false);

    useEffect(() => {
        if (!UTILIZAR_BACKEND_REAL) return;

        const carregarCasosEConversas = () => {
            fetch("http://localhost:8080/api/conversas")
                .then((res) => res.json())
                .then((data) => {
                    const formatadas = data.map((conv) => {
                        let nomeOriginal = conv.cliente?.nome || "";
                        let nomeLimpo = `Lead #${conv.cliente?.id || conv.id}`;

                        if (nomeOriginal && nomeOriginal !== "Novo Lead - Whats" && !nomeOriginal.startsWith("Lead #")) {
                            let textoTratado = nomeOriginal;
                            let textoMinusculo = textoTratado.toLowerCase();

                            if (textoMinusculo.includes("meu nome é")) {
                                textoTratado = textoTratado.substring(textoMinusculo.indexOf("meu nome é") + 10).trim();
                            } else if (textoMinusculo.includes("meu nome e")) {
                                textoTratado = textoTratado.substring(textoMinusculo.indexOf("meu nome e") + 10).trim();
                            } else if (textoMinusculo.includes("me chamo")) {
                                textoTratado = textoTratado.substring(textoMinusculo.indexOf("me chamo") + 8).trim();
                            }

                            if (textoTratado.includes(".")) textoTratado = textoTratado.split(".")[0].trim();
                            if (textoTratado.includes(",")) textoTratado = textoTratado.split(",")[0].trim();

                            let palavras = textoTratado.split(/\s+/);
                            if (palavras.length > 0) {
                                nomeLimpo = palavras[0];
                                if (palavras.length > 1) {
                                    nomeLimpo += " " + palavras[1];
                                }
                            }
                        }
                        const assuntoReal = conv.cliente?.assuntoTipificado || "Triagem Chatbot";

                        return {
                            id: conv.id,
                            id_cliente: conv.cliente?.id || conv.id,
                            nome: nomeLimpo,
                            whatsapp: conv.cliente?.numeroWhatsapp || "Sem número",
                            area: assuntoReal,
                            urgencia: (conv.cliente?.statusLead === "Emergencia_max" || assuntoReal === "Roubo" || assuntoReal === "Roubo de Veículo" || assuntoReal === "Tráfico"|| assuntoReal === "preso em flagrante") ? "Alta" : "Normal",
                            data: conv.dataInicio ? new Date(conv.dataInicio).toLocaleDateString("pt-BR") : "Recente"
                        };
                    });
                    
                    setConversas(formatadas);
                    
                    if (!termoPesquisa) {
                        setConversasFiltradas(formatadas);
                    }
                })
                .catch((err) => console.error("Erro ao buscar conversas:", err));
        };

        carregarCasosEConversas();

        const intervaloAtalizacao = setInterval(carregarCasosEConversas, 5000);

        return () => clearInterval(intervaloAtalizacao);
    }, [termoPesquisa]); 

    const handlePesquisaChange = (e) => {
        const valor = e.target.value;
        setTermoPesquisa(valor);
        
        const filtradas = conversas.filter((cliente) =>
            cliente.nome.toLowerCase().includes(valor.toLowerCase()) ||
            cliente.whatsapp.includes(valor)
        );
        setConversasFiltradas(filtradas);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const filtradas = conversas.filter((cliente) =>
                cliente.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                cliente.whatsapp.includes(termoPesquisa)
            );
            setConversasFiltradas(filtradas);
        }
    };

    const handleSelecionarCliente = (cliente) => {
        if (clienteSelecionado && clienteSelecionado.id === cliente.id) {
            setClienteSelecionado(null);
            setHistoricoMensagens([]);
            return;
        }

        setClienteSelecionado(cliente);
        setCarregandoMensagens(true);

        fetch(`http://localhost:8080/api/chat/clientes/${cliente.id_cliente}/mensagens`)
            .then((res) => res.json())
            .then((mensagens) => {
                setHistoricoMensagens(mensagens);
                setCarregandoMensagens(false);
            })
            .catch((err) => {
                console.error("Erro ao buscar mensagens reais:", err);
                setHistoricoMensagens([]);
                setCarregandoMensagens(false);
            });
    };

    return (
        <div className="conversas-container">
            <div className="sidebar-conversas">
                <div className="search-bar-container">
                    <input
                        type="text"
                        className="busca-input-sidebar"
                        placeholder="Buscar por nome ou WhatsApp..."
                        value={termoPesquisa}
                        onChange={handlePesquisaChange}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div className="sidebar-header">
                    <h2>Mensagens e Casos</h2>
                    <p>{conversasFiltradas.length} interações encontradas</p>
                </div>
                <div className="lista-clientes">
                    {conversasFiltradas.map((cliente) => (
                        <div
                            key={cliente.id}
                            className={`item-cliente ${clienteSelecionado?.id === cliente.id ? "active" : ""}`}
                            onClick={() => handleSelecionarCliente(cliente)}
                        >
                            <div className="cliente-header">
                                <div className="cliente-identificacao">
                                    <span className="cliente-nome">{cliente.nome}</span>
                                    <span className="cliente-whatsapp">{cliente.whatsapp}</span>
                                </div>
                                <span className="cliente-data">{cliente.data}</span>
                            </div>
                            <div className="cliente-info-secundaria">
                                <span className="cliente-area">{cliente.area}</span>
                                <span className={`badge-urgencia ${cliente.urgencia === "Alta" ? "alta" : "normal"}`}>
                                    {cliente.urgencia}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="conteudo-conversas">
                {carregandoMensagens ? (
                    <div className="status-container loader">
                        <div className="spinner"></div>
                        <p>Carregando histórico do WhatsApp...</p>
                    </div>
                ) : clienteSelecionado ? (
                    <div className="chat-real-wrapper">
                        <div className="conversa-header-detalhe">
                            <div className="user-profile-summary">
                                <div className="avatar-placeholder">
                                    <User size={22} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2>{clienteSelecionado.nome}</h2>
                                    <p>WhatsApp: {clienteSelecionado.whatsapp} | Linha do Tempo da Triagem</p>
                                </div>
                            </div>
                        </div>

                        <div className="historico-chat-box">
                            {historicoMensagens.length > 0 ? (
                                historicoMensagens.map((msg, idx) => {
                                    const remetenteTexto = (msg.remetente || msg.tipo || "").toUpperCase();
                                    const IsCliente = remetenteTexto === "CLIENTE";
                                    
                                    return (
                                        <div key={idx} className={`chat-row ${IsCliente ? "row-cliente" : "row-bot"}`}>
                                            <div className="mensagem-wrapper">
                                                <span className="remetente-identificador">
                                                    {IsCliente ? clienteSelecionado.nome : "Assistente Virtual"}
                                                </span>
                                                <div className="balao-mensagem">
                                                    <p>{msg.conteudo || msg.texto || msg.mensagem}</p>
                                                    <span className="chat-hora">
                                                        <Clock size={10} /> {msg.dataEnvio ? new Date(msg.dataEnvio).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'}) : "Agora"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="sem-mensagens">
                                    <AlertCircle size={32} />
                                    <p>Nenhuma mensagem de texto registrada para este lead nas tabelas de histórico.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="status-container empty-state">
                        <MessageSquare size={48} strokeWidth={1.5} />
                        <h3>Nenhum chat aberto</h3>
                        <p>Selecione um cliente na barra lateral para auditar a transcrição completa das mensagens trocadas com o bot.</p>
                    </div>
                )}
            </div>
        </div>
    );
}