"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clientsData from "@/mock-data/clients.json";
import styles from "./clients.module.css";

type TariffType = "STANDARD" | "CORPORATE" | "GROUP";

interface ClientConfiguration {
  segmentCode: string;
  segmentName: string;
  tariffType: TariffType;
  validUntil: string;
  status: "CONFIGURED";
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

type ConfigurationStatus = "CONFIGURED" | "PARTIAL" | "UNCONFIGURED";

const clients = clientsData as Client[];

function formatTariffType(value: TariffType): string {
  if (value === "CORPORATE") return "Corporativa";
  if (value === "GROUP") return "De grupo";
  return "Estándar";
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getConfigurationStatus(client: Client): ConfigurationStatus {
  if (!client.configurations || client.configurations.length === 0) {
    return "UNCONFIGURED";
  }

  const hasIncompleteConfiguration = client.configurations.some(
    (configuration) =>
      !configuration.segmentCode ||
      !configuration.tariffType ||
      !configuration.validUntil
  );

  return hasIncompleteConfiguration ? "PARTIAL" : "CONFIGURED";
}

function getStatusLabel(status: ConfigurationStatus): string {
  if (status === "CONFIGURED") return "Configurado";
  if (status === "PARTIAL") return "Parcial";
  return "Sin configurar";
}

function getNearestExpiration(client: Client): string | null {
  const dates = (client.configurations ?? [])
    .map((configuration) => configuration.validUntil)
    .filter(Boolean)
    .sort();

  return dates[0] ?? null;
}

function getPrimaryTariff(client: Client): TariffType | null {
  if (!client.configurations?.length) return null;

  const unique = Array.from(
    new Set(client.configurations.map((item) => item.tariffType))
  );

  return unique.length === 1 ? unique[0] : null;
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("ALL");
  const [configurationFilter, setConfigurationFilter] = useState("ALL");
  const [tariffFilter, setTariffFilter] = useState("ALL");
  const [billableFilter, setBillableFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const segmentOptions = useMemo(() => {
    const map = new Map<string, string>();

    clients.forEach((client) => {
      client.configurations?.forEach((configuration) => {
        map.set(configuration.segmentCode, configuration.segmentName);
      });
    });

    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return clients.filter((client) => {
      const status = getConfigurationStatus(client);

      const matchesSearch =
        !normalizedSearch ||
        client.code.toLowerCase().includes(normalizedSearch) ||
        client.name.toLowerCase().includes(normalizedSearch) ||
        client.ruc.toLowerCase().includes(normalizedSearch);

      const matchesSegment =
        segmentFilter === "ALL" ||
        client.configurations?.some(
          (configuration) => configuration.segmentCode === segmentFilter
        );

      const matchesConfiguration =
        configurationFilter === "ALL" ||
        status === configurationFilter;

      const matchesTariff =
        tariffFilter === "ALL" ||
        client.configurations?.some(
          (configuration) => configuration.tariffType === tariffFilter
        );

      const matchesBillable =
        billableFilter === "ALL" ||
        (billableFilter === "YES" && client.billable) ||
        (billableFilter === "NO" && !client.billable);

      return (
        matchesSearch &&
        matchesSegment &&
        matchesConfiguration &&
        matchesTariff &&
        matchesBillable
      );
    });
  }, [
    search,
    segmentFilter,
    configurationFilter,
    tariffFilter,
    billableFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedClients = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, pageSize, safeCurrentPage]);

  function updateFilter(callback: () => void) {
    callback();
    setCurrentPage(1);
  }

  function clearFilters() {
    setSearch("");
    setSegmentFilter("ALL");
    setConfigurationFilter("ALL");
    setTariffFilter("ALL");
    setBillableFilter("ALL");
    setCurrentPage(1);
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.overline}>CLIENTES</span>
          <h1>Configuración tarifaria por cliente</h1>
          <p>
            Consulte los clientes disponibles y administre sus segmentos,
            tarifas y servicios.
          </p>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryIcon}>CL</span>
            <div>
              <strong>{clients.length}</strong>
              <span>Clientes</span>
            </div>
          </div>

          <div className={styles.summaryItem}>
            <span className={`${styles.summaryIcon} ${styles.summaryIconOk}`}>OK</span>
            <div>
              <strong>
                {
                  clients.filter(
                    (client) =>
                      getConfigurationStatus(client) === "CONFIGURED"
                  ).length
                }
              </strong>
              <span>Configurados</span>
            </div>
          </div>

          <div className={styles.summaryItem}>
            <span className={`${styles.summaryIcon} ${styles.summaryIconPending}`}>!</span>
            <div>
              <strong>
                {
                  clients.filter(
                    (client) =>
                      getConfigurationStatus(client) === "UNCONFIGURED"
                  ).length
                }
              </strong>
              <span>Sin configurar</span>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.filtersCard}>
        <div className={styles.searchField}>
          <label htmlFor="client-search">Buscar cliente</label>
          <input
            id="client-search"
            type="search"
            placeholder="Código, razón social o RUC"
            value={search}
            onChange={(event) =>
              updateFilter(() => setSearch(event.target.value))
            }
          />
        </div>

        <div className={styles.filterField}>
          <label htmlFor="segment-filter">Segmento</label>
          <select
            id="segment-filter"
            value={segmentFilter}
            onChange={(event) =>
              updateFilter(() => setSegmentFilter(event.target.value))
            }
          >
            <option value="ALL">Todos los segmentos</option>

            {segmentOptions.map((segment) => (
              <option key={segment.code} value={segment.code}>
                {segment.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterField}>
          <label htmlFor="configuration-filter">Configuración</label>
          <select
            id="configuration-filter"
            value={configurationFilter}
            onChange={(event) =>
              updateFilter(() =>
                setConfigurationFilter(event.target.value)
              )
            }
          >
            <option value="ALL">Todos</option>
            <option value="CONFIGURED">Configurados</option>
            <option value="PARTIAL">Parciales</option>
            <option value="UNCONFIGURED">Sin configurar</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label htmlFor="tariff-filter">Tipo de tarifa</label>
          <select
            id="tariff-filter"
            value={tariffFilter}
            onChange={(event) =>
              updateFilter(() => setTariffFilter(event.target.value))
            }
          >
            <option value="ALL">Todas</option>
            <option value="STANDARD">Estándar</option>
            <option value="CORPORATE">Corporativa</option>
            <option value="GROUP">De grupo</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label htmlFor="billable-filter">Facturable</label>
          <select
            id="billable-filter"
            value={billableFilter}
            onChange={(event) =>
              updateFilter(() => setBillableFilter(event.target.value))
            }
          >
            <option value="ALL">Todos</option>
            <option value="YES">Sí</option>
            <option value="NO">No</option>
          </select>
        </div>

        <button
          type="button"
          className={styles.clearButton}
          onClick={clearFilters}
        >
          Limpiar filtros
        </button>
      </section>

      <section className={styles.listCard}>
        <div className={styles.listHeader}>
          <div>
            <span className={styles.overline}>LISTADO</span>
            <h2>Clientes disponibles</h2>
            <p>
              {filteredClients.length} resultado
              {filteredClients.length === 1 ? "" : "s"}
            </p>
          </div>

          <label className={styles.pageSize}>
            <span>Mostrar</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>RUC</th>
                <th>Localidad</th>
                <th>Segmentos</th>
                <th>Tarifa</th>
                <th>Próx. vencimiento</th>
                <th>Facturable</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>

            <tbody>
              {paginatedClients.map((client) => {
                const configurationStatus = getConfigurationStatus(client);
                const nearestExpiration = getNearestExpiration(client);
                const primaryTariff = getPrimaryTariff(client);

                return (
                  <tr key={client.id}>
                    <td>
                      <div className={styles.clientCell}>
                        <div className={styles.clientAvatar}>
                          {client.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{client.name}</strong>
                          <span>{client.code}</span>
                        </div>
                      </div>
                    </td>

                    <td>{client.ruc}</td>
                    <td>{client.city}</td>

                    <td>
                      {client.configurations?.length ? (
                        <div className={styles.segmentChips}>
                          {client.configurations.slice(0, 2).map((item) => (
                            <span key={item.segmentCode}>
                              {item.segmentCode}
                            </span>
                          ))}

                          {client.configurations.length > 2 && (
                            <span>
                              +{client.configurations.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>

                    <td>
                      {primaryTariff ? (
                        formatTariffType(primaryTariff)
                      ) : client.configurations?.length ? (
                        "Mixta"
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>

                    <td>
                      {nearestExpiration ? (
                        formatDate(nearestExpiration)
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`${styles.booleanBadge} ${
                          client.billable
                            ? styles.booleanYes
                            : styles.booleanNo
                        }`}
                      >
                        {client.billable ? "Sí" : "No"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          configurationStatus === "CONFIGURED"
                            ? styles.statusConfigured
                            : configurationStatus === "PARTIAL"
                            ? styles.statusPartial
                            : styles.statusUnconfigured
                        }`}
                      >
                        <i />
                        {getStatusLabel(configurationStatus)}
                      </span>
                    </td>

                    <td className={styles.actionCell}>
                      <Link
                        href={`/clients/${client.id}`}
                        className={styles.configureButton}
                      >
                        <span>Configurar</span>
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
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {paginatedClients.length === 0 && (
                <tr>
                  <td colSpan={9} className={styles.emptyState}>
                    No se encontraron clientes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className={styles.pagination}>
          <div>
            Mostrando{" "}
            <strong>
              {filteredClients.length === 0
                ? 0
                : (safeCurrentPage - 1) * pageSize + 1}
            </strong>{" "}
            a{" "}
            <strong>
              {Math.min(
                safeCurrentPage * pageSize,
                filteredClients.length
              )}
            </strong>{" "}
            de <strong>{filteredClients.length}</strong>
          </div>

          <div className={styles.paginationControls}>
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() =>
                setCurrentPage((current) => Math.max(1, current - 1))
              }
            >
              Anterior
            </button>

            <span>
              Página {safeCurrentPage} de {totalPages}
            </span>

            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
            >
              Siguiente
            </button>
          </div>
        </footer>
      </section>
    </section>
  );
}