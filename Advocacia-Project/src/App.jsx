import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TabelaCasos from "./components/TabelaCasos";
import Login from "./components/Login";
import AtendimentosMes from "./components/AtendimentosMes";
import DistribuicaoCasos from "./components/DistribuicaoCasos";
import DesempenhoChatbot from "./components/DesempenhoChatbot";
import "./App.css";

function App() {
 /* return (
    <div className="container">
      <Sidebar />
      <main className="content">
        <Header />
        <TabelaCasos />
      </main>
    </div>
  );*/   // Descomentar para chamar a página cliente

  //Chamando a página do Login
  //return <Login />;
 
  /*return (
      /*<div className="container">
      <Sidebar />
      <main className="content">
        <Header />
        <div style={{ padding: "30px", background: "#f5f5f5" }}>
      <AtendimentosMes />
    </div>
      </main>
    </div>
  );*/

  //chamaando Relatorios
  return (
    <div className="container">
      <Sidebar />
      <main className="content">
        <Header />
        <div style={{ padding: "30px", background: "#f5f5f5" }}>
      <AtendimentosMes />
    </div>

    <div
      style={{
        padding: "30px",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <DistribuicaoCasos />
    </div>

    <div>
      <DesempenhoChatbot />
    </div>
      </main>
    </div>
  );



}

export default App;