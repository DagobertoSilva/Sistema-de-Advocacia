import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TabelaCasos from "./components/TabelaCasos";
import Login from "./components/Login";
import AtendimentosMes from "./components/AtendimentosMes";
import DistribuicaoCasos from "./components/DistribuicaoCasos";
import DesempenhoChatbot from "./components/DesempenhoChatbot";
import Conversas from "./components/Conversas";
import "./App.css";

function App() {
  const [telaAtiva, setTelaAtiva] = useState("relatorios");

  const [sidebarAberta, setSidebarAberta] = useState(true);


  return (
    <div className={`container ${sidebarAberta ? 'sidebar-visivel' : 'sidebar-recolhida'}`}>

      <Sidebar setTelaAtiva={setTelaAtiva} telaAtiva={telaAtiva} sidebarAberta={sidebarAberta} setSidebarAberta={setSidebarAberta} />

      <main className="content">
        <Header />
        {telaAtiva === "relatorios" && (
          <>
            <div style={{ padding: "30px", background: "#f5f5f5" }}>
              <AtendimentosMes />
            </div>

            <div style={{ padding: "30px", background: "#f5f5f5", minHeight: "100vh" }}>
              <DistribuicaoCasos />
            </div>

            <div>
              <DesempenhoChatbot />
            </div>
          </>
        )}

        {/* TELA 2: CONVERSAS (Nossa nova tela de Resumos de IA) */}
        {telaAtiva === "conversas" && (
          <Conversas />
        )}

        {telaAtiva === "clientes" && (
          <div style={{ padding: "30px", color: "#6b7280", textAlign: "center" }}>
            <h2>Tela de Clientes</h2>
            <p>Esta funcionalidade está sendo desenvolvida pelo time.</p>
          </div>
        )}

        {telaAtiva === "prioridades" && (
          <div style={{ padding: "30px", color: "#6b7280", textAlign: "center" }}>
            <h2>Tela de Prioridades</h2>
            <p>Esta funcionalidade está sendo desenvolvida pelo time.</p>
          </div>
        )}

        {telaAtiva === "configuracoes" && (
          <div style={{ padding: "30px", color: "#6b7280", textAlign: "center" }}>
            <h2>Configurações</h2>
            <p>Esta funcionalidade está sendo desenvolvida pelo time.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;