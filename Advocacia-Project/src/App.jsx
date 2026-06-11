import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TabelaCasos from "./components/TabelaCasos";
import "./App.css";

function App() {
  return (
    <div className="container">
      <Sidebar />
      <main className="content">
        <Header />
        <TabelaCasos />
      </main>
    </div>
  );
}

export default App;