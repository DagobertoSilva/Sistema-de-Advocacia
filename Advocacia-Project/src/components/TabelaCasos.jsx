
const casos = [
  {
    cliente: "Maria Silva",
    assunto: "Ação Trabalhista - Rescisão Indireta",
    urgencia: "Alta",
    contato: "22/05/2026",
    status: "Em Andamento"
  },
  {
    cliente: "Carlos Souza",
    assunto: "Revisão de Contrato Comercial",
    urgencia: "Alta",
    contato: "21/05/2026",
    status: "Aguardando"
  },
  {
    cliente: "Ana Costa",
    assunto: "Divórcio Consensual",
    urgencia: "Média",
    contato: "20/05/2026",
    status: "Em Andamento"
  },
  {
    cliente: "Pedro Santos",
    assunto: "Inventário e Partilha",
    urgencia: "Média",
    contato: "19/05/2026",
    status: "Aguardando"
  },
  {
    cliente: "Juliana Lima",
    assunto: "Consultoria Empresarial",
    urgencia: "Baixa",
    contato: "18/05/2026",
    status: "Concluído"
  }
];

export default function TabelaCasos() {
  return (
    <div className="table-card">
      <h2>Casos por Prioridade</h2>

      <table>
        <thead>
          <tr>
            <th>CLIENTE</th>
            <th>ASSUNTO</th>
            <th>URGÊNCIA</th>
            <th>ÚLTIMO CONTATO</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {casos.map((caso, index) => (
            <tr key={index}>
              <td>{caso.cliente}</td>
              <td>{caso.assunto}</td>

              <td>
                <span
                  className={`badge ${
                    caso.urgencia === "Alta"
                      ? "alta"
                      : caso.urgencia === "Média"
                      ? "media"
                      : "baixa"
                  }`}
                >
                  {caso.urgencia}
                </span>
              </td>

              <td>{caso.contato}</td>
              <td>{caso.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}