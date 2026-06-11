import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TabelaCasos from "./components/TabelaCasos";
import Login from "./components/Login";
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
  return <Login />;
}

export default App;