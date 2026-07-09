Sidebar.jsx
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileText,
  AlertCircle,
  Settings,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Sistema Jurídico</h2>

      <nav>
        <a>
          <LayoutDashboard size={20} />
          Dashboard
        </a>

        <a>
          <MessageSquare size={20} />
          Conversas
        </a>

        <a  className="active">
          <Users size={20} />
          Clientes
        </a>

        <a>
          <FileText size={20} />
          Relatórios
        </a>

        <a>
          <AlertCircle size={20} />
          Prioridades
        </a>

        <a>
          <Settings size={20} />
          Configurações
        </a>
      </nav>

      <button className="logout">
        <LogOut size={18} />
        Sair
      </button>
    </aside>
  );
}