import {
  Card,
  PageHeader,
  styles,
} from "@/components/prototype/PrototypeUi";

export default function SettingsPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Administración"
        title="Configuración"
        description="Parámetros utilizados por la gestión comercial y las alertas."
      />

      <div className={styles.twoColumns}>
        <Card title="Seguimiento comercial" subtitle="Parámetros">
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Días sin contacto para generar alerta</label>
              <input className={styles.input} defaultValue="90" />
            </div>

            <div className={styles.field}>
              <label>Día de cierre semanal</label>
              <select className={styles.select}>
                <option>Sábado</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Objetivo semanal por representante</label>
              <input className={styles.input} defaultValue="28" />
            </div>

            <div className={styles.field}>
              <label>Notificación de reportes</label>
              <select className={styles.select}>
                <option>Resumen diario consolidado</option>
                <option>Resumen semanal</option>
                <option>Sin correo automático</option>
              </select>
            </div>
          </div>
        </Card>

        <Card title="Catálogos comerciales" subtitle="Datos estructurados">
          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span>Tipos de contacto</span>
              <strong>6 valores</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Motivos de contacto</span>
              <strong>8 valores</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Próximas acciones</span>
              <strong>14 valores</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Motivos de resultado</span>
              <strong>9 valores</strong>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
