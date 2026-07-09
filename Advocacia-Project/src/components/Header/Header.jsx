// src/components/Header/Header.jsx
import { Search, Bell } from "lucide-react";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Pesquisar clientes, casos ou assuntos..."
        />
      </div>

      <div className="user-area">
        <Bell size={22} style={{ cursor: 'pointer', color: '#6b6375' }} />
       
        <div className="user-info">
          <strong>Dr. Alexandre Bezerra</strong>
          <span>Advogado</span>
        </div>

        <div className="avatar">AB</div>
      </div>
    </header>
  );
}