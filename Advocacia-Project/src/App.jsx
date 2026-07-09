// src/App.jsx
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import Login from "./pages/Login/Login";

// Importaremos as páginas que vamos construir a seguir
import Dashboard from "./pages/Dashboard/Dashboard";
import Relatorios from "./pages/Relatorios/Relatorios";

import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [telaAtiva, setTelaAtiva] = useState("dashboard");

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

  // Renderiza a página correta com base no estado da Sidebar
  const renderizarPagina = () => {
    switch (telaAtiva) {
      case "dashboard":
        return <Dashboard />;
      case "relatorios":
        return <Relatorios />;
      // As outras páginas (Conversas, Configurações) adicionaremos aqui conforme criarmos
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="container">
      {/* Passamos o estado atual e a função de navegação para a Sidebar */}
      <Sidebar telaAtiva={telaAtiva} setTelaAtiva={setTelaAtiva} />
      
      <main className="content">
        <Header />
        {renderizarPagina()}
      </main>
    </div>
  );
}

export default App;