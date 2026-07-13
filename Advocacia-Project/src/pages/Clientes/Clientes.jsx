import React, { useState, useEffect } from "react";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroServico, setFiltroServico] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");

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

  useEffect(() => {
    let resultado = clientes;

    if (termoPesquisa) {
      const valor = termoPesquisa.toLowerCase();
      resultado = resultado.filter((c) =>
        (c.nome || "").toLowerCase().includes(valor) ||
        (c.numeroWhatsapp || "").includes(valor) ||
        (c.cpf || "").includes(valor)
      );
    }

    if (filtroStatus) {
      resultado = resultado.filter(c => c.statusLead === filtroStatus);
    }

    if (filtroServico) {
      resultado = resultado.filter(c => 
        String(c.servicoJuridico_id) === filtroServico || 
        String(c.servicoJuridicoId) === filtroServico
      );
    }

    if (filtroPerfil) {
      resultado = resultado.filter(c => 
        c.grau_escolaridade === filtroPerfil || 
        c.perfil === filtroPerfil
      );
    }

    setClientesFiltrados(resultado);
  }, [termoPesquisa, filtroStatus, filtroServico, filtroPerfil, clientes]);

  if (carregando) {
    return <div style={{ padding: "30px", fontFamily: "sans-serif" }}>Carregando atendimentos...</div>;
  }

  return (
    <div style={{ padding: "24px 30px", minHeight: "100vh", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Buscar cliente por nome, WhatsApp ou CPF..."
          value={termoPesquisa}
          onChange={(e) => setTermoPesquisa(e.target.value)}
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
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", backgroundColor: "white", cursor: "pointer", fontSize: "0.95rem" }}
        >
          <option value="">Todos os Status</option>
          <option value="Em_triagem">Em Triagem</option>
          <option value="Emergencia_max">Emergência Máxima</option>
          <option value="Aguardando_retorno">Aguardando Retorno</option>
          <option value="Contrato_fechado">Contrato Fechado</option>
          <option value="Encerrado">Encerrado</option>
        </select>

        <select
          value={filtroServico}
          onChange={(e) => setFiltroServico(e.target.value)}
          style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", backgroundColor: "white", cursor: "pointer", fontSize: "0.95rem" }}
        >
          <option value="">Todos os Serviços</option>
          <option value="1">Prisão em Flagrante</option>
          <option value="2">Habeas Corpus</option>
          <option value="3">Acompanhamento Processual</option>
        </select>

        <select
          value={filtroPerfil}
          onChange={(e) => setFiltroPerfil(e.target.value)}
          style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", backgroundColor: "white", cursor: "pointer", fontSize: "0.95rem" }}
        >
          <option value="">Todos os Perfis</option>
          <option value="Ensino Fundamental">Ensino Fundamental</option>
          <option value="Ensino Médio">Ensino Médio</option>
          <option value="Ensino Superior">Ensino Superior</option>
        </select>
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