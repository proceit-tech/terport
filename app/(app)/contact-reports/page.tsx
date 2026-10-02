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
} from "@/lib/prototype-commercial-history";

export default function ContactReportsPage() {
  const [clientFilter, setClientFilter] =
    useState("Todos");

  const [representativeFilter, setRepresentativeFilter] =
    useState("Todos");

  const filteredHistory = useMemo(
    () =>
      contactHistory.filter((item) => {
        const clientMatches =
          clientFilter === "Todos" ||
          item.client === clientFilter;

        const representativeMatches =
          representativeFilter === "Todos" ||
          item.representative === representativeFilter;

        return (
          clientMatches &&
          representativeMatches
        );
      }),
    [
      clientFilter,
      representativeFilter,
    ]
  );

  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Comercial"
        title="Historial Compartido de Contactos"
        description="Historial completo de gestiones comerciales para asegurar continuidad ante ausencias, vacaciones y cambios de cartera."
        actionHref="/contact-reports/new"
        actionLabel="Nuevo reporte"
      />

      <div className={styles.statsGrid}>
        <StatCard
          label="Contactos registrados"
          value="341"
          helper="Historial acumulado"
        />

        <StatCard
          label="Clientes con actividad"
          value="168"
          helper="Período actual"
        />

        <StatCard
          label="Acciones pendientes"
          value="21"
          helper="Con compromiso abierto"
        />

        <StatCard
          label="Reagendadas"
          value="8"
          helper="Con trazabilidad"
        />
      </div>

      <Card
        title="Historial de gestiones"
        subtitle="CRM compartido"
      >
        <div className={styles.toolbar}>
          <select
            className={styles.select}
            value={clientFilter}
            onChange={(event) =>
              setClientFilter(
                event.target.value
              )
            }
          >
            <option>Todos</option>
            <option>
              GLOBO IMPORT EXPORT S.A.
            </option>
            <option>
              NUEVA AMERICANA S.A.
            </option>
            <option>
              LOGÍSTICA PARAGUAYA S.A.
            </option>
          </select>

          <select
            className={styles.select}
            value={representativeFilter}
            onChange={(event) =>
              setRepresentativeFilter(
                event.target.value
              )
            }
          >
            <option>Todos</option>
            <option>Salma Doldán</option>
            <option>María López</option>
            <option>Carlos Vera</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha / hora</th>
                <th>Cliente</th>
                <th>Representante</th>
                <th>Acción</th>
                <th>Motivo</th>
                <th>Resultado</th>
                <th>Próxima acción</th>
                <th>Compromiso</th>
                <th>Estado</th>
                <th>Origen</th>
              </tr>
            </thead>

            <tbody>
              {filteredHistory.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      {item.date} {item.time}
                    </td>

                    <td>
                      <strong>
                        {item.client}
                      </strong>
                    </td>

                    <td>{item.representative}</td>
                    <td>{item.actionType}</td>
                    <td>{item.reason}</td>
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

                    <td>{item.source}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
