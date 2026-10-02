import Link from "next/link";

import {
  Card,
  PageHeader,
  StatCard,
  StatusBadge,
  styles,
} from "@/components/prototype/PrototypeUi";

import { appointments } from "@/lib/prototype-v2-data";

function getStatusTone(
  status: string
): "info" | "success" | "warning" | "neutral" {
  if (status === "Completado") return "success";
  if (status === "Reagendado") return "warning";
  if (status === "Programado") return "info";
  return "neutral";
}

export default function AppointmentsPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Comercial"
        title="Agenda Comercial"
        description="Planificación semanal de contactos, seguimiento de compromisos y control de cumplimiento por representante."
        actionHref="/appointments/new"
        actionLabel="Agendar contacto"
      />

      <div className={styles.statsGrid}>
        <StatCard label="Objetivo semanal" value="84" helper="28 por representante" />
        <StatCard label="Contactados" value="72" helper="86% de cumplimiento" />
        <StatCard label="Pendientes" value="7" helper="Dentro de la semana" />
        <StatCard label="Reagendados" value="5" helper="Con trazabilidad" />
      </div>

      <Card title="Agenda semanal" subtitle="Contactos planificados">
        <div className={styles.toolbar}>
          <input className={styles.input} placeholder="Buscar cliente..." />

          <select className={styles.select}>
            <option>Todos los representantes</option>
            <option>Salma Doldán</option>
            <option>María López</option>
            <option>Carlos Vera</option>
          </select>

          <select className={styles.select}>
            <option>Todos los estados</option>
            <option>Programado</option>
            <option>Pendiente</option>
            <option>Completado</option>
            <option>Reagendado</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Representante</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Próxima acción</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.client}</td>
                  <td>{appointment.representative}</td>
                  <td>{appointment.type}</td>
                  <td>{appointment.reason}</td>
                  <td>{appointment.nextAction}</td>
                  <td>
                    <StatusBadge tone={getStatusTone(appointment.status)}>
                      {appointment.status}
                    </StatusBadge>
                  </td>
                  <td>
                    <Link href="/contact-reports/new" className={styles.secondaryButton}>
                      Registrar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className={`${styles.twoColumns} ${styles.sectionSpacer}`}>
        <Card title="Cumplimiento semanal" subtitle="Por representante">
          <div className={styles.kpiRow}>
            <div className={styles.kpi}>
              <strong>89%</strong>
              <span>Salma Doldán</span>
            </div>
            <div className={styles.kpi}>
              <strong>82%</strong>
              <span>María López</span>
            </div>
            <div className={styles.kpi}>
              <strong>75%</strong>
              <span>Carlos Vera</span>
            </div>
          </div>
        </Card>

        <Card title="Acciones vencidas" subtitle="Seguimiento">
          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span>Presupuestos / proformas</span>
              <strong>3</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Seguimientos</span>
              <strong>5</strong>
            </div>
            <div className={styles.metaItem}>
              <span>Descuentos solicitados</span>
              <strong>2</strong>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
