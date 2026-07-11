import React, { useState, useEffect } from "react";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const token = localStorage.getItem("token");
        const resposta = await fetch("http://localhost:8080/api/clientes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!resposta.ok) throw new Error("Erro ao carregar dados do servidor.");
        
        const dados = await resposta.json();
        setClientes(dados);
        setClientesFiltrados(dados);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);

  const handlePesquisaChange = (e) => {
    const valor = e.target.value;
    setTermoPesquisa(valor);

    const filtrados = clientes.filter((c) =>
      (c.nome || "").toLowerCase().includes(valor.toLowerCase()) ||
      (c.numeroWhatsapp || "").includes(valor) ||
      (c.cpf || "").includes(valor)
    );
    setClientesFiltrados(filtrados);
  };

  if (carregando) {
    return <div style={{ padding: "30px", fontFamily: "sans-serif" }}>Carregando atendimentos...</div>;
  }

  return (
    <div style={{ padding: "24px 30px", minHeight: "100vh", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      
      <div style={{ marginBottom: "25px", maxWidth: "450px" }}>
        <input
          type="text"
          placeholder="Buscar cliente por nome, WhatsApp ou CPF..."
          value={termoPesquisa}
          onChange={handlePesquisaChange}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            outline: "none",
            fontSize: "0.95rem",
            backgroundColor: "#ffffff",
            boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.04)",
            transition: "all 0.2s ease"
          }}
        />
      </div>

      <div style={{
        background: "linear-gradient(to top, #ffffff 0%, #f1f5f9 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        overflow: "hidden",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(148, 163, 184, 0.22), 0 0 0 1px rgba(148, 163, 184, 0.12)"
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(148, 163, 184, 0.12)" }}>
          <h3 style={{ fontSize: "18px", color: "#1e293b", margin: "0", fontWeight: "700" }}>Casos e Leads Recentes</h3>
        </div>
        
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr>
                <th style={{ color: "#475569", fontSize: "13px", fontWeight: "600", padding: "14px 24px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid rgba(148, 163, 184, 0.12)" }}>CLIENTE</th>
                <th style={{ color: "#475569", fontSize: "13px", fontWeight: "600", padding: "14px 24px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid rgba(148, 163, 184, 0.12)" }}>WHATSAPP</th>
                <th style={{ color: "#475569", fontSize: "13px", fontWeight: "600", padding: "14px 24px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid rgba(148, 163, 184, 0.12)" }}>CPF</th>
                <th style={{ color: "#475569", fontSize: "13px", fontWeight: "600", padding: "14px 24px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid rgba(148, 163, 184, 0.12)" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => {
                const isEmergencia = cliente.statusLead === "Emergencia_max";
                const isTriagem = cliente.statusLead === "Em_triagem";
                
                return (
                  <tr key={cliente.id}>
                    <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(148, 163, 184, 0.06)", fontWeight: "600", color: "#0f172a" }}>
                      {cliente.nome}
                    </td>
                    <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(148, 163, 184, 0.06)", color: "#334155" }}>
                      {cliente.numeroWhatsapp}
                    </td>
                    <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(148, 163, 184, 0.06)", color: "#334155" }}>
                      {cliente.cpf || "Não Informado"}
                    </td>
                    <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(148, 163, 184, 0.06)" }}>
                      <span style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        display: "inline-block",
                        textTransform: "capitalize",
                        backgroundColor: isEmergencia ? "#fee2e2" : isTriagem ? "#fef3c7" : "#dcfce7",
                        color: isEmergencia ? "#ef4444" : isTriagem ? "#d97706" : "#16a34a"
                      }}>
                        {cliente.statusLead ? cliente.statusLead.replace("_", " ").toLowerCase() : "Sem Status"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "24px", color: "gray" }}>
                    Nenhum cliente correspondente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}