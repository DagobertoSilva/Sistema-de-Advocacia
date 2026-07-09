import { useState } from "react";
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
  const [logado, setLogado] = useState(false);
  const [telaAtual, setTelaAtual] = useState("dashboard");

  if (!logado) {
    return <Login onLoginSuccess={() => setLogado(true)} />;
  }

  return (
    <div className="container">
      <Sidebar alterarTela={setTelaAtual} telaAtual={telaAtual} />
      <main className="content">
        <Header />
        
        {telaAtual === "dashboard" && (
          <div style={{ padding: "30px", background: "#f5f5f5" }}>
            <AtendimentosMes />
            <DistribuicaoCasos />
            <DesempenhoChatbot />
          </div>
        )}

        {telaAtual === "clientes" && <TabelaCasos />}

        {telaAtual === "conversas" && <Conversas />}
      </main>
    </div>
  );
}

export default App;