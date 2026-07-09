import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import "./DistribuicaoCasos.css";

const dados = [
  { tipo: "Trabalhista", quantidade: 36 },
  { tipo: "Civil", quantidade: 28 },
  { tipo: "Empresarial", quantidade: 20 },
  { tipo: "Família", quantidade: 17 },
];

function DistribuicaoCasos() {
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