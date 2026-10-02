"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AuthUser, UserRole } from "@/types/auth";
import { getSession } from "@/lib/auth/session";
import { getRoleLabel } from "@/lib/auth/roles";
import styles from "./dashboard.module.css";

type StatusTone = "success" | "warning" | "info" | "danger";

interface KpiCard {
  label: string;
  value: string;
  detail: string;
  accent: "blue" | "orange" | "green" | "violet";
  href: string;
  roles?: UserRole[];
  icon: React.ReactNode;
}

interface AlertItem {
  title: string;
  description: string;
  href: string;
  action: string;
  tone: StatusTone;
  roles?: UserRole[];
}

const kpis: KpiCard[] = [
  {
    label: "Operaciones calculadas",
    value: "28",
    detail: "18 importaciones · 10 exportaciones",
    accent: "blue",
    href: "/calculations",
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2" />
      </svg>
    ),
  },
  {
    label: "Pedidos pendientes",
    value: "7",
    detail: "Pendientes de facturación",
    accent: "orange",
    href: "/orders",
    roles: ["ADMIN", "TARIFF_OPERATOR"],
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M6 2h9l3 3v17H6z" />
        <path d="M14 2v5h5M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: "Proformas emitidas",
    value: "16",
    detail: "6 generadas por el área Comercial",
    accent: "green",
    href: "/proformas",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M4 3h16v18H4z" />
        <path d="M8 7h8M8 11h8M8 15h5" />
      </svg>
    ),
  },
  {
    label: "Tarifas próximas a vencer",
    value: "5",
    detail: "Dentro de los próximos 30 días",
    accent: "violet",
    href: "/tariffs",
    roles: ["ADMIN", "COMMERCIAL"],
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M7 2v3M17 2v3M3 9h18" />
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 13h3M13 13h3M8 17h3" />
      </svg>
    ),
  },
];

const alerts: AlertItem[] = [
  {
    title: "Pedidos sin factura asociada",
    description:
      "Hay 7 pedidos que requieren seguimiento antes del cierre de facturación.",
    href: "/orders",
    action: "Revisar pedidos",
    tone: "warning",
    roles: ["ADMIN", "TARIFF_OPERATOR"],
  },
  {
    title: "Acuerdos comerciales próximos a vencer",
    description:
      "Cinco tarifas corporativas o de grupo vencen durante los próximos 30 días.",
    href: "/tariffs",
    action: "Revisar tarifas",
    tone: "info",
    roles: ["ADMIN", "COMMERCIAL"],
  },
  {
    title: "Integraciones externas sin configurar",
    description:
      "Waldbott y NAVIS están previstos en la arquitectura, pero todavía no tienen conexión activa.",
    href: "/settings/integrations",
    action: "Ver integraciones",
    tone: "danger",
    roles: ["ADMIN"],
  },
];

const recentActivity = [
  {
    reference: "PED-000128",
    dispatch: "IMP-45873",
    client: "Cliente Corporativo A",
    operation: "Importación FCL",
    tariff: "Corporativa",
    amount: "₲ 4.850.000",
    status: "Pendiente",
  },
  {
    reference: "PRO-000311",
    dispatch: "EXP-13210",
    client: "Cliente Grupo B",
    operation: "Exportación FCL",
    tariff: "Grupo",
    amount: "US$ 1.280",
    status: "Proforma",
  },
  {
    reference: "PED-000127",
    dispatch: "IMP-45861",
    client: "Cliente Estándar C",
    operation: "Importación LCL",
    tariff: "Estándar",
    amount: "₲ 2.175.000",
    status: "Facturado",
  },
  {
    reference: "PED-000126",
    dispatch: "EXP-13202",
    client: "Cliente Corporativo D",
    operation: "Exportación Fluvial",
    tariff: "Corporativa",
    amount: "US$ 890",
    status: "Pendiente",
  },
];

const tariffDistribution = [
  { label: "Corporativa", value: 52, amount: "52%" },
  { label: "Estándar", value: 31, amount: "31%" },
  { label: "Grupo", value: 17, amount: "17%" },
];

const operationDistribution = [
  { label: "Importación FCL", value: 12, total: 28 },
  { label: "Importación LCL", value: 6, total: 28 },
  { label: "Exportación FCL", value: 7, total: 28 },
  { label: "Otros segmentos", value: 3, total: 28 },
];

function filterByRole<T extends { roles?: UserRole[] }>(
  items: T[],
  role?: UserRole
): T[] {
  if (!role) return [];
  return items.filter((item) => !item.roles || item.roles.includes(role));
}

function statusClass(status: string): string {
  if (status === "Facturado") return styles.statusSuccess;
  if (status === "Pendiente") return styles.statusWarning;
  return styles.statusInfo;
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  const visibleKpis = useMemo(
    () => filterByRole(kpis, user?.role),
    [user?.role]
  );

  const visibleAlerts = useMemo(
    () => filterByRole(alerts, user?.role),
    [user?.role]
  );

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("es-PY", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    []
  );

  const displayName = user?.displayName ?? "Usuario";

  return (
    <section className={styles.page}>
      <header className={styles.heroHeader}>
        <div className={styles.heroText}>
         
          <h1>Panel de control</h1>
          <p>
            Resumen operativo y comercial del sistema tarifario.
          </p>

          <div className={styles.userLine}>
            <span>{displayName}</span>
            <i>•</i>
            <span>{user ? getRoleLabel(user.role) : "Cargando..."}</span>
            <i>•</i>
            <span className={styles.dateText}>{formattedDate}</span>
          </div>
        </div>

        <div className={styles.heroActions}>
          <span className={styles.prototypeBadge}>Datos de ejemplo</span>

          <Link href="/calculations/new" className={styles.primaryButton}>
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo cálculo
          </Link>
        </div>
      </header>

      <section className={styles.overviewGrid}>
        <article className={styles.heroCard}>
          <div className={styles.heroCardTop}>
            <div>
              <span className={styles.heroCardLabel}>RESUMEN DE HOY</span>
              <h2>Actividad tarifaria</h2>
            </div>

            <div className={styles.liveBadge}>
              <span />
              Operativo
            </div>
          </div>

          <div className={styles.heroNumbers}>
            <div>
              <strong>28</strong>
              <span>operaciones</span>
            </div>

            <div className={styles.heroDivider} />

            <div>
              <strong>16</strong>
              <span>proformas</span>
            </div>

            <div className={styles.heroDivider} />

            <div>
              <strong>7</strong>
              <span>pendientes</span>
            </div>
          </div>

          <div className={styles.heroCardFooter}>
            <span>Importación</span>
            <strong>64%</strong>

            <div className={styles.heroProgress}>
              <span style={{ width: "64%" }} />
            </div>

            <span>Exportación</span>
            <strong>36%</strong>
          </div>
        </article>

        <article className={styles.quickPanel}>
          <div className={styles.panelTitle}>
            <div>
              <span>ACCESOS DIRECTOS</span>
              <h2>Acciones frecuentes</h2>
            </div>
          </div>

          <div className={styles.quickGrid}>
            <Link href="/clients" className={styles.quickAction}>
              <span className={styles.quickIcon}>
                <svg viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                </svg>
              </span>
              <span>
                <strong>Clientes</strong>
                <small>Consultar condiciones comerciales</small>
              </span>
            </Link>

            <Link href="/tariffs" className={styles.quickAction}>
              <span className={styles.quickIcon}>
                <svg viewBox="0 0 24 24">
                  <path d="M20 12V7H4v10h16v-5Z" />
                  <path d="M8 12h8M8 7V5h8v2" />
                </svg>
              </span>
              <span>
                <strong>Tarifas</strong>
                <small>Gestionar vigencias y acuerdos</small>
              </span>
            </Link>

            <Link href="/service-matrix" className={styles.quickAction}>
              <span className={styles.quickIcon}>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                </svg>
              </span>
              <span>
                <strong>Matriz de servicios</strong>
                <small>Validar cliente, segmento y servicio</small>
              </span>
            </Link>

            <Link href="/proformas" className={styles.quickAction}>
              <span className={styles.quickIcon}>
                <svg viewBox="0 0 24 24">
                  <path d="M4 3h16v18H4z" />
                  <path d="M8 7h8M8 11h8M8 15h5" />
                </svg>
              </span>
              <span>
                <strong>Proformas</strong>
                <small>Consultar emisiones recientes</small>
              </span>
            </Link>
          </div>
        </article>
      </section>

      <section className={styles.kpiGrid}>
        {visibleKpis.map((item) => (
          <Link href={item.href} key={item.label} className={styles.kpiCard}>
            <div className={`${styles.kpiIcon} ${styles[item.accent]}`}>
              {item.icon}
            </div>

            <div className={styles.kpiContent}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </div>

            <span className={styles.kpiArrow}>→</span>
          </Link>
        ))}
      </section>

      <section className={styles.contentGrid}>
        <article className={`${styles.panel} ${styles.activityPanel}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <span>ACTIVIDAD RECIENTE</span>
              <h2>Últimas operaciones</h2>
            </div>

            <Link href="/calculations">Ver historial</Link>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Despacho</th>
                  <th>Cliente</th>
                  <th>Operación</th>
                  <th>Tarifa</th>
                  <th>Importe</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {recentActivity.map((item) => (
                  <tr key={item.reference}>
                    <td>
                      <strong>{item.reference}</strong>
                    </td>
                    <td>{item.dispatch}</td>
                    <td>{item.client}</td>
                    <td>{item.operation}</td>
                    <td>{item.tariff}</td>
                    <td className={styles.amount}>{item.amount}</td>
                    <td>
                      <span
                        className={`${styles.status} ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={`${styles.panel} ${styles.tariffPanel}`}>
          <div className={styles.panelTitle}>
            <span>COMPOSICIÓN</span>
            <h2>Tipo de tarifa aplicada</h2>
          </div>

          <div className={styles.donutRow}>
            <div className={styles.donut}>
              <div className={styles.donutCenter}>
                <strong>28</strong>
                <span>operaciones</span>
              </div>
            </div>

            <div className={styles.legend}>
              {tariffDistribution.map((item, index) => (
                <div className={styles.legendItem} key={item.label}>
                  <span
                    className={`${styles.legendDot} ${
                      index === 0
                        ? styles.dotBlue
                        : index === 1
                        ? styles.dotCyan
                        : styles.dotOrange
                    }`}
                  />
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.amount}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className={styles.lowerGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <span>DISTRIBUCIÓN OPERATIVA</span>
              <h2>Operaciones por segmento</h2>
            </div>
          </div>

          <div className={styles.segmentList}>
            {operationDistribution.map((item) => {
              const percentage = Math.round((item.value / item.total) * 100);

              return (
                <div className={styles.segmentItem} key={item.label}>
                  <div className={styles.segmentHeader}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>

                  <div className={styles.segmentTrack}>
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <span>SEGUIMIENTO</span>
              <h2>Alertas que requieren atención</h2>
            </div>
          </div>

          <div className={styles.alertList}>
            {visibleAlerts.length > 0 ? (
              visibleAlerts.map((alert) => (
                <div className={styles.alertRow} key={alert.title}>
                  <span
                    className={`${styles.alertIndicator} ${
                      styles[`alert${alert.tone}`]
                    }`}
                  />

                  <div className={styles.alertText}>
                    <strong>{alert.title}</strong>
                    <p>{alert.description}</p>
                  </div>

                  <Link href={alert.href}>{alert.action}</Link>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                No hay alertas pendientes para este perfil.
              </div>
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <span>INTEGRACIONES</span>
              <h2>Estado de los sistemas</h2>
            </div>
          </div>

          <div className={styles.integrationList}>
            <div className={styles.integrationRow}>
              <div className={styles.systemLogo}>W</div>
              <div className={styles.systemText}>
                <strong>Waldbott</strong>
                <span>ERP y facturación</span>
              </div>
              <span className={styles.pendingBadge}>Sin configurar</span>
            </div>

            <div className={styles.integrationRow}>
              <div className={styles.systemLogo}>N</div>
              <div className={styles.systemText}>
                <strong>NAVIS</strong>
                <span>Operación portuaria</span>
              </div>
              <span className={styles.pendingBadge}>Sin configurar</span>
            </div>
          </div>

          {user?.role === "ADMIN" && (
            <Link
              href="/settings/integrations"
              className={styles.configurationLink}
            >
              Configurar integraciones
            </Link>
          )}
        </article>
      </section>
    </section>
  );
}