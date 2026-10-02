import {
  Card,
  PageHeader,
  StatCard,
  styles,
} from "@/components/prototype/PrototypeUi";

export default function ReportsPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Reportes"
        title="Gestión Comercial"
        description="Indicadores de cumplimiento, próximas acciones, resultados de oportunidad y clientes sin seguimiento."
      />

      <div className={styles.statsGrid}>
        <StatCard label="Cumplimiento semanal" value="86%" helper="Contactados / agendados" />
        <StatCard label="Acciones vencidas" value="6" helper="Compromisos sin completar" />
        <StatCard label="Oportunidades activas" value="34" />
        <StatCard label="Clientes sin contacto" value="9" helper="Más de 90 días" />
      </div>

      <div className={styles.threeColumns}>
        <Card title="Cumplimiento por representante" subtitle="Agenda">
          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span>Salma Doldán</span>
              <strong>89%</strong>
            </div>
            <div className={styles.metaItem}>
              <span>María López</span>
              <strong>82%</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Carlos Vera</span>
              <strong>75%</strong>
            </div>
          </div>
        </Card>

        <Card title="Próximas acciones" subtitle="Tipo">
          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span>Preparar presupuesto / proforma</span>
              <strong>18</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Seguimiento de propuesta</span>
              <strong>21</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Solicitar descuento</span>
              <strong>8</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Agendar reunión</span>
              <strong>12</strong>
            </div>
          </div>
        </Card>

        <Card title="Resultado comercial" subtitle="Oportunidades">
          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span>En negociación</span>
              <strong>18</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Ganadas</span>
              <strong>11</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Ganadas parcialmente</span>
              <strong>5</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Perdidas</span>
              <strong>7</strong>
            </div>
          </div>
        </Card>
      </div>

      <div className={`${styles.twoColumns} ${styles.sectionSpacer}`}>
        <Card title="Principales causas" subtitle="Resultado comercial">
          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span>Precio</span>
              <strong>35%</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Condición de pago</span>
              <strong>18%</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Servicio</span>
              <strong>16%</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Competencia</span>
              <strong>14%</strong>
            </div>
          </div>
        </Card>

        <Card title="Clientes sin seguimiento" subtitle="Riesgo comercial">
          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span>Más de 90 días</span>
              <strong>9</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Sin representante</span>
              <strong>7</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Con acción vencida</span>
              <strong>6</strong>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
