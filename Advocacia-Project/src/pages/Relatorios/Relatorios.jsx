// src/pages/Relatorios/Relatorios.jsx
import { useState, useEffect } from "react";

export default function Relatorios() {
  const [triagens, setTriagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  
  // State para controlar qual card está aberto
  const [cardAberto, setCardAberto] = useState(null);

  useEffect(() => {
    const buscarDadosDoBackend = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        const resTriagens = await fetch("http://localhost:8080/api/clientes/relatorios/triagens", { 
          method: "GET", 
          headers 
        });
        
        if (!resTriagens.ok) {
          throw new Error("Não foi possível carregar os relatórios de triagem.");
        }

        const dadosTriagens = await resTriagens.json();
        setTriagens(dadosTriagens);
      } catch (err) {
        setErro("Erro ao carregar dados do painel: " + err.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosDoBackend();
  }, []);

  const alternarCard = (id) => {
    setCardAberto(cardAberto === id ? null : id);
  };

  if (carregando) return <div style={{ padding: "30px" }}>Carregando relatórios de triagem...</div>;
  if (erro) return <div style={{ padding: "30px", color: "red" }}>Erro: {erro}</div>;

  return (
    <div style={{ padding: "30px", background: "#f5f6fa", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 5px 0", color: "#2f3640", fontSize: "24px" }}>
          Relatórios Jurídicos Analíticos
        </h2>
        <p style={{ margin: "0 0 25px 0", color: "#7f8c8d", fontSize: "14px" }}>
          Clique sobre o cliente para expandir e visualizar o resumo dos fatos coletados pelo chatbot.
        </p>

        {triagens.length === 0 ? (
          <div style={{ background: "#fff", padding: "40px", borderRadius: "8px", textAlign: "center", color: "#7f8c8d", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            Nenhum relatório de triagem finalizado ou disponível no momento.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {triagens.map((cliente) => {
              const estaAberto = cardAberto === cliente.id;
              
              return (
                <div 
                  key={cliente.id} 
                  style={{ 
                    background: "#fff", 
                    borderRadius: "8px", 
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    borderLeft: cliente.statusLead === "Emergencia_max" ? "6px solid #e74c3c" : "6px solid #3498db",
                    overflow: "hidden",
                    transition: "all 0.3s ease"
                  }}
                >
                  {/* Cabeçalho do Card - Área Clicável */}
                  <div 
                    onClick={() => alternarCard(cliente.id)}
                    style={{ 
                      padding: "20px", 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      cursor: "pointer",
                      userSelect: "none",
                      background: estaAberto ? "#fcfcfd" : "#fff",
                      transition: "background 0.3s ease"
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 5px 0", color: "#2c3e50", fontSize: "17px", fontWeight: "600" }}>
                        {cliente.nome}
                      </h3>
                      <span style={{ fontSize: "13px", color: "#7f8c8d" }}>
                        📞 {cliente.numeroWhatsapp || "Sem WhatsApp"}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <span style={{ background: "#f1f2f6", color: "#2c3e50", fontWeight: "bold", fontSize: "12px", padding: "6px 14px", borderRadius: "20px" }}>
                        ⚖️ {cliente.assuntoTipificado || "Triagem Chatbot"}
                      </span>
                      
                      <span style={{ 
                        background: cliente.statusLead === "Emergencia_max" ? "#fce4e4" : "#e3f2fd", 
                        color: cliente.statusLead === "Emergencia_max" ? "#c0392b" : "#0d47a1", 
                        fontWeight: "bold", 
                        fontSize: "11px", 
                        padding: "5px 10px", 
                        borderRadius: "4px"
                      }}>
                        {cliente.statusLead?.replace("_", " ")}
                      </span>

                      {/* Seta com transição de rotação */}
                      <span style={{ 
                        fontSize: "14px", 
                        color: "#7f8c8d", 
                        transform: estaAberto ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                        display: "inline-block"
                      }}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Container Animado - O segredo do deslizamento está aqui */}
                  <div style={{ 
                    maxHeight: estaAberto ? "500px" : "0px", 
                    opacity: estaAberto ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                    background: "#fcfcfd"
                  }}>
                    <div style={{ 
                      padding: "0 20px 20px 20px", 
                      borderTop: "1px solid #f1f2f6" 
                    }}>
                      <div style={{ marginTop: "15px" }}>
                        <h4 style={{ margin: "0 0 8px 0", color: "#34495e", fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          🔍 Resumo Analítico dos Fatos (IA Groq):
                        </h4>
                        <p style={{ 
                          margin: "0", 
                          color: "#475569", 
                          fontSize: "15px", 
                          lineHeight: "1.6", 
                          background: "#fff", 
                          padding: "18px", 
                          borderRadius: "6px", 
                          border: "1px solid #e2e8f0",
                          whiteSpace: "pre-line"
                        }}>
                          {cliente.resumoFatos || "Nenhum fato detalhado foi coletado para este cliente ainda."}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}