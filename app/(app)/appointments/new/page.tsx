import Link from "next/link";

import {
  Card,
  PageHeader,
  styles,
} from "@/components/prototype/PrototypeUi";

export default function NewAppointmentPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Comercial"
        title="Agendar Contacto"
        description="Planificación de una nueva gestión comercial."
      />

      <Card title="Datos del contacto" subtitle="Agenda">
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Cliente *</label>
            <select className={styles.select}>
              <option>GLOBO IMPORT EXPORT S.A.</option>
              <option>NUEVA AMERICANA S.A.</option>
              <option>LOGÍSTICA PARAGUAYA S.A.</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Representante *</label>
            <select className={styles.select}>
              <option>Salma Doldán</option>
              <option>María López</option>
              <option>Carlos Vera</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Fecha *</label>
            <input type="date" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label>Hora *</label>
            <input type="time" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label>Tipo de contacto *</label>
            <select className={styles.select}>
              <option>Llamada</option>
              <option>Visita</option>
              <option>Reunión</option>
              <option>WhatsApp</option>
              <option>Correo</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Motivo *</label>
            <select className={styles.select}>
              <option>Seguimiento</option>
              <option>Negociación de tarifas</option>
              <option>Presentación comercial</option>
              <option>Reclamo</option>
              <option>Recuperación de cliente</option>
            </select>
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label>Objetivo del contacto</label>
            <textarea
              className={styles.textarea}
              placeholder="Objetivo o contexto de la gestión..."
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/appointments" className={styles.secondaryButton}>
            Cancelar
          </Link>
          <Link href="/appointments" className={styles.primaryButton}>
            Guardar en agenda
          </Link>
        </div>
      </Card>
    </main>
  );
}
