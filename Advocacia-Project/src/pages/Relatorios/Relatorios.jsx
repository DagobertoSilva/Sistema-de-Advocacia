// src/pages/Relatorios/Relatorios.jsx
import { useState, useEffect } from "react";
import AtendimentosMes from "../../components/Graficos/AtendimentosMes";
import DistribuicaoCasos from "../../components/Graficos/DistribuicaoCasos";
import DesempenhoChatbot from "../../components/Graficos/DesempenhoChatbot";

export default function Relatorios() {
  const [metricas, setMetricas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const buscarMetricasDoBackend = async () => {
      try {
        const token = localStorage.getItem("token");

        // Chamando seu endpoint centralizado de métricas na porta 8080
        const resposta = await fetch("http://localhost:8080/api/dashboard/metricas", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!resposta.ok) {
          throw new Error("Erro ao carregar os relatórios estatísticos.");
        }

        const dados = await resposta.json();
        setMetricas(dados);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarMetricasDoBackend();
  }, []);

  if (carregando) return <div style={{ padding: "30px" }}>Carregando relatórios estatísticos...</div>;
  if (erro) return <div style={{ padding: "30px", color: "red" }}>Erro: {erro}</div>;

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "30px", background: "#f5f6fa", minHeight: "100vh" }}>
      
      {/* Gráfico de Linha / Área */}
      <div>
        <AtendimentosMes dados={metricas?.dadosMensais || []} />
      </div>

      {/* Bloco Lado a Lado para os outros dois gráficos */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "450px" }}>
          <DistribuicaoCasos dados={metricas?.distribuicaoCrimes || []} />
        </div>
        
        <div style={{ flex: "1", minWidth: "450px" }}>
          <DesempenhoChatbot dados={metricas?.eficienciaBot || { resolvidos: 0, encaminhados: 0 }} />
        </div>
      </div>

    </div>
  );
}