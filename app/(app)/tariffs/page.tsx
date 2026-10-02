"use client";

import { useMemo, useState } from "react";
import tariffsData from "@/mock-data/tariffs.json";
import styles from "./tariffs.module.css";

type TariffType = "STANDARD" | "CORPORATE" | "GROUP";
type TariffStatus = "ACTIVE" | "EXPIRED" | "SCHEDULED";
type CalculationType = "BOX_RATE" | "PERCENTAGE" | "FIXED";
type Currency = "USD" | "PYG";

interface TariffLine {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  articleCode: string;
  calculationType: CalculationType;
  value: number;
  minimumAmount: number | null;
  currency: Currency;

  // Condiciones comerciales específicas de esta tarifa.
  // Si quedan vacías, no sustituyen el parámetro del catálogo maestro.
  freeStayDaysOverride: number | null;
  energyPriceOverride: number | null;
  freeEnergyOverride: number | null;
  rangeStartOverride: number | null;
  rangeEndOverride: number | null;
}

interface Tariff {
  id: string;
  name: string;
  type: TariffType;
  segmentCode: string;
  segmentName: string;
  ownerId: string | null;
  ownerName: string;
  validFrom: string;
  validUntil: string;
  currency: Currency;
  status: TariffStatus;
  lines: TariffLine[];
}

interface TariffHistory {
  id: string;
  tariffId: string;
  user: string;
  dateTime: string;
  action: "CREATED" | "UPDATED" | "VALIDITY";
  detail: string;
}

const initialTariffs = tariffsData as Tariff[];

const segmentNames: Record<string, string> = {
  IMPTER: "Importación Terrestre FCL",
  IMPFCL: "Importación FCL",
  IMPLCL: "Importación LCL",
  EXPFCL: "Exportación FCL",
  EXPLCL: "Exportación LCL",
  IMPFLU: "Importación Fluvial",
  EXPFLU: "Exportación Fluvial",
};

const clients = [
  { id: "0102461", name: "CLIENTE SA" },
  { id: "0001001", name: "CLIENTE 1" },
  { id: "0000258", name: "CLIENTE 2" },
  { id: "0060344", name: "CLIENTE LOGÍSTICO A" },
  { id: "0064120", name: "CLIENTE INDUSTRIAL B" },
];

const groups = [
  { id: "grp-logistico", name: "GRUPO LOGÍSTICO" },
  { id: "grp-comercial", name: "GRUPO COMERCIAL" },
  { id: "grp-industrial", name: "GRUPO INDUSTRIAL" },
];

const serviceCatalog = [
  {
    serviceId: "srv-001",
    serviceCode: "VIL11052",
    serviceName: "TASAS PORTUARIAS - BOX RATE CDE",
    calculationType: "BOX_RATE" as CalculationType,
    articleCode: "VIL11052",
  },
  {
    serviceId: "srv-002",
    serviceCode: "VIL11222",
    serviceName: "ENLACE SOFIA",
    calculationType: "FIXED" as CalculationType,
    articleCode: "VIL11222",
  },
  {
    serviceId: "srv-003",
    serviceCode: "VIL11212",
    serviceName: "VGM RES. PGN 49/2016",
    calculationType: "FIXED" as CalculationType,
    articleCode: "VIL11212",
  },
  {
    serviceId: "srv-005",
    serviceCode: "VIL21015",
    serviceName: "TASAS PORTUARIAS EXPORTACIÓN FCL",
    calculationType: "BOX_RATE" as CalculationType,
    articleCode: "VIL21015",
  },
  {
    serviceId: "srv-006",
    serviceCode: "PBIP",
    serviceName: "PROTECCIÓN DE BUQUES E INSTALACIONES PORTUARIAS",
    calculationType: "FIXED" as CalculationType,
    articleCode: "PBIP",
  },
  {
    serviceId: "srv-008",
    serviceCode: "ALM001",
    serviceName: "ALMACENAJE",
    calculationType: "FIXED" as CalculationType,
    articleCode: "ALM001",
  },
];

const initialHistory: TariffHistory[] = [
  {
    id: "h1",
    tariffId: "tar-corp-cliente-sa-impter",
    user: "Administrador TERPORT",
    dateTime: "2026-09-12T09:35:00",
    action: "UPDATED",
    detail: "Actualización de valores tarifarios negociados.",
  },
  {
    id: "h2",
    tariffId: "tar-corp-cliente-sa-impter",
    user: "Comercial",
    dateTime: "2026-09-01T08:20:00",
    action: "CREATED",
    detail: "Alta de tarifa corporativa para el segmento IMPTER.",
  },
  {
    id: "h3",
    tariffId: "tar-std-impter",
    user: "Administrador TERPORT",
    dateTime: "2026-08-15T11:10:00",
    action: "UPDATED",
    detail: "Revisión de valores de la tarifa estándar del segmento.",
  },
];

function formatType(value: TariffType) {
  if (value === "CORPORATE") return "Corporativa";
  if (value === "GROUP") return "De grupo";
  return "Estándar";
}

function formatCalculation(value: CalculationType) {
  if (value === "BOX_RATE") return "Box rate";
  if (value === "PERCENTAGE") return "Porcentual";
  return "Fija";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
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

function calculateStatus(validFrom: string, validUntil: string): TariffStatus {
  const today = new Date("2026-09-12T00:00:00");
  const from = new Date(`${validFrom}T00:00:00`);
  const until = new Date(`${validUntil}T23:59:59`);

  if (today < from) return "SCHEDULED";
  if (today > until) return "EXPIRED";
  return "ACTIVE";
}

function statusLabel(status: TariffStatus) {
  if (status === "EXPIRED") return "Vencida";
  if (status === "SCHEDULED") return "Programada";
  return "Vigente";
}

export default function TariffsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>(
    initialTariffs.map((tariff) => ({
      ...tariff,
      status: calculateStatus(tariff.validFrom, tariff.validUntil),
    }))
  );
  const [history, setHistory] = useState<TariffHistory[]>(initialHistory);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [segmentFilter, setSegmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [editDraft, setEditDraft] = useState<Tariff | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [conditionIndex, setConditionIndex] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<Tariff>({
    id: "",
    name: "",
    type: "STANDARD",
    segmentCode: "IMPTER",
    segmentName: segmentNames.IMPTER,
    ownerId: null,
    ownerName: "General",
    validFrom: "2026-09-12",
    validUntil: "2026-12-31",
    currency: "USD",
    status: "ACTIVE",
    lines: [],
  });

  const filteredTariffs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tariffs.filter((tariff) => {
      const searchMatch =
        !term ||
        tariff.name.toLowerCase().includes(term) ||
        tariff.ownerName.toLowerCase().includes(term) ||
        tariff.segmentName.toLowerCase().includes(term) ||
        tariff.segmentCode.toLowerCase().includes(term);

      return (
        searchMatch &&
        (typeFilter === "ALL" || tariff.type === typeFilter) &&
        (segmentFilter === "ALL" ||
          tariff.segmentCode === segmentFilter) &&
        (statusFilter === "ALL" || tariff.status === statusFilter)
      );
    });
  }, [tariffs, search, typeFilter, segmentFilter, statusFilter]);

  const activeCount = tariffs.filter((item) => item.status === "ACTIVE").length;
  const corporateCount = tariffs.filter(
    (item) => item.type === "CORPORATE"
  ).length;
  const expiringCount = tariffs.filter((item) => {
    if (item.status !== "ACTIVE") return false;
    const end = new Date(`${item.validUntil}T00:00:00`);
    const today = new Date("2026-09-12T00:00:00");
    const diff = Math.ceil((end.getTime() - today.getTime()) / 86400000);
    return diff >= 0 && diff <= 45;
  }).length;

  const selectedHistory = selectedTariff
    ? history.filter((item) => item.tariffId === selectedTariff.id)
    : [];

  const selectedCondition =
    editDraft && conditionIndex !== null
      ? editDraft.lines[conditionIndex] ?? null
      : null;

  function openEdit(tariff: Tariff) {
    setSelectedTariff(null);
    setEditDraft({
      ...tariff,
      lines: tariff.lines.map((line) => ({ ...line })),
    });
    setEditOpen(true);
  }

  function saveEdit() {
    if (!editDraft) return;

    const updated: Tariff = {
      ...editDraft,
      lines: editDraft.lines.map((line) => ({
        ...line,
        currency: editDraft.currency,
      })),
      status: calculateStatus(editDraft.validFrom, editDraft.validUntil),
    };

    setTariffs((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );

    setHistory((current) => [
      {
        id: `hist-${Date.now()}`,
        tariffId: updated.id,
        user: "Administrador TERPORT",
        dateTime: new Date().toISOString(),
        action: "UPDATED",
        detail: "Modificación de vigencia o condiciones tarifarias.",
      },
      ...current,
    ]);

    setEditOpen(false);
    setEditDraft(null);
  }

  function updateLineNumber(
    index: number,
    field:
      | "value"
      | "minimumAmount"
      | "freeStayDaysOverride"
      | "energyPriceOverride"
      | "freeEnergyOverride"
      | "rangeStartOverride"
      | "rangeEndOverride",
    value: string
  ) {
    setEditDraft((current) => {
      if (!current) return current;

      const lines = current.lines.map((line, lineIndex) =>
        lineIndex === index
          ? {
              ...line,
              [field]: value === "" ? null : Number(value),
            }
          : line
      );

      return { ...current, lines };
    });
  }

  function addTariffValue(serviceId: string) {
    setEditDraft((current) => {
      if (!current) return current;

      const service = serviceCatalog.find(
        (item) => item.serviceId === serviceId
      );

      if (
        !service ||
        current.lines.some((line) => line.serviceId === serviceId)
      ) {
        return current;
      }

      return {
        ...current,
        lines: [
          ...current.lines,
          {
            ...service,
            value: 0,
            minimumAmount: null,
            currency: current.currency,
            freeStayDaysOverride: null,
            energyPriceOverride: null,
            freeEnergyOverride: null,
            rangeStartOverride: null,
            rangeEndOverride: null,
          },
        ],
      };
    });
  }

  function removeTariffValue(serviceId: string) {
    setEditDraft((current) =>
      current
        ? {
            ...current,
            lines: current.lines.filter(
              (line) => line.serviceId !== serviceId
            ),
          }
        : current
    );
  }

  function resetCreate() {
    setCreateDraft({
      id: "",
      name: "",
      type: "STANDARD",
      segmentCode: "IMPTER",
      segmentName: segmentNames.IMPTER,
      ownerId: null,
      ownerName: "General",
      validFrom: "2026-09-12",
      validUntil: "2026-12-31",
      currency: "USD",
      status: "ACTIVE",
      lines: [],
    });
  }

  function createTariff() {
    const segmentName = segmentNames[createDraft.segmentCode];

    let ownerName = "General";
    let ownerId: string | null = null;

    if (createDraft.type === "CORPORATE") {
      const client = clients.find((item) => item.id === createDraft.ownerId);
      ownerName = client?.name ?? "";
      ownerId = client?.id ?? null;
    }

    if (createDraft.type === "GROUP") {
      const group = groups.find((item) => item.id === createDraft.ownerId);
      ownerName = group?.name ?? "";
      ownerId = group?.id ?? null;
    }

    if (!segmentName || (createDraft.type !== "STANDARD" && !ownerId)) {
      return;
    }

    const newTariff: Tariff = {
      ...createDraft,
      id: `tar-${Date.now()}`,
      name:
        createDraft.type === "STANDARD"
          ? `Tarifa Estándar - ${segmentName}`
          : `Tarifa ${formatType(createDraft.type)} - ${ownerName}`,
      ownerId,
      ownerName,
      segmentName,
      status: calculateStatus(
        createDraft.validFrom,
        createDraft.validUntil
      ),
    };

    setTariffs((current) => [newTariff, ...current]);

    setHistory((current) => [
      {
        id: `hist-${Date.now()}`,
        tariffId: newTariff.id,
        user: "Administrador TERPORT",
        dateTime: new Date().toISOString(),
        action: "CREATED",
        detail: `Alta de tarifa ${formatType(
          newTariff.type
        ).toLowerCase()} para ${segmentName}.`,
      },
      ...current,
    ]);

    setCreateOpen(false);
    resetCreate();
    setSelectedTariff(newTariff);
  }

  return (
    <>
      <section className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.overline}>TARIFAS</span>
            <h1>Gestión de tarifas</h1>
            <p>
              Administre precios, vigencias y condiciones tarifarias.
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.summary}>
              <div>
                <strong>{activeCount}</strong>
                <span>Vigentes</span>
              </div>
              <div>
                <strong>{corporateCount}</strong>
                <span>Corporativas</span>
              </div>
              <div>
                <strong>{expiringCount}</strong>
                <span>Por vencer</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                resetCreate();
                setCreateOpen(true);
              }}
            >
              + Nueva tarifa
            </button>
          </div>
        </header>

        <section className={styles.definitionCard}>
          <article>
            <span className={`${styles.typeIcon} ${styles.standardIcon}`}>
              E
            </span>
            <div>
              <strong>Estándar</strong>
              <p>
                Tarifa general para un segmento cuando no existe una
                condición corporativa negociada.
              </p>
            </div>
          </article>

          <article>
            <span className={`${styles.typeIcon} ${styles.corporateIcon}`}>
              C
            </span>
            <div>
              <strong>Corporativa</strong>
              <p>
                Condición tarifaria negociada con un cliente específico para
                un segmento.
              </p>
            </div>
          </article>

          <article>
            <span className={`${styles.typeIcon} ${styles.groupIcon}`}>
              G
            </span>
            <div>
              <strong>De grupo</strong>
              <p>
                Condición compartida por empresas de un mismo grupo
                económico.
              </p>
            </div>
          </article>
        </section>

        <section className={styles.conceptNote}>
          <strong>Separación de responsabilidades</strong>
          <span>
            Tarifas define valores y condiciones comerciales. La habilitación
            Cliente + Segmento + Servicio se gestiona en Clientes / Matriz de
            Servicios. Los atributos técnicos pertenecen a Servicios y
            Artículos.
          </span>
        </section>

        <section className={styles.filtersCard}>
          <div className={styles.searchField}>
            <label>Buscar tarifa</label>
            <input
              type="search"
              placeholder="Cliente, grupo, segmento o tarifa"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label>Tipo</label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="STANDARD">Estándar</option>
              <option value="CORPORATE">Corporativa</option>
              <option value="GROUP">De grupo</option>
            </select>
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
            <label>Estado</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Vigentes</option>
              <option value="SCHEDULED">Programadas</option>
              <option value="EXPIRED">Vencidas</option>
            </select>
          </div>

          <button
            type="button"
            className={styles.clearButton}
            onClick={() => {
              setSearch("");
              setTypeFilter("ALL");
              setSegmentFilter("ALL");
              setStatusFilter("ALL");
            }}
          >
            Limpiar filtros
          </button>
        </section>

        <section className={styles.listCard}>
          <div className={styles.listHeader}>
            <div>
              <span className={styles.overline}>LISTADO</span>
              <h2>Tarifas configuradas</h2>
              <p>
                {filteredTariffs.length} resultado
                {filteredTariffs.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tarifa</th>
                  <th>Tipo</th>
                  <th>Aplicada a</th>
                  <th>Segmento</th>
                  <th>Vigencia</th>
                  <th>Valores</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>

              <tbody>
                {filteredTariffs.map((tariff) => (
                  <tr
                    key={tariff.id}
                    onClick={() => setSelectedTariff(tariff)}
                  >
                    <td>
                      <div className={styles.tariffCell}>
                        <span
                          className={`${styles.tariffAvatar} ${
                            tariff.type === "STANDARD"
                              ? styles.standardAvatar
                              : tariff.type === "CORPORATE"
                              ? styles.corporateAvatar
                              : styles.groupAvatar
                          }`}
                        >
                          {tariff.type === "STANDARD"
                            ? "E"
                            : tariff.type === "CORPORATE"
                            ? "C"
                            : "G"}
                        </span>

                        <div>
                          <strong>{tariff.name}</strong>
                          <span>{tariff.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={styles.typeBadge}>
                        {formatType(tariff.type)}
                      </span>
                    </td>

                    <td>{tariff.ownerName}</td>

                    <td>
                      <span className={styles.segmentChip}>
                        {tariff.segmentCode}
                      </span>
                    </td>

                    <td>
                      <div className={styles.dateCell}>
                        <strong>{formatDate(tariff.validUntil)}</strong>
                        <span>Desde {formatDate(tariff.validFrom)}</span>
                      </div>
                    </td>

                    <td>{tariff.lines.length}</td>

                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          tariff.status === "ACTIVE"
                            ? styles.statusActive
                            : tariff.status === "EXPIRED"
                            ? styles.statusExpired
                            : styles.statusScheduled
                        }`}
                      >
                        <i />
                        {statusLabel(tariff.status)}
                      </span>
                    </td>

                    <td className={styles.actionCell}>
                      <button
                        type="button"
                        className={styles.detailButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedTariff(tariff);
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
                        >
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {selectedTariff && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>DETALLE DE TARIFA</span>
                <h2>{selectedTariff.name}</h2>
                <p>
                  {selectedTariff.segmentCode} ·{" "}
                  {selectedTariff.segmentName}
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setSelectedTariff(null)}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <section className={styles.detailGrid}>
                <div>
                  <span>Tipo</span>
                  <strong>{formatType(selectedTariff.type)}</strong>
                </div>
                <div>
                  <span>Aplicada a</span>
                  <strong>{selectedTariff.ownerName}</strong>
                </div>
                <div>
                  <span>Segmento</span>
                  <strong>{selectedTariff.segmentName}</strong>
                </div>
                <div>
                  <span>Moneda</span>
                  <strong>{selectedTariff.currency}</strong>
                </div>
                <div>
                  <span>Desde</span>
                  <strong>{formatDate(selectedTariff.validFrom)}</strong>
                </div>
                <div>
                  <span>Hasta</span>
                  <strong>{formatDate(selectedTariff.validUntil)}</strong>
                </div>
              </section>

              <section className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3>Condiciones tarifarias</h3>
                    <p>
                      Valores negociados para servicios del catálogo maestro.
                      Esta pantalla no habilita servicios al cliente.
                    </p>
                  </div>
                </div>

                <div className={styles.linesTable}>
                  <div className={styles.linesHeader}>
                    <span>Servicio</span>
                    <span>Artículo</span>
                    <span>Cálculo</span>
                    <span>Valor tarifario</span>
                    <span>Mínimo específico</span>
                  </div>

                  {selectedTariff.lines.map((line) => (
                    <div className={styles.lineRow} key={line.serviceId}>
                      <div>
                        <strong>{line.serviceName}</strong>
                        <span>{line.serviceCode}</span>
                      </div>
                      <code>{line.articleCode}</code>
                      <span>{formatCalculation(line.calculationType)}</span>
                      <strong>
                        {line.currency} {line.value.toLocaleString("es-PY")}
                      </strong>
                      <span>
                        {line.minimumAmount == null
                          ? "Sin sustitución"
                          : `${line.currency} ${line.minimumAmount.toLocaleString(
                              "es-PY"
                            )}`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.helpBar}>
                  <strong>Mínimo específico:</strong>
                  <span>
                    solo se informa cuando esta tarifa necesita sustituir el
                    mínimo definido para el servicio. Vacío = sin sustitución.
                  </span>
                </div>
              </section>

              <section className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3>Historial de cambios</h3>
                    <p>
                      Trazabilidad de altas y modificaciones de la tarifa.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setHistoryOpen(true)}
                  >
                    Ver historial
                  </button>
                </div>

                <div className={styles.historyPreview}>
                  <div>
                    <span>Última modificación</span>
                    <strong>
                      {selectedHistory[0]
                        ? formatDateTime(selectedHistory[0].dateTime)
                        : "Sin movimientos"}
                    </strong>
                  </div>
                  <div>
                    <span>Usuario</span>
                    <strong>{selectedHistory[0]?.user ?? "—"}</strong>
                  </div>
                  <div>
                    <span>Acción</span>
                    <strong>
                      {selectedHistory[0]?.action === "CREATED"
                        ? "Creación"
                        : selectedHistory[0]?.action === "VALIDITY"
                        ? "Vigencia"
                        : "Modificación"}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            <footer className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setSelectedTariff(null)}
              >
                Cerrar
              </button>

              <button
                className={styles.primaryButton}
                onClick={() => openEdit(selectedTariff)}
              >
                Editar tarifa
              </button>
            </footer>
          </div>
        </div>
      )}

      {editOpen && editDraft && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modal} ${styles.largeModal}`}>
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>EDITAR TARIFA</span>
                <h2>{editDraft.name}</h2>
                <p>
                  Configure únicamente valores y condiciones comerciales de
                  esta tarifa.
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => {
                  setEditOpen(false);
                  setEditDraft(null);
                }}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <section className={styles.scopeSection}>
                <div className={styles.formGrid}>
                  <label>
                    <span>Tipo</span>
                    <input value={formatType(editDraft.type)} disabled />
                  </label>

                  <label>
                    <span>Aplicada a</span>
                    <input value={editDraft.ownerName} disabled />
                  </label>

                  <label>
                    <span>Segmento</span>
                    <input value={editDraft.segmentName} disabled />
                  </label>

                  <label>
                    <span>Vigencia desde</span>
                    <input
                      type="date"
                      value={editDraft.validFrom}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? { ...current, validFrom: event.target.value }
                            : current
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>Vigencia hasta</span>
                    <input
                      type="date"
                      value={editDraft.validUntil}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? { ...current, validUntil: event.target.value }
                            : current
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>Moneda</span>
                    <select
                      value={editDraft.currency}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? {
                                ...current,
                                currency: event.target.value as Currency,
                              }
                            : current
                        )
                      }
                    >
                      <option value="USD">USD</option>
                      <option value="PYG">PYG</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3>Condiciones tarifarias</h3>
                    <p>
                      Agregue valores para servicios ya existentes en el
                      catálogo. Esto no habilita el servicio para ningún
                      cliente.
                    </p>
                  </div>

                  <select
                    className={styles.addServiceSelect}
                    defaultValue=""
                    onChange={(event) => {
                      if (event.target.value) {
                        addTariffValue(event.target.value);
                        event.target.value = "";
                      }
                    }}
                  >
                    <option value="">+ Agregar valor de servicio</option>
                    {serviceCatalog
                      .filter(
                        (service) =>
                          !editDraft.lines.some(
                            (line) => line.serviceId === service.serviceId
                          )
                      )
                      .map((service) => (
                        <option
                          key={service.serviceId}
                          value={service.serviceId}
                        >
                          {service.serviceCode} - {service.serviceName}
                        </option>
                      ))}
                  </select>
                </div>

                <div className={styles.editLines}>
                  <div className={styles.editLinesHeader}>
                    <span>Servicio</span>
                    <span>Cálculo</span>
                    <span>Valor tarifario</span>
                    <span>Mínimo específico</span>
                    <span>Condiciones</span>
                    <span />
                  </div>

                  {editDraft.lines.map((line, index) => (
                    <div className={styles.editLineRow} key={line.serviceId}>
                      <div>
                        <strong>{line.serviceName}</strong>
                        <span>{line.articleCode}</span>
                      </div>

                      <span>{formatCalculation(line.calculationType)}</span>

                      <label className={styles.moneyInput}>
                        <span>{editDraft.currency}</span>
                        <input
                          type="number"
                          value={line.value}
                          onChange={(event) =>
                            updateLineNumber(
                              index,
                              "value",
                              event.target.value
                            )
                          }
                        />
                      </label>

                      <label className={styles.moneyInput}>
                        <span>{editDraft.currency}</span>
                        <input
                          type="number"
                          placeholder="Opcional"
                          value={line.minimumAmount ?? ""}
                          onChange={(event) =>
                            updateLineNumber(
                              index,
                              "minimumAmount",
                              event.target.value
                            )
                          }
                        />
                      </label>

                      <button
                        type="button"
                        className={styles.conditionButton}
                        onClick={() => setConditionIndex(index)}
                      >
                        Configurar
                      </button>

                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeTariffValue(line.serviceId)}
                      >
                        Quitar valor
                      </button>
                    </div>
                  ))}
                </div>

                <div className={styles.helpBar}>
                  <strong>Importante:</strong>
                  <span>
                    “Quitar valor” elimina únicamente la condición de esta
                    tarifa. No elimina el servicio del catálogo ni modifica
                    la matriz del cliente.
                  </span>
                </div>
              </section>
            </div>

            <footer className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setEditOpen(false);
                  setEditDraft(null);
                }}
              >
                Cancelar
              </button>

              <button className={styles.primaryButton} onClick={saveEdit}>
                Guardar cambios
              </button>
            </footer>
          </div>
        </div>
      )}

      {selectedCondition && conditionIndex !== null && (
        <div className={`${styles.modalBackdrop} ${styles.nestedBackdrop}`}>
          <div className={`${styles.modal} ${styles.conditionModal}`}>
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>
                  CONDICIONES ESPECÍFICAS
                </span>
                <h2>{selectedCondition.serviceName}</h2>
                <p>
                  Parámetros comerciales que pueden sustituirse para esta
                  tarifa cuando corresponda.
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setConditionIndex(null)}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.conditionNotice}>
                <strong>No modifica el servicio maestro.</strong>
                <span>
                  Estos campos representan condiciones específicas de la
                  tarifa. Si quedan vacíos, no existe sustitución tarifaria
                  para ese parámetro.
                </span>
              </div>

              <section className={styles.formGrid}>
                <label>
                  <span>Días libres de estadía</span>
                  <input
                    type="number"
                    placeholder="Sin sustitución"
                    value={selectedCondition.freeStayDaysOverride ?? ""}
                    onChange={(event) =>
                      updateLineNumber(
                        conditionIndex,
                        "freeStayDaysOverride",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Precio energía</span>
                  <input
                    type="number"
                    placeholder="Sin sustitución"
                    value={selectedCondition.energyPriceOverride ?? ""}
                    onChange={(event) =>
                      updateLineNumber(
                        conditionIndex,
                        "energyPriceOverride",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Energía libre</span>
                  <input
                    type="number"
                    placeholder="Sin sustitución"
                    value={selectedCondition.freeEnergyOverride ?? ""}
                    onChange={(event) =>
                      updateLineNumber(
                        conditionIndex,
                        "freeEnergyOverride",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Rango inicial</span>
                  <input
                    type="number"
                    placeholder="Sin sustitución"
                    value={selectedCondition.rangeStartOverride ?? ""}
                    onChange={(event) =>
                      updateLineNumber(
                        conditionIndex,
                        "rangeStartOverride",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Rango final</span>
                  <input
                    type="number"
                    placeholder="Sin sustitución"
                    value={selectedCondition.rangeEndOverride ?? ""}
                    onChange={(event) =>
                      updateLineNumber(
                        conditionIndex,
                        "rangeEndOverride",
                        event.target.value
                      )
                    }
                  />
                </label>
              </section>
            </div>

            <footer className={styles.modalFooter}>
              <button
                className={styles.primaryButton}
                onClick={() => setConditionIndex(null)}
              >
                Aplicar
              </button>
            </footer>
          </div>
        </div>
      )}

      {createOpen && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modal} ${styles.largeModal}`}>
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>NUEVA TARIFA</span>
                <h2>Crear tarifa</h2>
                <p>
                  Defina el tipo, ámbito y vigencia. Los valores se agregan
                  después desde la edición de la tarifa.
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setCreateOpen(false)}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <section className={styles.formGrid}>
                <label>
                  <span>Tipo de tarifa</span>
                  <select
                    value={createDraft.type}
                    onChange={(event) => {
                      const type = event.target.value as TariffType;
                      setCreateDraft((current) => ({
                        ...current,
                        type,
                        ownerId: null,
                        ownerName: type === "STANDARD" ? "General" : "",
                      }));
                    }}
                  >
                    <option value="STANDARD">Estándar</option>
                    <option value="CORPORATE">Corporativa</option>
                    <option value="GROUP">De grupo</option>
                  </select>
                </label>

                {createDraft.type === "CORPORATE" && (
                  <label>
                    <span>Cliente</span>
                    <select
                      value={createDraft.ownerId ?? ""}
                      onChange={(event) =>
                        setCreateDraft((current) => ({
                          ...current,
                          ownerId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Seleccione cliente...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {createDraft.type === "GROUP" && (
                  <label>
                    <span>Grupo económico</span>
                    <select
                      value={createDraft.ownerId ?? ""}
                      onChange={(event) =>
                        setCreateDraft((current) => ({
                          ...current,
                          ownerId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Seleccione grupo...</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label>
                  <span>Segmento</span>
                  <select
                    value={createDraft.segmentCode}
                    onChange={(event) =>
                      setCreateDraft((current) => ({
                        ...current,
                        segmentCode: event.target.value,
                        segmentName: segmentNames[event.target.value],
                      }))
                    }
                  >
                    {Object.entries(segmentNames).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Vigencia desde</span>
                  <input
                    type="date"
                    value={createDraft.validFrom}
                    onChange={(event) =>
                      setCreateDraft((current) => ({
                        ...current,
                        validFrom: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>Vigencia hasta</span>
                  <input
                    type="date"
                    value={createDraft.validUntil}
                    onChange={(event) =>
                      setCreateDraft((current) => ({
                        ...current,
                        validUntil: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>Moneda</span>
                  <select
                    value={createDraft.currency}
                    onChange={(event) =>
                      setCreateDraft((current) => ({
                        ...current,
                        currency: event.target.value as Currency,
                      }))
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="PYG">PYG</option>
                  </select>
                </label>
              </section>

              <div className={styles.creationNote}>
                La nueva tarifa define el acuerdo de precio y vigencia. La
                habilitación de servicios para clientes continúa en Clientes /
                Matriz de Servicios.
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </button>

              <button className={styles.primaryButton} onClick={createTariff}>
                Crear tarifa
              </button>
            </footer>
          </div>
        </div>
      )}

      {historyOpen && selectedTariff && (
        <div className={`${styles.modalBackdrop} ${styles.nestedBackdrop}`}>
          <div className={`${styles.modal} ${styles.historyModal}`}>
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>TRAZABILIDAD</span>
                <h2>Historial de la tarifa</h2>
                <p>{selectedTariff.name}</p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setHistoryOpen(false)}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.historyTable}>
                <div className={styles.historyHeader}>
                  <span>Fecha y hora</span>
                  <span>Usuario</span>
                  <span>Acción</span>
                  <span>Detalle</span>
                </div>

                {selectedHistory.map((item) => (
                  <div className={styles.historyRow} key={item.id}>
                    <span>{formatDateTime(item.dateTime)}</span>
                    <strong>{item.user}</strong>
                    <span>
                      {item.action === "CREATED"
                        ? "Creación"
                        : item.action === "VALIDITY"
                        ? "Vigencia"
                        : "Modificación"}
                    </span>
                    <span>{item.detail}</span>
                  </div>
                ))}

                {selectedHistory.length === 0 && (
                  <div className={styles.emptyHistory}>
                    No existen movimientos registrados.
                  </div>
                )}
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setHistoryOpen(false)}
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