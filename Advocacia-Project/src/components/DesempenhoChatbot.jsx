import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Resolvido", value: 68 },
  { name: "Encaminhado", value: 32 }
];

const COLORS = ["#031E4B", "#4A86F7"];

export default function ChatbotPerformanceCard() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "700px",
        minHeight: "420px",
      }}
    >
      <h2
        style={{
          fontSize: "28px",
          fontWeight: "500",
          color: "#1f2937",
          marginBottom: "30px",
        }}
      >
        Desempenho do Chatbot
      </h2>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "280px",
        }}
      >
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
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Rótulos */}
        <div
          style={{
            position: "absolute",
            top: "1%",
            left: "18%",
            color: "#031E4B",
            fontSize: "24px",
            fontWeight: "500",
          }}
        >
          Resolvido: 68%
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "1%",
            right: "12%",
            color: "#4A86F7",
            fontSize: "24px",
            fontWeight: "500",
          }}
        >
          Encaminhado: 32%
        </div>
      </div>
      <br /><br />

      <p
        style={{
          textAlign: "center",
          color: "#6B7280",
          fontSize: "18px",
          marginTop: "20px",
        }}
      >
        68% dos casos foram resolvidos automaticamente pelo chatbot
      </p>
    </div>
  );
}