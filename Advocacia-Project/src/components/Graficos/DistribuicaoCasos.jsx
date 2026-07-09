// src/components/Graficos/DistribuicaoCasos.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./DistribuicaoCasos.css";

function DistribuicaoCasos({ dados }) {
  return (
    <div className="card-distribuicao">
      <h2>Distribuição por Tipo de Caso</h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={dados}>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={true}
            stroke="#d9d9d9"
          />

          <XAxis dataKey="tipo" />
          <YAxis />

          <Bar
            dataKey="quantidade"
            fill="#071d49"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DistribuicaoCasos;