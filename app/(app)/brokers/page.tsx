import {
  Card,
  PageHeader,
  StatCard,
  StatusBadge,
  styles,
} from "@/components/prototype/PrototypeUi";

import { brokers } from "@/lib/prototype-v2-data";

export default function BrokersPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Comercial"
        title="Despachantes"
        description="Consulta de despachantes asociados a clientes y condiciones de crédito relacionadas."
      />

      <div className={styles.statsGrid}>
        <StatCard label="Despachantes activos" value="42" />
        <StatCard label="Clientes vinculados" value="126" />
        <StatCard label="Crédito vía despachante" value="18" />
        <StatCard label="Condiciones a revisar" value="3" />
      </div>

      <Card title="Despachantes" subtitle="Condiciones comerciales">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Razón social</th>
                <th>RUC</th>
                <th>Clientes</th>
                <th>Tipo de crédito</th>
                <th>Días</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {brokers.map((broker) => (
                <tr key={broker.code}>
                  <td>{broker.code}</td>
                  <td>{broker.name}</td>
                  <td>{broker.ruc}</td>
                  <td>{broker.clients}</td>
                  <td>{broker.creditType}</td>
                  <td>{broker.creditDays}</td>
                  <td>
                    <StatusBadge tone="success">{broker.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
