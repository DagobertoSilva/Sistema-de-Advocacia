import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Relatorios from "./pages/Relatorios/Relatorios";
import Conversas from "./components/Conversas/Conversas";
import TabelaCasos from "./components/TabelaCasos/TabelaCasos";
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
    }} />;
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
        return <TabelaCasos />;
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
      <main className={`content ${telaAtiva === "conversas" || telaAtiva === "dashboard" ? "content-conversas-limpo" : ""}`}>
        <Header />
        {renderizarPagina()}
      </main>
    </div>
  );
}

export default App;