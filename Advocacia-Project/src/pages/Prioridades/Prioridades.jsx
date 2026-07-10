import React, { useState, useEffect } from 'react';

const Prioridades = () => {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/dashboard/casos-prioridade')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar os casos prioritários.');
        return res.json();
      })
      .then((data) => {
        setCasos(data);
        setLoading(false);
      })
      .catch((err) => {
        setErro(err.message);
        setLoading(false);
      });
  }, []);

  const obterEstiloUrgencia = (urgencia) => {
    switch (urgencia?.toUpperCase()) {
      case 'ALTA':
      case 'EMERGENCIA_MAX':
        return { bg: '#fee2e2', texto: '#ef4444', borda: '#fca5a5' };
      case 'MEDIA':
        return { bg: '#fef3c7', texto: '#d97706', borda: '#fcd34d' };
      default:
        return { bg: '#e0f2fe', texto: '#0284c7', borda: '#7dd3fc' };
    }
  };

  if (loading) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Carregando prioridades...</div>;
  if (erro) return <div style={{ padding: '20px', color: '#ef4444', fontFamily: 'sans-serif' }}>Erro: {erro}</div>;

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Cabeçalho da Tela */}
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 8px 0' }}>Fila de Prioridades</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
          Casos que necessitam de atenção imediata ou classificação emergencial.
        </p>
      </div>

      {/* Grid de Cards Provisórios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {casos.map((caso, index) => {
          const estilo = obterEstiloUrgencia(caso.urgencia || caso.nivelUrgencia);
          
          return (
            <div 
              key={index} 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                borderLeft: `6px solid ${estilo.texto}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'between'
              }}
            >
              {/* Topo do Card: Badge de Urgência */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                  📅 {caso.data || 'Prazo imediato'}
                </span>
                <span 
                  style={{
                    backgroundColor: estilo.bg,
                    color: estilo.texto,
                    border: `1px solid ${estilo.borda}`,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {caso.urgencia || 'ALTA'}
                </span>
              </div>

              {/* Corpo do Card: Informações */}
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '18px' }}>
                  {caso.cliente || 'Cliente não Identificado'}
                </h3>
                <p style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                  💼 {caso.assunto || 'Triagem de Atendimento'}
                </p>
                <div style={{ backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: '#64748b' }}>
                  <strong>Status Interno:</strong> {caso.status || 'Pendente'}
                </div>
              </div>

              {/* Rodapé do Card: Ações rápidas */}
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button 
                  onClick={() => alert(`Assumindo o caso de ${caso.cliente}`)}
                  style={{
                    flex: 1,
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Assumir Caso
                </button>
              </div>
            </div>
          );
        })}

        {casos.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#fff', borderRadius: '8px' }}>
            Nenhum caso prioritário pendente no momento.
          </div>
        )}
      </div>

    </div>
  );
};

export default Prioridades;