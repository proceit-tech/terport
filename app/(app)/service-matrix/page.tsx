"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clientsData from "@/mock-data/clients.json";
import servicesData from "@/mock-data/services.json";
import matrixData from "@/mock-data/service-matrix.json";
import styles from "./service-matrix.module.css";

type TariffType = "STANDARD" | "CORPORATE" | "GROUP";

interface ClientConfiguration {
  segmentCode: string;
  segmentName: string;
  tariffType: TariffType;
  validUntil: string;
  status: string;
}

interface Client {
  id: string;
  code: string;
  name: string;
  ruc: string;
  city: string;
  country: string;
  billable: boolean;
  configurations: ClientConfiguration[];
}

interface ServiceBinding {
  segmentCode: string;
  articleCode: string;
}

interface Service {
  id: string;
  code: string;
  name: string;
  segments: ServiceBinding[];
  active: boolean;
}

interface MatrixSegment {
  segmentCode: string;
  serviceIds: string[];
  tariffType: TariffType;
  validUntil: string;
}

interface MatrixEntry {
  clientId: string;
  segments: MatrixSegment[];
}

const clients = clientsData as Client[];
const services = servicesData as Service[];
const matrix = matrixData as MatrixEntry[];

const segmentNames: Record<string, string> = {
  IMPTER: "Importación Terrestre FCL",
  IMPFCL: "Importación FCL",
  IMPLCL: "Importación LCL",
  EXPFCL: "Exportación FCL",
  EXPLCL: "Exportación LCL",
  IMPFLU: "Importación Fluvial",
  EXPFLU: "Exportación Fluvial",
};

function formatTariffType(type: TariffType) {
  if (type === "CORPORATE") return "Corporativa";
  if (type === "GROUP") return "De grupo";
  return "Estándar";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function ServiceMatrixPage() {
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return clients.map((client) => {
      const entry = matrix.find((item) => item.clientId === client.id);

      return {
        client,
        segments: entry?.segments ?? [],
      };
    });
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter(({ client, segments }) => {
      const matchesSearch =
        !term ||
        client.code.toLowerCase().includes(term) ||
        client.name.toLowerCase().includes(term) ||
        client.ruc.toLowerCase().includes(term);

      const matchesSegment =
        segmentFilter === "ALL" ||
        segments.some((segment) => segment.segmentCode === segmentFilter);

      const matchesService =
        serviceFilter === "ALL" ||
        segments.some((segment) => segment.serviceIds.includes(serviceFilter));

      const hasConfiguration = segments.length > 0;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "CONFIGURED" && hasConfiguration) ||
        (statusFilter === "UNCONFIGURED" && !hasConfiguration);

      return (
        matchesSearch &&
        matchesSegment &&
        matchesService &&
        matchesStatus
      );
    });
  }, [rows, search, segmentFilter, serviceFilter, statusFilter]);

  const configuredClients = rows.filter(
    (row) => row.segments.length > 0
  ).length;

  const activeSegments = rows.reduce(
    (total, row) => total + row.segments.length,
    0
  );

  const activeRelations = rows.reduce(
    (total, row) =>
      total +
      row.segments.reduce(
        (segmentTotal, segment) =>
          segmentTotal + segment.serviceIds.length,
        0
      ),
    0
  );

  const selectedRow = selectedClientId
    ? rows.find((row) => row.client.id === selectedClientId) ?? null
    : null;

  return (
    <>
      <section className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.overline}>MATRIZ DE SERVICIOS</span>
            <h1>Cliente × Segmento × Servicio</h1>
            <p>
              Consulte globalmente qué servicios están habilitados para cada
              cliente y segmento.
            </p>
          </div>

          <div className={styles.summary}>
            <div>
              <strong>{clients.length}</strong>
              <span>Clientes</span>
            </div>

            <div>
              <strong>{configuredClients}</strong>
              <span>Configurados</span>
            </div>

            <div>
              <strong>{activeSegments}</strong>
              <span>Segmentos activos</span>
            </div>

            <div>
              <strong>{activeRelations}</strong>
              <span>Relaciones</span>
            </div>
          </div>
        </header>

        <section className={styles.scopeNote}>
          <div className={styles.scopeIcon}>i</div>

          <div>
            <strong>Vista global de consulta</strong>
            <span>
              Esta matriz no crea servicios ni modifica tarifas. La
              configuración se administra desde Clientes.
            </span>
          </div>
        </section>

        <section className={styles.filtersCard}>
          <div className={styles.searchField}>
            <label>Buscar cliente</label>
            <input
              type="search"
              placeholder="Código, razón social o RUC"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label>Segmento</label>
            <select
              value={segmentFilter}
              onChange={(event) => setSegmentFilter(event.target.value)}
            >
              <option value="ALL">Todos los segmentos</option>
              {Object.entries(segmentNames).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label>Servicio</label>
            <select
              value={serviceFilter}
              onChange={(event) => setServiceFilter(event.target.value)}
            >
              <option value="ALL">Todos los servicios</option>
              {services
                .filter((service) => service.active)
                .map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.code} - {service.name}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label>Configuración</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="CONFIGURED">Configurados</option>
              <option value="UNCONFIGURED">Sin configurar</option>
            </select>
          </div>

          <button
            type="button"
            className={styles.clearButton}
            onClick={() => {
              setSearch("");
              setSegmentFilter("ALL");
              setServiceFilter("ALL");
              setStatusFilter("ALL");
            }}
          >
            Limpiar filtros
          </button>
        </section>

        <section className={styles.listCard}>
          <div className={styles.listHeader}>
            <div>
              <span className={styles.overline}>CONSULTA GLOBAL</span>
              <h2>Matriz por cliente</h2>
              <p>
                {filteredRows.length} resultado
                {filteredRows.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className={styles.matrixHeader}>
            <div className={styles.clientHeader}>Cliente</div>

            {Object.entries(segmentNames).map(([code, name]) => (
              <div className={styles.segmentHeader} key={code}>
                <strong>{code}</strong>
                <span>{name}</span>
              </div>
            ))}

            <div className={styles.actionHeader} />
          </div>

          <div className={styles.matrixBody}>
            {filteredRows.map(({ client, segments }) => (
              <div
                className={styles.matrixRow}
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
              >
                <div className={styles.clientCell}>
                  <div className={styles.clientAvatar}>
                    {client.name.slice(0, 1)}
                  </div>

                  <div>
                    <strong>{client.name}</strong>
                    <span>{client.code}</span>
                  </div>
                </div>

                {Object.keys(segmentNames).map((segmentCode) => {
                  const segment = segments.find(
                    (item) => item.segmentCode === segmentCode
                  );

                  return (
                    <div className={styles.matrixCell} key={segmentCode}>
                      {segment ? (
                        <div className={styles.configuredCell}>
                          <span className={styles.checkMark}>✓</span>

                          <div>
                            <strong>
                              {segment.serviceIds.length} servicio
                              {segment.serviceIds.length === 1 ? "" : "s"}
                            </strong>
                            <span>
                              {formatTariffType(segment.tariffType)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className={styles.emptyMark}>—</span>
                      )}
                    </div>
                  );
                })}

                <div className={styles.actionCell}>
                  <button
                    type="button"
                    className={styles.detailButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedClientId(client.id);
                    }}
                  >
                    <span>Ver detalle</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {selectedRow && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>DETALLE DE MATRIZ</span>
                <h2>{selectedRow.client.name}</h2>
                <p>
                  {selectedRow.client.code} · {selectedRow.client.ruc}
                </p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedClientId(null)}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <section className={styles.clientSummary}>
                <div>
                  <span>Localidad</span>
                  <strong>{selectedRow.client.city}</strong>
                </div>

                <div>
                  <span>Facturable</span>
                  <strong>
                    {selectedRow.client.billable ? "Sí" : "No"}
                  </strong>
                </div>

                <div>
                  <span>Segmentos configurados</span>
                  <strong>{selectedRow.segments.length}</strong>
                </div>

                <div>
                  <span>Servicios habilitados</span>
                  <strong>
                    {selectedRow.segments.reduce(
                      (total, segment) =>
                        total + segment.serviceIds.length,
                      0
                    )}
                  </strong>
                </div>
              </section>

              {selectedRow.segments.length > 0 ? (
                <section className={styles.detailSection}>
                  <div className={styles.detailSectionHeader}>
                    <div>
                      <h3>Configuración por segmento</h3>
                      <p>
                        Servicios habilitados actualmente para cada segmento
                        del cliente.
                      </p>
                    </div>
                  </div>

                  <div className={styles.segmentCards}>
                    {selectedRow.segments.map((segment) => (
                      <article
                        className={styles.segmentCard}
                        key={segment.segmentCode}
                      >
                        <header>
                          <div>
                            <span>{segment.segmentCode}</span>
                            <strong>
                              {segmentNames[segment.segmentCode] ??
                                segment.segmentCode}
                            </strong>
                          </div>

                          <span className={styles.tariffBadge}>
                            {formatTariffType(segment.tariffType)}
                          </span>
                        </header>

                        <div className={styles.segmentMeta}>
                          <span>Vigencia</span>
                          <strong>{formatDate(segment.validUntil)}</strong>
                        </div>

                        <div className={styles.serviceList}>
                          {segment.serviceIds.map((serviceId) => {
                            const service = services.find(
                              (item) => item.id === serviceId
                            );

                            return (
                              <div
                                className={styles.serviceItem}
                                key={serviceId}
                              >
                                <span className={styles.serviceDot} />
                                <div>
                                  <strong>
                                    {service?.name ?? "Servicio no encontrado"}
                                  </strong>
                                  <span>{service?.code ?? serviceId}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : (
                <div className={styles.emptyState}>
                  <strong>Cliente sin configuración tarifaria</strong>
                  <span>
                    Este cliente todavía no posee segmentos y servicios
                    configurados en la matriz.
                  </span>
                </div>
              )}
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setSelectedClientId(null)}
              >
                Cerrar
              </button>

              <Link
                href={`/clients/${selectedRow.client.id}`}
                className={styles.primaryLink}
              >
                Ir a configuración del cliente
              </Link>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}