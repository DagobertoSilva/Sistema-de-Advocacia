import React, { useState, useEffect } from "react";

export default function Configuracoes() {
  const [nomeAdvogado, setNomeAdvogado] = useState("");
  const [oab, setOab] = useState("");
  const [promptIA, setPromptIA] = useState("");
  const [botAtivo, setBotAtivo] = useState(true);
  const [carregando, setCarregando] = useState(true);

  // Busca as configurações reais salvas no banco de dados
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        const token = localStorage.getItem("token");
        const resposta = await fetch("http://localhost:8080/api/configuracoes", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resposta.ok) {
          const dados = await resposta.json();
          setNomeAdvogado(dados.nomeAdvogado || "Dr. Alexandre Bezerra");
          setOab(dados.oab || "OAB/CE 99.999");
          setPromptIA(dados.promptIA || "");
          setBotAtivo(dados.botAtivo ?? true);
        }
      } catch (err) {
        console.error("Erro ao buscar configurações:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarConfiguracoes();
  }, []);

  // Envia as alterações reais para salvar no banco de dados
  const salvarConfiguracoes = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const resposta = await fetch("http://localhost:8080/api/configuracoes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ nomeAdvogado, oab, promptIA, botAtivo })
      });

      if (resposta.ok) {
        alert("Configurações salvas e aplicadas com sucesso!");
        // Dispara um evento para avisar o Header que o nome mudou no banco
        window.dispatchEvent(new Event("perfilAtualizado"));
      } else {
        alert("Erro ao salvar no servidor.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor.");
    }
  };

  if (carregando) {
    return <div style={{ padding: "30px", fontFamily: "sans-serif" }}>Carregando configurações...</div>;
  }

  return (
    <div style={{ padding: "24px 30px", minHeight: "100vh", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <form onSubmit={salvarConfiguracoes} style={{ display: "flex", flexDirection: "column", gap: "25px", maxWidth: "800px" }}>
        
        <div style={{
          background: "linear-gradient(to top, #ffffff 0%, #f1f5f9 100%)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          padding: "24px",
          boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(148, 163, 184, 0.22)"
        }}>
          <h3 style={{ fontSize: "18px", color: "#1e293b", margin: "0 0 20px 0", fontWeight: "700" }}>Configurações do Assistente (IA)</h3>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <input 
              type="checkbox" 
              id="statusBot"
              checked={botAtivo} 
              onChange={(e) => setBotAtivo(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="statusBot" style={{ fontSize: "15px", color: "#334155", fontWeight: "600", cursor: "pointer" }}>
              Chatbot Ativo no WhatsApp
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Instruções de Comportamento do Bot (Prompt):</label>
            <textarea 
              value={promptIA}
              onChange={(e) => setPromptIA(e.target.value)}
              rows="4"
              placeholder="Instruções gerais do robô..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "0.95rem",
                backgroundColor: "#ffffff",
                resize: "vertical",
                boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.04)"
              }}
            />
          </div>
        </div>

        <div style={{
          background: "linear-gradient(to top, #ffffff 0%, #f1f5f9 100%)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          padding: "24px",
          boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(148, 163, 184, 0.22)"
        }}>
          <h3 style={{ fontSize: "18px", color: "#1e293b", margin: "0 0 20px 0", fontWeight: "700" }}>Perfil e Conta</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Nome do Profissional:</label>
              <input 
                type="text" 
                value={nomeAdvogado}
                onChange={(e) => setNomeAdvogado(e.target.value)}
                style={{
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  outline: "none",
                  fontSize: "0.95rem",
                  backgroundColor: "#ffffff",
                  boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.04)"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Inscrição OAB:</label>
              <input 
                type="text" 
                value={oab}
                onChange={(e) => setOab(e.target.value)}
                style={{
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  outline: "none",
                  fontSize: "0.95rem",
                  backgroundColor: "#ffffff",
                  boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.04)"
                }}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          style={{
            alignSelf: "flex-start",
            padding: "12px 28px",
            background: "#061d49",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(6, 29, 73, 0.2)"
          }}
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}