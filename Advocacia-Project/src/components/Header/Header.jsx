import React, { useState, useEffect, useRef } from 'react';
import { Bell, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  
  // Criamos uma referência para o container da área de notificações
  const areaNotificacaoRef = useRef(null);

  // 1. Efeito para fechar o menu ao clicar fora dele
  useEffect(() => {
    const manipularCliqueExterno = (event) => {
      // Se a área de notificações existir e o clique NÃO foi dentro dela, fecha o menu
      if (areaNotificacaoRef.current && !areaNotificacaoRef.current.contains(event.target)) {
        setMostrarMenu(false);
      }
    };

    // Adiciona o escutador de eventos no documento global
    document.addEventListener('mousedown', manipularCliqueExterno);
    
    // Limpa o escutador quando o componente for desmontado para evitar vazamento de memória
    return () => {
      document.removeEventListener('mousedown', manipularCliqueExterno);
    };
  }, []);

  // 2. Monitora novas interações vindas do backend (Polling de 10s)
  useEffect(() => {
    const checarNovidades = () => {
      fetch('http://localhost:8080/api/conversas')
        .then((res) => res.json())
        .then((data) => {
          const novasNotificacoes = [];
          data.forEach(conv => {
            if (conv.cliente?.statusLead === "Emergencia_max") {
              novasNotificacoes.push(
                <span>
                  <strong>Caso Urgente:</strong> {conv.cliente?.nome || 'Novo Lead'}
                </span>);
            }
          });
          
          if (novasNotificacoes.length > 0) {
            setNotificacoes(novasNotificacoes);
          }
        })
        .catch((err) => console.error("Erro ao checar notificações:", err));
    };

    checarNovidades();
    const interval = setInterval(checarNovidades, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header" style={{ marginBottom: "25px", position: "relative" }}>
      <div className="search-placeholder-vazio"></div> 

      {/* Envolvemos o botão e o menu na ref para sabermos o que faz parte da "área" */}
      <div className="user-area" ref={areaNotificacaoRef}>
        
        {/* Botão do Sino */}
        <button 
          className="icon-button" 
          onClick={() => setMostrarMenu(!mostrarMenu)} 
          style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Bell size={20} color="#1e293b" />
          {notificacoes.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: '#ef4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              borderRadius: '50%',
              padding: '2px 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {notificacoes.length}
            </span>
          )}
        </button>

        {/* Menu de Notificações Pop-over */}
        {mostrarMenu && (
          <div style={{
            position: 'absolute',
            top: '50px',
            right: '180px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            width: '260px',
            zIndex: 100,
            padding: '10px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
              Notificações
            </h4>
            {notificacoes.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Nenhuma novidade no momento.</p>
            ) : (
              notificacoes.map((notif, idx) => (
                <div key={idx} style={{ padding: '6px 0', fontSize: '12px', color: '#475569', borderBottom: idx !== notificacoes.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  {notif}
                </div>
              ))
            )}
          </div>
        )}

        {/* Informações do Dr. Alexandre Bezerra */}
        <div className="user-info">
          <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>Dr. Alexandre Bezerra</p>
          <span>Advogado</span>
        </div>
        <div className="avatar">
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>AB</span>
        </div>
      </div>
    </header>
  );
};

export default Header;