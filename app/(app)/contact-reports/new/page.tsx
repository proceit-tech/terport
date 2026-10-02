import Link from "next/link";

import {
  Card,
  PageHeader,
  styles,
} from "@/components/prototype/PrototypeUi";

export default function NewContactReportPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Comercial"
        title="Nuevo Reporte de Contacto"
        description="Registro estructurado de la gestión comercial realizada con el cliente."
      />

      <div className={styles.twoColumns}>
        <Card title="Datos del contacto" subtitle="CRM">
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
              <label>Tipo de contacto *</label>
              <select className={styles.select}>
                <option>Llamada</option>
                <option>Visita</option>
                <option>WhatsApp</option>
                <option>Correo</option>
                <option>Reunión</option>
                <option>Videollamada</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Motivo *</label>
              <select className={styles.select}>
                <option>Seguimiento</option>
                <option>Negociación de tarifas</option>
                <option>Presentación comercial</option>
                <option>Seguimiento de cotización</option>
                <option>Reclamo</option>
                <option>Recuperación de cliente</option>
                <option>Renovación de acuerdo</option>
                <option>Consulta comercial</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Decisor / Contacto principal</label>
              <input className={styles.input} placeholder="Nombre del decisor" />
            </div>

            <div className={styles.field}>
              <label>Tipo de mercadería</label>
              <input
                className={styles.input}
                placeholder="Ej. alimentos, químicos, maquinaria..."
              />
            </div>

            <div className={styles.field}>
              <label>Origen de la carga</label>
              <input className={styles.input} placeholder="País, puerto o región" />
            </div>

            <div className={styles.field}>
              <label>Segmento</label>
              <select className={styles.select}>
                <option>Importación FCL</option>
                <option>Importación LCL</option>
                <option>Exportación FCL</option>
                <option>Exportación LCL</option>
                <option>Terrestre</option>
                <option>Fluvial</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Línea naviera</label>
              <input className={styles.input} />
            </div>

            <div className={styles.field}>
              <label>Volumen mensual estimado</label>
              <input className={styles.input} placeholder="Ej. 20 contenedores / mes" />
            </div>

            <div className={styles.field}>
              <label>Despachante</label>
              <input className={styles.input} />
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label>Comentarios *</label>
              <textarea
                className={styles.textarea}
                placeholder="Detalle de lo conversado con el cliente..."
              />
            </div>
          </div>
        </Card>

        <Card title="Resultado comercial" subtitle="Seguimiento">
          <div className={styles.field}>
            <label>Estado de la oportunidad *</label>
            <select className={styles.select}>
              <option>Sin oportunidad</option>
              <option>En análisis</option>
              <option>Propuesta solicitada</option>
              <option>Propuesta enviada</option>
              <option>En negociación</option>
              <option>Ganado</option>
              <option>Ganado parcialmente</option>
              <option>Perdido</option>
            </select>
          </div>

          <div className={styles.field} style={{ marginTop: 12 }}>
            <label>% estimado de negocio ganado</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              max="100"
              placeholder="0 - 100"
            />
          </div>

          <div className={styles.field} style={{ marginTop: 12 }}>
            <label>Motivo principal</label>
            <select className={styles.select}>
              <option>Sin definir</option>
              <option>Precio</option>
              <option>Condición de pago</option>
              <option>Servicio</option>
              <option>Infraestructura</option>
              <option>Plazo</option>
              <option>Competencia</option>
              <option>Ubicación</option>
              <option>Cliente postergó decisión</option>
              <option>Otro</option>
            </select>
          </div>

          <div className={styles.field} style={{ marginTop: 12 }}>
            <label>Comentario del resultado</label>
            <textarea
              className={styles.textarea}
              placeholder="Información complementaria sobre el resultado..."
            />
          </div>
        </Card>
      </div>

      <div className={styles.sectionSpacer}>
        <Card title="Próxima Acción" subtitle="Seguimiento estructurado">
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Acción *</label>
              <select className={styles.select}>
                <option>Preparar presupuesto / proforma</option>
                <option>Agendar reunión</option>
                <option>Agendar llamada</option>
                <option>Realizar visita</option>
                <option>Solicitar descuento / condición especial</option>
                <option>Enviar propuesta tarifaria</option>
                <option>Solicitar documentación</option>
                <option>Enviar información solicitada</option>
                <option>Seguimiento de propuesta</option>
                <option>Esperar respuesta del cliente</option>
                <option>Negociar tarifa</option>
                <option>Escalar a supervisor / dirección</option>
                <option>Sin acción posterior</option>
                <option>Otro</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Fecha compromiso *</label>
              <input className={styles.input} type="date" />
            </div>

            <div className={styles.field}>
              <label>Responsable *</label>
              <select className={styles.select}>
                <option>Salma Doldán</option>
                <option>María López</option>
                <option>Carlos Vera</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Estado de la acción *</label>
              <select className={styles.select}>
                <option>Pendiente</option>
                <option>En proceso</option>
                <option>Completada</option>
                <option>Reagendada</option>
                <option>Cancelada</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Prioridad</label>
              <select className={styles.select}>
                <option>Normal</option>
                <option>Alta</option>
                <option>Urgente</option>
                <option>Baja</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Relacionado a</label>
              <select className={styles.select}>
                <option>Ninguno</option>
                <option>Proforma</option>
                <option>Tarifa</option>
                <option>Reclamo</option>
                <option>Renovación comercial</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label>Comentario de la próxima acción</label>
              <textarea
                className={styles.textarea}
                placeholder="Detalle específico de la acción a realizar..."
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/contact-reports" className={styles.secondaryButton}>
              Cancelar
            </Link>
            <Link href="/contact-reports/REP-000185" className={styles.primaryButton}>
              Guardar reporte
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
