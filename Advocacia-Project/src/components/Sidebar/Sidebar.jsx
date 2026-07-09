// src/components/Sidebar/Sidebar.jsx
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileText,
  AlertCircle,
  Settings,
  LogOut
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar({ telaAtiva, setTelaAtiva }) {
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload(); // Recarrega para voltar para a tela de login
  };

  return (
    <aside className="sidebar">
      <h2>Sistema Jurídico</h2>

      <nav>
        <a 
          className={telaAtiva === "dashboard" ? "active" : ""} 
          onClick={() => setTelaAtiva("dashboard")}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </a>

        <a 
          className={telaAtiva === "conversas" ? "active" : ""} 
          onClick={() => setTelaAtiva("conversas")}
        >
          <MessageSquare size={20} />
          Conversas
        </a>

        <a 
          className={telaAtiva === "clientes" ? "active" : ""} 
          onClick={() => setTelaAtiva("clientes")}
        >
          <Users size={20} />
          Clientes
        </a>

        <a 
          className={telaAtiva === "relatorios" ? "active" : ""} 
          onClick={() => setTelaAtiva("relatorios")}
        >
          <FileText size={20} />
          Relatórios
        </a>

        <a 
          className={telaAtiva === "prioridades" ? "active" : ""} 
          onClick={() => setTelaAtiva("prioridades")}
        >
          <AlertCircle size={20} />
          Prioridades
        </a>

        <a 
          className={telaAtiva === "configuracoes" ? "active" : ""} 
          onClick={() => setTelaAtiva("configuracoes")}
        >
          <Settings size={20} />
          Configurações
        </a>
      </nav>

      <button className="logout" onClick={handleLogout}>
        <LogOut size={18} />
        Sair
      </button>
    </aside>
  );
}