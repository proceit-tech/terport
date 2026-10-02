import Link from "next/link";

import {
  Card,
  PageHeader,
  StatusBadge,
  styles,
} from "@/components/prototype/PrototypeUi";

interface ContactReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactReportDetailPage({
  params,
}: ContactReportDetailPageProps) {
  const { id } = await params;

  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Comercial / Reportes"
        title={id}
        description="Detalle completo de la gestión comercial y seguimiento asociado."
      />

      <div className={styles.twoColumns}>
        <Card title="Gestión realizada" subtitle="CRM">
          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span>Cliente</span>
              <strong>GLOBO IMPORT EXPORT S.A.</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Representante</span>
              <strong>Salma Doldán</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Fecha</span>
              <strong>20/09/2026 09:30</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Tipo</span>
              <strong>Llamada</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Motivo</span>
              <strong>Seguimiento de cotización</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Segmento</span>
              <strong>Importación FCL</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Estado oportunidad</span>
              <strong>En negociación</strong>
            </div>
          </div>

          <p
            style={{
              marginTop: 18,
              color: "#47687d",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            Cliente interesado en revisar una condición corporativa para
            operaciones regulares. Solicita una propuesta actualizada y
            seguimiento durante la semana.
          </p>
        </Card>

        <Card title="Próxima acción" subtitle="Compromiso">
          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span>Acción</span>
              <strong>Preparar presupuesto / proforma</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Fecha compromiso</span>
              <strong>23/09/2026</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Responsable</span>
              <strong>Salma Doldán</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Estado</span>
              <strong>
                <StatusBadge tone="warning">Pendiente</StatusBadge>
              </strong>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.sectionSpacer}>
        <Card title="Comentarios de supervisión" subtitle="Dirección / Supervisión">
          <textarea
            className={styles.textarea}
            placeholder="Agregar comentario asociado al historial del cliente..."
          />

          <div className={styles.actions}>
            <Link href="/contact-reports" className={styles.secondaryButton}>
              Volver
            </Link>
            <button type="button" className={styles.primaryButton}>
              Guardar comentario
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
