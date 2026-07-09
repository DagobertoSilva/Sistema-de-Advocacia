// src/components/Graficos/AtendimentosMes.jsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./AtendimentosMes.css";

function AtendimentosMes({ dados }) {
  return (
    <div className="card-atendimentos">
      <h2>Atendimentos por Mês</h2>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={dados}>
          <defs>
            <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b1f44" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#0b1f44" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={true}
            stroke="#d9d9d9"
          />

          <XAxis dataKey="mes" />
          <YAxis />

          <Area
            type="monotone"
            dataKey="atendimentos"
            stroke="#0b1f44"
            strokeWidth={3}
            fill="url(#colorAtendimentos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AtendimentosMes;