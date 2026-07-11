import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Relatorios from "./pages/Relatorios/Relatorios";
import Conversas from './pages/Conversas/Conversas';
import Clientes from "./pages/Clientes/Clientes";
import Prioridades from "./pages/Prioridades/Prioridades";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [telaAtiva, setTelaAtiva] = useState("dashboard");
  const [sidebarAberta, setSidebarAberta] = useState(true);

  useEffect(() => {
    const jaLimpouEstaSessao = sessionStorage.getItem("limpeza_inicial");

    if (!jaLimpouEstaSessao) {
      localStorage.removeItem("token");
      setToken(null);
      sessionStorage.setItem("limpeza_inicial", "true");
    }

    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!token) {
    return <Login onLoginSuccess={(fakeToken) => {
      localStorage.setItem("token", fakeToken || "logado");
      setToken(fakeToken || "logado");
    }} />
  }

  const renderizarPagina = () => {
    switch (telaAtiva) {
      case "dashboard":
        return <Dashboard />;
      case "relatorios":
        return <Relatorios />;
      case "conversas":
        return <Conversas />;
      case "clientes":
        return <Clientes />;
      case "prioridades": 
        return <Prioridades />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`container ${sidebarAberta ? 'sidebar-visivel' : 'sidebar-recolhida'}`}>
      <Sidebar 
        telaAtiva={telaAtiva} 
        setTelaAtiva={setTelaAtiva} 
        sidebarAberta={sidebarAberta} 
        setSidebarAberta={setSidebarAberta} 
      />
      <main className="content">
        <Header sidebarAberta={sidebarAberta} setSidebarAberta={setSidebarAberta} />
        <div className="page-content">
          {renderizarPagina()}
        </div>
      </main>
    </div>
  );
}

export default App;