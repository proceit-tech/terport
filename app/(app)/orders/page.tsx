"use client";

import { useMemo, useState } from "react";
import ordersData from "@/mock-data/orders.json";
import styles from "./orders.module.css";

type OrderStatus = "PENDING" | "INVOICED" | "CANCELLED";
type SyncStatus = "SYNCED" | "PENDING" | "ERROR";
type Direction = "IMPORT" | "EXPORT";

interface OrderLine {
  code: string;
  concept: string;
  reference: string;
  quantity: number;
  unit: string;
  unitPriceUSD: number;
  totalUSD: number;
  exonerated: boolean;
}

interface HistoryItem {
  dateTime: string;
  user: string;
  action: string;
  detail: string;
}

interface Order {
  id: string;
  number: string;
  dispatchNumber: string;
  proformaNumber: string;
  clientId: string;
  clientCode: string;
  clientName: string;
  ruc: string;
  segmentCode: string;
  segmentName: string;
  direction: Direction;
  tariffType: "STANDARD" | "CORPORATE" | "GROUP";
  createdAt: string;
  createdBy: string;
  status: OrderStatus;
  currency: string;
  exchangeRate: number;
  totalUSD: number;
  totalPYG: number;
  containers20: number;
  containers40: number;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  lines: OrderLine[];
  history: HistoryItem[];
}

const initialOrders = ordersData as Order[];

const statusLabel: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  INVOICED: "Facturado",
  CANCELLED: "Anulado",
};

const syncLabel: Record<SyncStatus, string> = {
  SYNCED: "Sincronizado",
  PENDING: "Pendiente",
  ERROR: "Error",
};

function formatMoney(value: number, currency: "USD" | "PYG" = "USD") {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "PYG" ? 0 : 2,
  }).format(value || 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [segment, setSegment] = useState("ALL");
  const [direction, setDirection] = useState<"ALL" | Direction>("ALL");
  const [pendingWithoutInvoice, setPendingWithoutInvoice] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const pageSize = 10;
  const selected = orders.find((order) => order.id === selectedId) ?? null;

  const segments = useMemo(
    () =>
      Array.from(
        new Map(orders.map((order) => [order.segmentCode, order.segmentName])).entries()
      ),
    [orders]
  );

  const summary = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "PENDING").length,
      invoiced: orders.filter((order) => order.status === "INVOICED").length,
      cancelled: orders.filter((order) => order.status === "CANCELLED").length,
      pendingWithoutInvoice: orders.filter(
        (order) => order.status === "PENDING" && !order.invoiceNumber
      ).length,
    }),
    [orders]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesQuery =
        !normalized ||
        order.number.toLowerCase().includes(normalized) ||
        order.dispatchNumber.toLowerCase().includes(normalized) ||
        order.proformaNumber.toLowerCase().includes(normalized) ||
        order.clientName.toLowerCase().includes(normalized) ||
        order.clientCode.toLowerCase().includes(normalized) ||
        order.ruc.toLowerCase().includes(normalized) ||
        (order.invoiceNumber ?? "").toLowerCase().includes(normalized);

      const matchesStatus = status === "ALL" || order.status === status;
      const matchesSegment = segment === "ALL" || order.segmentCode === segment;
      const matchesDirection =
        direction === "ALL" || order.direction === direction;
      const matchesPendingWithoutInvoice =
        !pendingWithoutInvoice ||
        (order.status === "PENDING" && !order.invoiceNumber);

      return (
        matchesQuery &&
        matchesStatus &&
        matchesSegment &&
        matchesDirection &&
        matchesPendingWithoutInvoice
      );
    });
  }, [orders, query, status, segment, direction, pendingWithoutInvoice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function resetFilters() {
    setQuery("");
    setStatus("ALL");
    setSegment("ALL");
    setDirection("ALL");
    setPendingWithoutInvoice(false);
    setPage(1);
  }

  function simulateInvoice(orderId: string) {
    const now = new Date().toISOString();
    setOrders((current) =>
      current.map((order, index) =>
        order.id === orderId
          ? {
              ...order,
              status: "INVOICED",
              invoiceNumber: `001-001-${String(2000 + index).padStart(7, "0")}`,
              invoiceDate: now,
              syncStatus: "SYNCED",
              lastSyncAt: now,
              history: [
                ...order.history,
                {
                  dateTime: now,
                  user: "Waldbott",
                  action: "INVOICED",
                  detail: "Factura recibida desde la integración simulada de Waldbott.",
                },
              ],
            }
          : order
      )
    );
  }

  function confirmCancellation() {
    if (!selected || !cancelReason.trim()) return;

    const now = new Date().toISOString();

    setOrders((current) =>
      current.map((order) =>
        order.id === selected.id
          ? {
              ...order,
              status: "CANCELLED",
              cancelledAt: now,
              cancelledBy: "Administrador TERPORT",
              cancellationReason: cancelReason.trim(),
              syncStatus: "PENDING",
              history: [
                ...order.history,
                {
                  dateTime: now,
                  user: "Administrador TERPORT",
                  action: "CANCELLED",
                  detail: `Simulación de anulación: ${cancelReason.trim()}`,
                },
              ],
            }
          : order
      )
    );

    setCancelOpen(false);
    setCancelReason("");
  }

  return (
    <>
      <section className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.overline}>PEDIDOS</span>
            <h1>Gestión de pedidos</h1>
            <p>
              Seguimiento del pedido interno, su despacho de referencia y el
              estado de facturación asociado.
            </p>
          </div>
        </header>

        <section className={styles.summaryGrid}>
          <SummaryCard label="Total de pedidos" value={summary.total} tone="neutral" />
          <SummaryCard label="Pendientes" value={summary.pending} tone="pending" />
          <SummaryCard label="Facturados" value={summary.invoiced} tone="invoiced" />
          <SummaryCard label="Anulados" value={summary.cancelled} tone="cancelled" />
        </section>

        <section
          className={`${styles.pendingBanner} ${
            pendingWithoutInvoice ? styles.pendingBannerActive : ""
          }`}
        >
          <div>
            <span className={styles.pendingIcon}>!</span>
            <div>
              <strong>Pedidos pendientes sin factura</strong>
              <span>
                {summary.pendingWithoutInvoice} pedidos todavía no poseen número
                de factura asociado.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setPendingWithoutInvoice((current) => !current);
              setPage(1);
            }}
          >
            {pendingWithoutInvoice ? "Ver todos" : "Ver pendientes"}
          </button>
        </section>

        <section className={styles.filtersPanel}>
          <div className={styles.filtersHeader}>
            <div>
              <span className={styles.overline}>FILTROS</span>
              <strong>Buscar pedidos</strong>
            </div>

            <button type="button" onClick={resetFilters}>
              Limpiar filtros
            </button>
          </div>

          <div className={styles.filtersGrid}>
            <label className={styles.searchField}>
              <span>Buscar</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Pedido, despacho, cliente, RUC, proforma o factura..."
              />
            </label>

            <label>
              <span>Operación</span>
              <select
                value={direction}
                onChange={(event) => {
                  setDirection(event.target.value as "ALL" | Direction);
                  setPage(1);
                }}
              >
                <option value="ALL">Todas</option>
                <option value="IMPORT">Importación</option>
                <option value="EXPORT">Exportación</option>
              </select>
            </label>

            <label>
              <span>Segmento</span>
              <select
                value={segment}
                onChange={(event) => {
                  setSegment(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">Todos</option>
                {segments.map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} - {name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Estado</span>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as "ALL" | OrderStatus);
                  setPage(1);
                }}
              >
                <option value="ALL">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="INVOICED">Facturado</option>
                <option value="CANCELLED">Anulado</option>
              </select>
            </label>
          </div>
        </section>

        <section className={styles.tablePanel}>
          <div className={styles.tableTop}>
            <div>
              <span className={styles.overline}>RESULTADOS</span>
              <strong>{filtered.length} pedidos encontrados</strong>
            </div>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Pedido</span>
              <span>Cliente</span>
              <span>Despacho</span>
              <span>Segmento</span>
              <span>Fecha</span>
              <span>Total Gs.</span>
              <span>Factura</span>
              <span>Estado</span>
              <span />
            </div>

            {visible.map((order) => (
              <div key={order.id} className={styles.tableRow}>
                <div className={styles.orderCell}>
                  <strong>{order.number}</strong>
                  <span>{order.proformaNumber}</span>
                </div>

                <div className={styles.clientCell}>
                  <strong>{order.clientName}</strong>
                  <span>
                    {order.clientCode} · {order.ruc}
                  </span>
                </div>

                <span className={styles.dispatch}>{order.dispatchNumber}</span>

                <div className={styles.segmentCell}>
                  <strong>{order.segmentCode}</strong>
                  <span>{order.segmentName}</span>
                </div>

                <span>{formatDate(order.createdAt)}</span>

                <strong className={styles.amount}>
                  {formatMoney(order.totalPYG, "PYG")}
                </strong>

                <div className={styles.invoiceCell}>
                  <strong>{order.invoiceNumber ?? "—"}</strong>
                  <span>
                    {order.invoiceDate ? formatDate(order.invoiceDate) : "Sin factura"}
                  </span>
                </div>

                <StatusBadge status={order.status} />

                <button
                  type="button"
                  className={styles.detailButton}
                  onClick={() => setSelectedId(order.id)}
                >
                  Ver detalle →
                </button>
              </div>
            ))}

            {!visible.length && (
              <div className={styles.emptyState}>
                No se encontraron pedidos con los filtros seleccionados.
              </div>
            )}
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </button>

            <span>
              Página {safePage} de {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Siguiente
            </button>
          </div>
        </section>
      </section>

      {selected && (
        <div className={styles.modalBackdrop}>
          <div className={styles.detailModal}>
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>DETALLE DEL PEDIDO</span>
                <h2>{selected.number}</h2>
                <p>
                  Referencia: {selected.number} / {selected.dispatchNumber}
                </p>
              </div>

              <div className={styles.modalHeaderActions}>
                <StatusBadge status={selected.status} />
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setSelectedId(null)}
                >
                  ×
                </button>
              </div>
            </header>

            <div className={styles.modalBody}>
              <section className={styles.detailSummary}>
                <Info label="Cliente" value={selected.clientName} />
                <Info label="RUC" value={selected.ruc} />
                <Info label="Despacho" value={selected.dispatchNumber} />
                <Info label="Proforma origen" value={selected.proformaNumber} />
                <Info
                  label="Segmento"
                  value={`${selected.segmentCode} · ${selected.segmentName}`}
                />
                <Info label="Creado por" value={selected.createdBy} />
                <Info label="Fecha creación" value={formatDateTime(selected.createdAt)} />
                <Info
                  label="Contenedores"
                  value={`${selected.containers20} × 20' · ${selected.containers40} × 40'`}
                />
              </section>

              <section className={styles.invoicePanel}>
                <div className={styles.sectionTitle}>
                  <div>
                    <span className={styles.overline}>FACTURACIÓN</span>
                    <strong>Estado en Waldbott</strong>
                  </div>

                  <SyncBadge status={selected.syncStatus} />
                </div>

                <div className={styles.invoiceGrid}>
                  <Info
                    label="Número factura"
                    value={selected.invoiceNumber ?? "Pendiente"}
                    accent={Boolean(selected.invoiceNumber)}
                  />
                  <Info
                    label="Fecha factura"
                    value={formatDateTime(selected.invoiceDate)}
                  />
                  <Info
                    label="Última sincronización"
                    value={formatDateTime(selected.lastSyncAt)}
                  />
                  <Info
                    label="Estado"
                    value={statusLabel[selected.status]}
                  />
                </div>

                {selected.status === "PENDING" && (
                  <div className={styles.prototypeActions}>
                    <span>
                      Simulación para prototipo: en producción este cambio vendrá
                      automáticamente desde Waldbott.
                    </span>
                    <button
                      type="button"
                      onClick={() => simulateInvoice(selected.id)}
                    >
                      Simular factura recibida
                    </button>
                  </div>
                )}
              </section>

              <section className={styles.linesSection}>
                <div className={styles.sectionTitle}>
                  <div>
                    <span className={styles.overline}>SERVICIOS</span>
                    <strong>Snapshot del cálculo confirmado</strong>
                  </div>
                </div>

                <div className={styles.linesTable}>
                  <div className={styles.linesHead}>
                    <span>Código</span>
                    <span>Concepto</span>
                    <span>Referencia</span>
                    <span>Cant.</span>
                    <span>Precio USD</span>
                    <span>Total USD</span>
                  </div>

                  {selected.lines.map((line, index) => (
                    <div
                      key={`${line.code}-${index}`}
                      className={`${styles.lineRow} ${
                        line.exonerated ? styles.exoneratedLine : ""
                      }`}
                    >
                      <strong>{line.code}</strong>
                      <div>
                        <strong>{line.concept}</strong>
                        {line.exonerated && <span>Exonerado</span>}
                      </div>
                      <span>{line.reference}</span>
                      <span>
                        {line.quantity} {line.unit}
                      </span>
                      <span>
                        {line.exonerated
                          ? "0,00"
                          : formatMoney(line.unitPriceUSD, "USD")}
                      </span>
                      <strong>
                        {line.exonerated
                          ? "0,00"
                          : formatMoney(line.totalUSD, "USD")}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className={styles.totals}>
                  <div>
                    <span>Total USD</span>
                    <strong>{formatMoney(selected.totalUSD, "USD")}</strong>
                  </div>
                  <div className={styles.totalMain}>
                    <span>Total Gs.</span>
                    <strong>{formatMoney(selected.totalPYG, "PYG")}</strong>
                  </div>
                </div>
              </section>

              {selected.status === "CANCELLED" && (
                <section className={styles.cancelledPanel}>
                  <span>Pedido anulado</span>
                  <strong>{selected.cancellationReason}</strong>
                  <small>
                    {selected.cancelledBy} · {formatDateTime(selected.cancelledAt)}
                  </small>
                </section>
              )}

              <section className={styles.historySection}>
                <div className={styles.sectionTitle}>
                  <div>
                    <span className={styles.overline}>TRAZABILIDAD</span>
                    <strong>Historial del pedido</strong>
                  </div>
                </div>

                <div className={styles.historyList}>
                  {selected.history
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <div key={`${entry.dateTime}-${index}`} className={styles.historyItem}>
                        <span className={styles.historyDot} />
                        <div>
                          <strong>{entry.detail}</strong>
                          <span>
                            {entry.user} · {formatDateTime(entry.dateTime)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            </div>

            <footer className={styles.modalFooter}>
              {selected.status === "PENDING" && (
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() => {
                    setCancelReason("");
                    setCancelOpen(true);
                  }}
                >
                  Simular anulación
                </button>
              )}

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setSelectedId(null)}
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}

      {cancelOpen && selected && (
        <div className={styles.confirmBackdrop}>
          <div className={styles.confirmModal}>
            <header>
              <span className={styles.overline}>SIMULACIÓN DE ANULACIÓN</span>
              <h2>{selected.number}</h2>
              <p>
                Esta acción solo simula el comportamiento del prototipo. En
                producción, el estado de anulación se sincronizará desde Waldbott
                y conservará usuario, fecha, hora y motivo.
              </p>
            </header>

            <label>
              <span>Motivo de anulación</span>
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Explique el motivo..."
              />
            </label>

            <footer>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setCancelOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                disabled={!cancelReason.trim()}
                onClick={confirmCancellation}
              >
                Confirmar simulación
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "pending" | "invoiced" | "cancelled";
}) {
  return (
    <article className={`${styles.summaryCard} ${styles[`summary_${tone}`]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
      {statusLabel[status]}
    </span>
  );
}

function SyncBadge({ status }: { status: SyncStatus }) {
  return (
    <span className={`${styles.syncBadge} ${styles[`sync_${status}`]}`}>
      {syncLabel[status]}
    </span>
  );
}

function Info({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`${styles.infoBox} ${accent ? styles.infoBoxAccent : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
