import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, AlertTriangle, CheckCheck } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalClientes: 0,
    totalTriagens: 0,
    conversasEmAndamento: 0,
    conversasEncerradas: 0
  });
  
  const [tableData, setTableData] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/dashboard/metricas')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar dados do dashboard');
        return res.json();
      })
      .then((data) => {
        setMetrics({
          totalClientes: data.totalClientes || 0,
          totalTriagens: data.totalTriagens || 0,
          conversasEmAndamento: data.conversasEmAndamento || 0,
          conversasEncerradas: data.conversasEncerradas || 0
        });
        setLoadingMetrics(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingMetrics(false);
      });

    // 2. Busca a lista de conversas ativas para filtrar as prioridades na tabela
    fetch('http://localhost:8080/api/conversas')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar casos do dashboard');
        return res.json();
      })
      .then((data) => {
        // Filtra para exibir apenas os casos urgentes ou que aguardam retorno do advogado
        const prioridades = data.filter(conv => 
          conv.cliente?.statusLead === "Emergencia_max" || 
          conv.cliente?.statusLead === "Aguardando_retorno"
        );
        setTableData(prioridades);
        setLoadingTable(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingTable(false);
      });
  }, []);

  // Conta dinamicamente quantos clientes na tabela geral possuem status urgente ou aguardando retorno
  const totalCasosUrgentesReal = tableData.length;

  const metricsData = [
    {
      title: "Total de Clientes",
      value: loadingMetrics ? "..." : metrics.totalClientes,
      icon: <Users size={24} className="icon-slate" />,
      bgClass: "bg-slate"
    },
    {
      title: "Conversas em Andamento",
      value: loadingMetrics ? "..." : metrics.conversasEmAndamento,
      icon: <MessageSquare size={24} className="icon-slate" />,
      bgClass: "bg-slate"
    },
    {
      title: "Casos Urgentes",
      value: loadingTable ? "..." : totalCasosUrgentesReal, 
      icon: <AlertTriangle size={24} className="icon-red" />,
      bgClass: "bg-red",
      textColor: "text-red"
    },
    {
      title: "Conversas Encerradas",
      value: loadingMetrics ? "..." : metrics.conversasEncerradas,
      icon: <CheckCheck size={24} className="icon-green" />,
      bgClass: "bg-green"
    }
  ];

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard de Atendimento</h2>
      
      <div className="metrics-grid">
        {metricsData.map((item, index) => (
          <div key={index} className="metric-card">
            <div className="metric-info">
              <span className="metric-title">{item.title}</span>
              <span className={`metric-value ${item.textColor || ''}`}>{item.value}</span>
            </div>
            <div className={`metric-icon-wrapper ${item.bgClass}`}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Casos por Prioridade</h3>
        </div>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Assunto</th>
                <th>Urgência</th>
                <th>Último Contato</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingTable ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Carregando casos...</td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Nenhum caso urgente pendente no momento.</td>
                </tr>
              ) : (
                tableData.map((row, index) => {
                  const nomeOriginal = row.cliente?.nome || `Lead #${row.cliente?.id || row.id}`;
                  const dataFormatada = row.dataInicio ? new Date(row.dataInicio).toLocaleDateString("pt-BR") : "Recente";
                  const isEmergencia = row.cliente?.statusLead === "Emergencia_max";

                  return (
                    <tr key={index}>
                      <td className="font-bold-cell">{nomeOriginal}</td>
                      <td>Triagem Chatbot</td>
                      <td>
                        <span className="status-badge badge-red">
                          ALTA
                        </span>
                      </td>
                      <td>{dataFormatada}</td>
                      <td>
                        {/* Tag estilizada dinamicamente conforme o status */}
                        <span 
                          className="status-badge" 
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;