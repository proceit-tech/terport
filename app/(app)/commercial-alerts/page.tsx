import {
  Card,
  PageHeader,
  StatCard,
  StatusBadge,
  styles,
} from "@/components/prototype/PrototypeUi";

import { commercialAlerts } from "@/lib/prototype-v2-data";

export default function CommercialAlertsPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Comercial"
        title="Alertas Comerciales"
        description="Alertas automáticas para clientes desatendidos, compromisos vencidos y condiciones comerciales próximas a vencer."
      />

      <div className={styles.statsGrid}>
        <StatCard label="Alertas activas" value="12" />
        <StatCard label="Sin contacto" value="9" helper="Período configurado: 90 días" />
        <StatCard label="Acciones vencidas" value="6" />
        <StatCard label="Tarifas por vencer" value="5" />
      </div>

      <Card title="Alertas pendientes" subtitle="Seguimiento preventivo">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Detalle</th>
                <th>Prioridad</th>
                <th>Acción sugerida</th>
                <th>Gestionar</th>
              </tr>
            </thead>

            <tbody>
              {commercialAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.type}</td>
                  <td>{alert.client}</td>
                  <td>{alert.detail}</td>
                  <td>
                    <StatusBadge tone={alert.priority === "Alta" ? "danger" : "warning"}>
                      {alert.priority}
                    </StatusBadge>
                  </td>
                  <td>{alert.suggestedAction}</td>
                  <td>
                    <button type="button" className={styles.secondaryButton}>
                      Gestionar
                    </button>
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
