import {
  Card,
  PageHeader,
  StatusBadge,
  styles,
} from "@/components/prototype/PrototypeUi";

import { integrations } from "@/lib/prototype-v2-data";

export default function IntegrationsPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Administración"
        title="Integraciones"
        description="Estado de las interfaces externas y consistencia de datos maestros y operativos."
      />

      <div className={styles.notice}>
        Esta pantalla representa el prototipo funcional. Las sincronizaciones todavía no ejecutan procesos reales.
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
          marginTop: 18,
        }}
      >
        {integrations.map((integration) => (
          <Card
            key={integration.name}
            title={integration.name}
            subtitle="Integración externa"
          >
            <div className={styles.twoColumns}>
              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <span>Finalidad</span>
                  <strong>{integration.purpose}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span>Modo</span>
                  <strong>{integration.mode}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span>Última sincronización</span>
                  <strong>{integration.lastSync}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span>Pendientes</span>
                  <strong>{integration.pending}</strong>
                </div>
              </div>

              <div>
                <StatusBadge
                  tone={integration.status === "Operativo" ? "success" : "warning"}
                >
                  {integration.status}
                </StatusBadge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
