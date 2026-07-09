// src/App.jsx
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import Login from "./pages/Login/Login";

// Importações das páginas modulares
import Dashboard from "./pages/Dashboard/Dashboard";
import Relatorios from "./pages/Relatorios/Relatorios";
import Conversas from "./components/Conversas/Conversas"; // Mantendo o componente que o time criou

import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [telaAtiva, setTelaAtiva] = useState("dashboard");
  const [sidebarAberta, setSidebarAberta] = useState(true);

  // Monitora mudanças no localStorage para deslogar/logar dinamicamente
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Se não estiver autenticado, exibe obrigatoriamente a tela de Login
  if (!token) {
    return <Login />;
  }

  // Renderiza a página correta com base no estado da Sidebar (Unificando com as telas do time)
  const renderizarPagina = () => {
    switch (telaAtiva) {
      case "dashboard":
        return <Dashboard />;
      case "relatorios":
        return <Relatorios />;
      case "conversas":
        return <Conversas />;
      case "clientes":
      case "prioridades":
      case "configuracoes":
        return (
          <div style={{ padding: "30px", color: "#6b7280", textAlign: "center" }}>
            <h2>Tela de {telaAtiva.charAt(0).toUpperCase() + telaAtiva.slice(1)}</h2>
            <p>Esta funcionalidade está sendo desenvolvida pelo time.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`container ${sidebarAberta ? 'sidebar-visivel' : 'sidebar-recolhida'}`}>
      {/* Sidebar recebendo as propriedades de navegação e colapso solicitadas pelo time */}
      <Sidebar 
        telaAtiva={telaAtiva} 
        setTelaAtiva={setTelaAtiva} 
        sidebarAberta={sidebarAberta} 
        setSidebarAberta={setSidebarAberta} 
      />
      
      <main className="content">
        <Header />
        {renderizarPagina()}
      </main>
    </div>
  );
}

export default App;