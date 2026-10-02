"use client";

import { useMemo, useState } from "react";
import proformasData from "@/mock-data/proformas.json";
import styles from "./proformas.module.css";
import { downloadProformaPdf } from "./proformaPdf";

type ProformaStatus = "DRAFT" | "ISSUED" | "CONVERTED" | "CANCELLED";
type Direction = "IMPORT" | "EXPORT";
type TariffType = "STANDARD" | "CORPORATE" | "GROUP";

interface ProformaLine {
  code: string;
  concept: string;
  reference: string;
  quantity: number;
  unit: string;
  unitPriceUSD: number;
  totalUSD: number;
  exonerated: boolean;
}

interface Proforma {
  id: string;
  number: string;
  status: ProformaStatus;
  clientId: string;
  clientCode: string;
  clientName: string;
  ruc: string;
  city: string;
  dispatchNumber: string;
  segmentCode: string;
  segmentName: string;
  direction: Direction;
  tariffType: TariffType;
  emissionDateTime: string;
  user: string;
  currency: string;
  exchangeRate: number;
  invoiceUSD: number;
  freightUSD: number;
  insuranceUSD: number;
  fobUSD: number;
  commercialBaseUSD: number;
  commercialBasePYG: number;
  containers20: number;
  containers40: number;
  conditionSaleCode: number;
  invoiceCode: number;
  transport: string;
  seller: string;
  orderNumber: string | null;
  notes: string;
  lines: ProformaLine[];
  totalUSD: number;
  totalPYG: number;
}

const initialData = proformasData as Proforma[];

const statusLabel: Record<ProformaStatus, string> = {
  DRAFT: "Borrador",
  ISSUED: "Emitida",
  CONVERTED: "Convertida en pedido",
  CANCELLED: "Anulada",
};

const tariffLabel: Record<TariffType, string> = {
  STANDARD: "Estándar",
  CORPORATE: "Corporativa",
  GROUP: "De grupo",
};

function formatMoney(value: number, currency: "USD" | "PYG" = "USD") {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "PYG" ? 0 : 2,
  }).format(value || 0);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function ProformasPage() {
  const [items, setItems] = useState<Proforma[]>(initialData);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [direction, setDirection] = useState("ALL");
  const [userFilter, setUserFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const selected = items.find((item) => item.id === selectedId) ?? null;

  const segments = useMemo(
    () =>
      Array.from(
        new Map(items.map((item) => [item.segmentCode, item.segmentName])).entries()
      ),
    [items]
  );

  const users = useMemo(
    () => Array.from(new Set(items.map((item) => item.user))).sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        !normalized ||
        item.number.toLowerCase().includes(normalized) ||
        item.clientName.toLowerCase().includes(normalized) ||
        item.clientCode.toLowerCase().includes(normalized) ||
        item.ruc.toLowerCase().includes(normalized) ||
        item.dispatchNumber.toLowerCase().includes(normalized);

      const matchesSegment = segment === "ALL" || item.segmentCode === segment;
      const matchesStatus = status === "ALL" || item.status === status;
      const matchesDirection = direction === "ALL" || item.direction === direction;
      const matchesUser = userFilter === "ALL" || item.user === userFilter;

      return (
        matchesQuery &&
        matchesSegment &&
        matchesStatus &&
        matchesDirection &&
        matchesUser
      );
    });
  }, [items, query, segment, status, direction, userFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const summary = useMemo(
    () => ({
      total: items.length,
      draft: items.filter((item) => item.status === "DRAFT").length,
      issued: items.filter((item) => item.status === "ISSUED").length,
      converted: items.filter((item) => item.status === "CONVERTED").length,
    }),
    [items]
  );

  function resetFilters() {
    setQuery("");
    setSegment("ALL");
    setStatus("ALL");
    setDirection("ALL");
    setUserFilter("ALL");
    setPage(1);
  }

  function updateStatus(id: string, nextStatus: ProformaStatus) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: nextStatus,
              orderNumber:
                nextStatus === "CONVERTED"
                  ? item.orderNumber ?? `PED-${String(130 + current.indexOf(item)).padStart(6, "0")}`
                  : item.orderNumber,
            }
          : item
      )
    );
  }

  function duplicateProforma(item: Proforma) {
    const nextNumber = `PRO-2026${String(items.length + 1).padStart(5, "0")}`;
    const clone: Proforma = {
      ...item,
      id: `pf-${Date.now()}`,
      number: nextNumber,
      status: "DRAFT",
      orderNumber: null,
      emissionDateTime: new Date().toISOString(),
    };
    setItems((current) => [clone, ...current]);
    setSelectedId(clone.id);
  }

  async function downloadPdf(item: Proforma) {
    await downloadProformaPdf(item);
  }

  return (
    <>
      <section className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.overline}>PROFORMAS</span>
            <h1>Proformas emitidas</h1>
            <p>
              Consulta, seguimiento y emisión de documentos proforma generados
              desde el cálculo de tasas.
            </p>
          </div>
        </header>

        <section className={styles.summaryGrid}>
          <SummaryCard label="Total de proformas" value={summary.total} tone="neutral" />
          <SummaryCard label="Borradores" value={summary.draft} tone="draft" />
          <SummaryCard label="Emitidas" value={summary.issued} tone="issued" />
          <SummaryCard label="Convertidas a pedido" value={summary.converted} tone="converted" />
        </section>

        <section className={styles.filtersPanel}>
          <div className={styles.filtersHeader}>
            <div>
              <span className={styles.overline}>FILTROS</span>
              <strong>Buscar proformas</strong>
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
                placeholder="Proforma, cliente, RUC o despacho..."
              />
            </label>

            <label>
              <span>Operación</span>
              <select
                value={direction}
                onChange={(event) => {
                  setDirection(event.target.value);
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
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">Todos</option>
                <option value="DRAFT">Borrador</option>
                <option value="ISSUED">Emitida</option>
                <option value="CONVERTED">Convertida en pedido</option>
                <option value="CANCELLED">Anulada</option>
              </select>
            </label>

            <label>
              <span>Usuario emisor</span>
              <select
                value={userFilter}
                onChange={(event) => {
                  setUserFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">Todos</option>
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={styles.tablePanel}>
          <div className={styles.tableTop}>
            <div>
              <span className={styles.overline}>RESULTADOS</span>
              <strong>{filtered.length} proformas encontradas</strong>
            </div>
            <span>
              Página {safePage} de {totalPages}
            </span>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Proforma</span>
              <span>Cliente</span>
              <span>Despacho</span>
              <span>Segmento</span>
              <span>Fecha emisión</span>
              <span>Total Gs.</span>
              <span>Estado</span>
              <span>Usuario</span>
              <span />
            </div>

            {visible.map((item) => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.proformaCell}>
                  <strong>{item.number}</strong>
                  <span
                    className={
                      item.direction === "IMPORT"
                        ? styles.importBadge
                        : styles.exportBadge
                    }
                  >
                    {item.direction === "IMPORT" ? "IMPORTACIÓN" : "EXPORTACIÓN"}
                  </span>
                </div>

                <div className={styles.clientCell}>
                  <strong>{item.clientName}</strong>
                  <span>
                    {item.clientCode} · {item.ruc}
                  </span>
                </div>

                <span className={styles.dispatch}>{item.dispatchNumber}</span>

                <div className={styles.segmentCell}>
                  <strong>{item.segmentCode}</strong>
                  <span>{item.segmentName}</span>
                </div>

                <span>{formatDate(item.emissionDateTime)}</span>

                <strong className={styles.amount}>
                  {formatMoney(item.totalPYG, "PYG")}
                </strong>

                <StatusBadge status={item.status} />

                <span className={styles.user}>{item.user}</span>

                <button
                  type="button"
                  className={styles.detailButton}
                  onClick={() => setSelectedId(item.id)}
                >
                  Ver detalle →
                </button>
              </div>
            ))}

            {!visible.length && (
              <div className={styles.emptyState}>
                No se encontraron proformas con los filtros seleccionados.
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
                <span className={styles.overline}>DETALLE DE PROFORMA</span>
                <h2>{selected.number}</h2>
                <p>
                  {selected.clientName} · {selected.dispatchNumber}
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
              <div className={styles.detailActions}>
                <button
                  type="button"
                  className={styles.printButton}
                  onClick={() => downloadPdf(selected)}
                >
                  Descargar PDF
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => duplicateProforma(selected)}
                >
                  Duplicar
                </button>

                {selected.status !== "CONVERTED" &&
                  selected.status !== "CANCELLED" && (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => updateStatus(selected.id, "CONVERTED")}
                    >
                      Convertir en pedido
                    </button>
                  )}

                {selected.status !== "CANCELLED" &&
                  selected.status !== "CONVERTED" && (
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => updateStatus(selected.id, "CANCELLED")}
                    >
                      Anular
                    </button>
                  )}
              </div>

              <div className={styles.proformaDocument}>
                <section className={styles.documentHeader}>
                  <div className={styles.brandBlock}>
                    <div className={styles.brandMark}>T</div>
                    <div>
                      <span>TERMINALES PORTUARIAS S.A.</span>
                      <strong>TERPORT</strong>
                      <small>Proforma de Tasas y Servicios</small>
                    </div>
                  </div>

                  <div className={styles.documentIdentity}>
                    <span>PROFORMA</span>
                    <strong>{selected.number}</strong>
                    <small>{formatDateTime(selected.emissionDateTime)}</small>
                  </div>
                </section>

                <section className={styles.documentMeta}>
                  <DocumentInfo label="Razón social" value={selected.clientName} />
                  <DocumentInfo label="RUC" value={selected.ruc} />
                  <DocumentInfo label="Código cliente" value={selected.clientCode} />
                  <DocumentInfo label="N.º despacho" value={selected.dispatchNumber} />
                  <DocumentInfo label="Segmento" value={`${selected.segmentCode} · ${selected.segmentName}`} />
                  <DocumentInfo label="Tarifa" value={tariffLabel[selected.tariffType]} />
                  <DocumentInfo label="Usuario emisor" value={selected.user} />
                  <DocumentInfo label="Estado" value={statusLabel[selected.status]} />
                </section>

                <section className={styles.documentSection}>
                  <div className={styles.documentSectionTitle}>
                    <span>BASE DE CÁLCULO</span>
                    <strong>
                      {selected.direction === "IMPORT" ? "Importación · CIF" : "Exportación · FOB"}
                    </strong>
                  </div>

                  <div className={styles.commercialGrid}>
                    {selected.direction === "IMPORT" ? (
                      <>
                        <DocumentInfo label="Valor factura USD" value={formatMoney(selected.invoiceUSD, "USD")} />
                        <DocumentInfo label="Flete USD" value={formatMoney(selected.freightUSD, "USD")} />
                        <DocumentInfo label="Seguro USD" value={formatMoney(selected.insuranceUSD, "USD")} />
                        <DocumentInfo label="CIF USD" value={formatMoney(selected.commercialBaseUSD, "USD")} accent />
                      </>
                    ) : (
                      <DocumentInfo label="FOB USD" value={formatMoney(selected.fobUSD, "USD")} accent />
                    )}

                    <DocumentInfo label="Base en Gs." value={formatMoney(selected.commercialBasePYG, "PYG")} />
                    <DocumentInfo label="Cotización" value={selected.exchangeRate.toLocaleString("es-PY")} />
                    <DocumentInfo label="Contenedores 20'" value={String(selected.containers20)} />
                    <DocumentInfo label="Contenedores 40'" value={String(selected.containers40)} />
                  </div>
                </section>

                <section className={styles.documentSection}>
                  <div className={styles.documentSectionTitle}>
                    <span>DATOS COMERCIALES</span>
                    <strong>Información de la operación</strong>
                  </div>

                  <div className={styles.commercialGrid}>
                    <DocumentInfo label="Código factura" value={String(selected.invoiceCode)} />
                    <DocumentInfo label="Condición venta" value={String(selected.conditionSaleCode)} />
                    <DocumentInfo label="Vendedor" value={selected.seller} />
                    <DocumentInfo label="Transporte" value={selected.transport} />
                  </div>
                </section>

                <section className={styles.documentSection}>
                  <div className={styles.documentSectionTitle}>
                    <span>CONCEPTOS</span>
                    <strong>Servicios incluidos en la proforma</strong>
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
                </section>

                <section className={styles.documentTotals}>
                  <div className={styles.totalWords}>
                    <span>Total a pagar</span>
                    <strong>
                      Valores expresados según cotización aplicada a la fecha de emisión.
                    </strong>
                    {selected.notes && <small>{selected.notes}</small>}
                  </div>

                  <div className={styles.totalBox}>
                    <div>
                      <span>Total USD</span>
                      <strong>{formatMoney(selected.totalUSD, "USD")}</strong>
                    </div>
                    <div className={styles.totalMain}>
                      <span>Total Gs.</span>
                      <strong>{formatMoney(selected.totalPYG, "PYG")}</strong>
                    </div>
                    <small>
                      Cotización: {selected.exchangeRate.toLocaleString("es-PY")}
                    </small>
                  </div>
                </section>

                {selected.orderNumber && (
                  <div className={styles.orderLink}>
                    <span>Convertida en pedido</span>
                    <strong>{selected.orderNumber}</strong>
                  </div>
                )}

                <footer className={styles.documentFooter}>
                  <div>
                    <strong>PROFORMA</strong>
                    <span>Sin valor comercial</span>
                  </div>
                  <div>
                    <strong>DOCUMENTO INFORMATIVO</strong>
                    <span>Sujeta a modificaciones</span>
                  </div>
                  <div>
                    <strong>EMITIDO POR</strong>
                    <span>{selected.user}</span>
                  </div>
                </footer>
              </div>
            </div>

            <footer className={styles.modalFooter}>
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
  tone: "neutral" | "draft" | "issued" | "converted";
}) {
  return (
    <article className={`${styles.summaryCard} ${styles[`summary_${tone}`]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function StatusBadge({ status }: { status: ProformaStatus }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
      {statusLabel[status]}
    </span>
  );
}

function DocumentInfo({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`${styles.documentInfo} ${accent ? styles.documentInfoAccent : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}