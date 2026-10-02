"use client";

import { useMemo, useState } from "react";

import {
  Card,
  PageHeader,
  StatCard,
  StatusBadge,
  styles,
} from "@/components/prototype/PrototypeUi";

import {
  contactHistory,
  portfolioAssignments,
  representativeSummary,
} from "@/lib/prototype-commercial-history";

type ViewMode =
  | "current"
  | "history"
  | "representatives";

export default function PortfolioPage() {
  const [viewMode, setViewMode] =
    useState<ViewMode>("current");

  const currentAssignments = useMemo(
    () =>
      portfolioAssignments.filter(
        (item) => item.status === "Actual"
      ),
    []
  );

  const assignmentHistory = useMemo(
    () =>
      portfolioAssignments.filter(
        (item) => item.status === "Histórico"
      ),
    []
  );

  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Comercial"
        title="Cartera Comercial"
        description="Asignación actual, historial de responsables y actividad comercial por representante."
      />

      <div className={styles.statsGrid}>
        <StatCard
          label="Clientes asignados"
          value="179"
          helper="Con representante actual"
        />

        <StatCard
          label="Sin representante"
          value="7"
          helper="Clientes sueltos"
        />

        <StatCard
          label="Reasignados este mes"
          value="12"
          helper="Con trazabilidad"
        />

        <StatCard
          label="Acciones vencidas"
          value="6"
          helper="Seguimiento pendiente"
        />
      </div>

      <Card
        title="Gestión de cartera"
        subtitle="Trazabilidad"
      >
        <div className={styles.toolbar}>
          <button
            type="button"
            className={
              viewMode === "current"
                ? styles.primaryButton
                : styles.secondaryButton
            }
            onClick={() =>
              setViewMode("current")
            }
          >
            Asignación actual
          </button>

          <button
            type="button"
            className={
              viewMode === "history"
                ? styles.primaryButton
                : styles.secondaryButton
            }
            onClick={() =>
              setViewMode("history")
            }
          >
            Historial de cartera
          </button>

          <button
            type="button"
            className={
              viewMode === "representatives"
                ? styles.primaryButton
                : styles.secondaryButton
            }
            onClick={() =>
              setViewMode("representatives")
            }
          >
            Acciones por representante
          </button>
        </div>

        {viewMode === "current" && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Representante actual</th>
                  <th>Desde</th>
                  <th>Representante anterior</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {currentAssignments.map(
                  (item) => (
                    <tr key={item.id}>
                      <td>{item.client}</td>
                      <td>{item.representative}</td>
                      <td>{item.startDate}</td>
                      <td>
                        {item.previousRepresentative ?? "—"}
                      </td>
                      <td>{item.reason}</td>

                      <td>
                        <StatusBadge
                          tone={
                            item.representative ===
                            "Sin asignar"
                              ? "danger"
                              : "success"
                          }
                        >
                          {item.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "history" && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Representante</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Motivo</th>
                  <th>Modificado por</th>
                  <th>Registro</th>
                </tr>
              </thead>

              <tbody>
                {assignmentHistory.map(
                  (item) => (
                    <tr key={item.id}>
                      <td>{item.client}</td>
                      <td>{item.representative}</td>
                      <td>{item.startDate}</td>
                      <td>{item.endDate ?? "Actual"}</td>
                      <td>{item.reason}</td>
                      <td>{item.changedBy}</td>
                      <td>{item.changedAt}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "representatives" && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Representante</th>
                  <th>Clientes activos</th>
                  <th>Contactos semana</th>
                  <th>Acciones completadas</th>
                  <th>Acciones pendientes</th>
                  <th>Acciones vencidas</th>
                  <th>Reasignaciones mes</th>
                </tr>
              </thead>

              <tbody>
                {representativeSummary.map(
                  (item) => (
                    <tr
                      key={item.representative}
                    >
                      <td>
                        <strong>
                          {item.representative}
                        </strong>
                      </td>
                      <td>{item.activeClients}</td>
                      <td>{item.contactsThisWeek}</td>
                      <td>{item.completedActions}</td>
                      <td>{item.pendingActions}</td>

                      <td>
                        <StatusBadge
                          tone={
                            item.overdueActions > 0
                              ? "warning"
                              : "success"
                          }
                        >
                          {item.overdueActions}
                        </StatusBadge>
                      </td>

                      <td>
                        {
                          item.reassignedClientsThisMonth
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card
          title="Actividad comercial reciente"
          subtitle="Historial compartido"
        >
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha / hora</th>
                  <th>Cliente</th>
                  <th>Representante</th>
                  <th>Acción</th>
                  <th>Resultado</th>
                  <th>Próxima acción</th>
                  <th>Compromiso</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {contactHistory
                  .slice(0, 5)
                  .map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.date} {item.time}
                      </td>
                      <td>{item.client}</td>
                      <td>{item.representative}</td>
                      <td>{item.actionType}</td>
                      <td>{item.result}</td>
                      <td>{item.nextAction}</td>
                      <td>{item.commitmentDate}</td>

                      <td>
                        <StatusBadge
                          tone={
                            item.actionStatus ===
                            "Pendiente"
                              ? "warning"
                              : item.actionStatus ===
                                "Reagendada"
                              ? "info"
                              : "success"
                          }
                        >
                          {item.actionStatus}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
