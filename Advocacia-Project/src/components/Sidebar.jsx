import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileText,
  AlertCircle,
  Settings,
  LogOut,
  ChevronLeft,
  Menu
} from "lucide-react";

import "./Sidebar.css"

export default function Sidebar({ setTelaAtiva, telaAtiva, sidebarAberta, setSidebarAberta }) {
  return (
    <>
      {!sidebarAberta && (
        <button className="btn-menu-mobile" onClick={() => setSidebarAberta(true)}>
          <Menu size={24} />
        </button>
      )}
      <aside className={`sidebar ${sidebarAberta ? "aberta" : "fechada"}`}>
        <div className="sidebar-topo">
          <h2>{sidebarAberta ? "Sistema Jurídico" : "SJ"}</h2>
          {/* Botão de Recolher */}
          <button className="btn-toggle" onClick={() => setSidebarAberta(!sidebarAberta)}>
            <ChevronLeft size={20} style={{ transform: sidebarAberta ? "rotate(0deg)" : "rotate(180deg)" }} />
          </button>
        </div>

        <nav>
          {/* Dashboard / Relatórios */}
          <a
            className={telaAtiva === "relatorios" ? "active" : ""}
            onClick={() => setTelaAtiva("relatorios")}
            style={{ cursor: "pointer" }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>

          {/* Conversas */}
          <a
            className={telaAtiva === "conversas" ? "active" : ""}
            onClick={() => setTelaAtiva("conversas")}
            style={{ cursor: "pointer" }}
          >
            <MessageSquare size={20} />
            <span>Conversas</span>
          </a>

          {/* Clientes */}
          <a
            className={telaAtiva === "clientes" ? "active" : ""}
            onClick={() => setTelaAtiva("clientes")}
            style={{ cursor: "pointer" }}
          >
            <Users size={20} />
            <span>Clientes</span>
          </a>

          {/* Relatórios (também aponta pro Dashboard de gráficos) */}
          <a
            className={telaAtiva === "relatorios" ? "active" : ""}
            onClick={() => setTelaAtiva("relatorios")}
            style={{ cursor: "pointer" }}
          >
            <FileText size={20} />
            <span>Relatórios</span>
          </a>

          {/* Prioridades */}
          <a
            className={telaAtiva === "prioridades" ? "active" : ""}
            onClick={() => setTelaAtiva("prioridades")}
            style={{ cursor: "pointer" }}
          >
            <AlertCircle size={20} />
            <span>Prioridades</span>
          </a>

          {/* Configurações */}
          <a
            className={telaAtiva === "configuracoes" ? "active" : ""}
            onClick={() => setTelaAtiva("configuracoes")}
            style={{ cursor: "pointer" }}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </a>
        </nav>

        <button className="logout">
          <LogOut size={18} />
          {sidebarAberta && <span>Sair</span>}
        </button>
      </aside>

      {sidebarAberta && <div className="sidebar-overlay" onClick={() => setSidebarAberta(false)}></div>}

    </>
  );
}