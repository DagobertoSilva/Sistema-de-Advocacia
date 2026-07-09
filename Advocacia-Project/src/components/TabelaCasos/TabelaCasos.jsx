// src/components/TabelaCasos/TabelaCasos.jsx
import { useState, useEffect } from "react";

export default function TabelaCasos() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const buscarClientesDoBackend = async () => {
      try {
        const token = localStorage.getItem("token"); // Recupera o token do login

        const resposta = await fetch("http://localhost:8080/api/clientes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Envia o token de autenticação
          }
        });

        if (!resposta.ok) {
          throw new Error("Erro ao buscar dados de clientes do servidor.");
        }

        const dados = await resposta.json();
        setClientes(dados); // Preenche o estado com a lista real do banco
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarClientesDoBackend();
  }, []);

  if (carregando) return <div style={{ padding: "20px" }}>Carregando atendimentos...</div>;
  if (erro) return <div style={{ padding: "20px", color: "red" }}>Erro: {erro}</div>;

  return (
    <div className="table-card">
      <h2>Casos e Leads Recentes</h2>

      <table>
        <thead>
          <tr>
            <th>CLIENTE</th>
            <th>WHATSAPP</th>
            <th>CPF</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td><strong>{cliente.nome}</strong></td>
              <td>{cliente.numeroWhatsapp}</td>
              <td>{cliente.cpf || "Não Informado"}</td>
              <td>
                <span
                  className={`badge ${
                    cliente.statusLead === "Emergencia_max"
                      ? "alta"
                      : cliente.statusLead === "Em_triagem"
                      ? "media"
                      : "baixa"
                  }`}
                >
                  {cliente.statusLead ? cliente.statusLead.replace("_", " ") : "Sem Status"}
                </span>
              </td>
            </tr>
          ))}
          {clientes.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", color: "gray" }}>
                Nenhum cliente cadastrado no banco de dados ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}