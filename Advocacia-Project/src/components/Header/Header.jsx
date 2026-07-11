import React, { useState, useEffect, useRef } from 'react';
import { Bell, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [perfil, setPerfil] = useState({ nomeAdvogado: "Carregando...", oab: "" });
  const areaNotificacaoRef = useRef(null);

  // Função para buscar os dados de perfil do backend
  const carregarDadosPerfil = () => {
    const token = localStorage.getItem("token");
    fetch('http://localhost:8080/api/configuracoes', {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setPerfil({
          nomeAdvogado: data.nomeAdvogado || "Dr. Alexandre Bezerra",
          oab: data.oab || "OAB/CE 99.999"
        });
      })
      .catch(() => {
        setPerfil({ nomeAdvogado: "Dr. Alexandre Bezerra", oab: "OAB/CE 99.999" });
      });
  };

  useEffect(() => {
    carregarDadosPerfil();

    // Escuta quando a página de configurações salvar algo para recarregar o cabeçalho
    window.addEventListener("perfilAtualizado", carregarDadosPerfil);
    
    const manipularCliqueExterno = (event) => {
      if (areaNotificacaoRef.current && !areaNotificacaoRef.current.contains(event.target)) {
        setMostrarMenu(false);
      }
    };
    document.addEventListener('mousedown', manipularCliqueExterno);
    
    return () => {
      window.removeEventListener("perfilAtualizado", carregarDadosPerfil);
      document.removeEventListener('mousedown', manipularCliqueExterno);
    };
  }, []);

  useEffect(() => {
    const checarNovidades = () => {
      fetch('http://localhost:8080/api/conversas')
        .then((res) => res.json())
        .then((data) => {
          const novasNotificacoes = [];
          data.forEach(conv => {
            if (conv.cliente?.statusLead === "Emergencia_max" || conv.cliente?.statusLead === "Aguardando_retorno") {
              const tipoStatus = conv.cliente?.statusLead === "Emergencia_max" ? "Emergência" : "Aguardando";
              novasNotificacoes.push({
                id: conv.id,
                texto: `${tipoStatus}: ${conv.cliente?.nome || 'Novo Lead'}`
              });
            }
          });
          setNotificacoes(novasNotificacoes);
        })
        .catch((err) => console.error(err));
    };

    checarNovidades();
    const interval = setInterval(checarNovidades, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header-right-aligned">
      <div className="user-area">
        <div 
          className="notification-icon" 
          ref={areaNotificacaoRef} 
          onClick={() => setMostrarMenu(!mostrarMenu)}
          style={{ position: 'relative', cursor: 'pointer', marginRight: '15px' }}
        >
          <Bell size={24} color="gray" />
          {notificacoes.length > 0 && (
            <span className="notification-badge" style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {notificacoes.length}
            </span>
          )}
        </div>

        {mostrarMenu && (
          <div style={{
            position: 'absolute',
            top: '65px',
            right: '210px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            width: '280px',
            zIndex: 999,
            padding: '14px',
            maxHeight: '350px',
            overflowY: 'auto'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#061d49', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', fontWeight: '700' }}>
              Notificações de Urgência
            </h4>
            {notificacoes.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '10px 0' }}>Nenhuma novidade no momento.</p>
            ) : (
              notificacoes.map((notif, idx) => (
                <div key={idx} style={{ padding: '8px 4px', fontSize: '12px', color: '#334155', borderBottom: idx !== notificacoes.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  {notif.texto}
                </div>
              ))
            )}
          </div>
        )}

        <div className="user-info">
          <strong>{perfil.nomeAdvogado}</strong>
          <span>{perfil.oab ? perfil.oab : "Criminalista"}</span>
        </div>
        <div className="avatar">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

export default Header;