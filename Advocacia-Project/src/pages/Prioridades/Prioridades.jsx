import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, UserCheck } from 'lucide-react';
import './Prioridades.css';

const Prioridades = () => {
  const [casosUrgentes, setCasosUrgentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarCasosUrgentes = () => {
    fetch('http://localhost:8080/api/conversas')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar dados do servidor');
        return res.json();
      })
      .then((data) => {
        const filtrados = data.filter(conv => 
          conv.cliente?.statusLead === "Emergencia_max" || 
          conv.cliente?.statusLead === "Aguardando_retorno"
        );
        setCasosUrgentes(filtrados);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro na fila de prioridades:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    buscarCasosUrgentes();
    const interval = setInterval(buscarCasosUrgentes, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="prioridades-container">
      <div className="prioridades-header-page">
        <div className="title-area">
          <ShieldAlert size={28} className="title-icon" />
          <div>
            <h2>Fila de Prioridades Críticas</h2>
            <p>Casos em triagem de emergência criminal ou aguardando assunção imediata por um advogado.</p>
          </div>
        </div>
        <div className="counter-badge-total">
          {casosUrgentes.length} {casosUrgentes.length === 1 ? 'caso pendente' : 'casos pendentes'}
        </div>
      </div>

      <div className="cards-wrapper">
        {loading ? (
          <div className="prioridades-state-msg">Carregando triagens prioritárias...</div>
        ) : casosUrgentes.length === 0 ? (
          <div className="prioridades-state-msg empty">
            Nenhum caso crítico ou urgência pendente no sistema.
          </div>
        ) : (
          <div className="legal-table-wrapper">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>CLIENTE / LEAD</th>
                  <th>ASSUNTO</th>
                  <th>DATA DE ENTRADA</th>
                  <th>ESTÁGIO DA TRIAGEM</th>
                  <th>AÇÃO JURÍDICA</th>
                </tr>
              </thead>
              <tbody>
                {casosUrgentes.map((row, index) => {
                  const nomeCliente = row.cliente?.nome || `Lead #${row.cliente?.id || row.id}`;
                  const dataFormatada = row.dataInicio ? new Date(row.dataInicio).toLocaleDateString("pt-BR") : "Recente";
                  const isEmergencia = row.cliente?.statusLead === "Emergencia_max";

                  return (
                    <tr key={index}>
                      <td className="client-name-cell">
                        <div className="avatar-letter">
                          {nomeCliente.charAt(0).toUpperCase()}
                        </div>
                        <strong>{nomeCliente}</strong>
                      </td>
                      <td>Triagem Chatbot</td>
                      <td className="date-cell">
                        <div className="date-with-icon">
                          <Clock size={14} />
                          {dataFormatada}
                        </div>
                      </td>
                      <td>
                        {/* Tag discreta com as cores que você escolheu */}
                        <span 
                          className="legal-badge" 
                          style={{ 
                            backgroundColor: isEmergencia ? "#fee2e2" : "#f1f5f9", 
                            color: isEmergencia ? "#ef4444" : "#000000",
                            fontWeight: "700",
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            display: "inline-block"
                          }}
                        >
                          {isEmergencia ? "EMERGÊNCIA" : "AGUARDANDO"}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="action-btn-legal"
                          onClick={() => alert(`Direcionando para o atendimento de ${nomeCliente}`)}
                        >
                          <UserCheck size={14} />
                          Assumir Caso
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prioridades;