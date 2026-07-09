// src/components/Graficos/DesempenhoChatbot.jsx
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
//import "./DesempenhoChatbot.css";

const COLORS = ["#031E4B", "#4A86F7"];

export default function DesempenhoChatbot({ dados }) {
  // Monta a estrutura mapeada dinamicamente com base nas props
  const data = [
    { name: "Resolvido", value: dados.resolvidos || 0 },
    { name: "Encaminhado", value: dados.encaminhados || 0 }
  ];

  const total = data[0].value + data[1].value;
  const porcentagemResolvidos = total > 0 ? Math.round((data[0].value / total) * 100) : 0;

  return (
    <div className="card-performance">
      <h2>Desempenho do Chatbot</h2>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={1}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="label-resolvido">
          Resolvido: {data[0].value}
        </div>

        <div className="label-encaminhado">
          Encaminhado: {data[1].value}
        </div>
      </div>

      <p className="performance-desc">
        {porcentagemResolvidos}% dos atendimentos foram solucionados sem intervenção humana direta.
      </p>
    </div>
  );
}