"use client";

import { useMemo, useState } from "react";
import servicesData from "@/mock-data/services.json";
import styles from "./services.module.css";

type CalculationType = "BOX_RATE" | "PERCENTAGE" | "FIXED";
type Currency = "USD" | "PYG";
type StorageUnit = "NONE" | "M2" | "M3";
type CargoType = "DRY" | "REEFER";
type Category =
  | "TASA_PORTUARIA"
  | "SERVICIO"
  | "ALMACENAJE"
  | "SOBREESTADIA";
type CatalogStatus = "ACTIVE" | "INACTIVE" | "PENDING";
type AccountingStatus = "CONFIGURED" | "PENDING";

interface SegmentBinding {
  segmentCode: string;
  articleCode: string;
  accountingStatus: AccountingStatus;
}

interface ServiceMaster {
  id: string;
  code: string;
  name: string;
  category: Category;
  calculationType: CalculationType;
  currency: Currency;
  minimumAmount: number | null;
  freeStayDays: number | null;
  energyPrice: number | null;
  freeEnergy: number | null;
  rangeStart: number | null;
  rangeEnd: number | null;
  containerSizes: string[];
  cargoTypes: CargoType[];
  storageUnit: StorageUnit;
  segments: SegmentBinding[];
  active: boolean;
  catalogStatus: CatalogStatus;
}

interface NewServiceDraft {
  name: string;
  category: Category;
  calculationType: CalculationType;
  currency: Currency;
  minimumAmount: number | null;
  freeStayDays: number | null;
  energyPrice: number | null;
  freeEnergy: number | null;
  rangeStart: number | null;
  rangeEnd: number | null;
  storageUnit: StorageUnit;
  containerSizes: string[];
  cargoTypes: CargoType[];
  segmentCodes: string[];
}

interface HistoryEntry {
  id: string;
  serviceId: string;
  action: "CREATED" | "UPDATED" | "ACCOUNTING";
  user: string;
  dateTime: string;
  detail: string;
}

const initialServices = servicesData as ServiceMaster[];

const segmentNames: Record<string, string> = {
  IMPTER: "Importación Terrestre FCL",
  IMPFCL: "Importación FCL",
  IMPLCL: "Importación LCL",
  EXPFCL: "Exportación FCL",
  EXPLCL: "Exportación LCL",
  IMPFLU: "Importación Fluvial",
  EXPFLU: "Exportación Fluvial",
};


const initialHistory: HistoryEntry[] = [
  {
    id: "hist-001",
    serviceId: "srv-001",
    action: "UPDATED",
    user: "Administrador TERPORT",
    dateTime: "2026-09-12T10:42:00",
    detail: "Actualización de parámetros generales del servicio.",
  },
  {
    id: "hist-002",
    serviceId: "srv-001",
    action: "ACCOUNTING",
    user: "Contabilidad",
    dateTime: "2026-09-10T16:03:00",
    detail: "Asignación de artículos contables por segmento.",
  },
  {
    id: "hist-003",
    serviceId: "srv-001",
    action: "CREATED",
    user: "Comercial",
    dateTime: "2026-09-10T15:21:00",
    detail: "Solicitud inicial del servicio.",
  },
  {
    id: "hist-004",
    serviceId: "srv-002",
    action: "UPDATED",
    user: "Administrador TERPORT",
    dateTime: "2026-09-11T09:18:00",
    detail: "Revisión de aplicabilidad por segmento.",
  },
];

const defaultDraft: NewServiceDraft = {
  name: "",
  category: "SERVICIO",
  calculationType: "FIXED",
  currency: "USD",
  minimumAmount: null,
  freeStayDays: null,
  energyPrice: null,
  freeEnergy: null,
  rangeStart: null,
  rangeEnd: null,
  storageUnit: "NONE",
  containerSizes: ["20", "40"],
  cargoTypes: ["DRY", "REEFER"],
  segmentCodes: [],
};

function formatCalculationType(value: CalculationType): string {
  if (value === "BOX_RATE") return "Box rate";
  if (value === "PERCENTAGE") return "Porcentual";
  return "Fija";
}

function formatCategory(value: Category): string {
  if (value === "TASA_PORTUARIA") return "Tasa portuaria";
  if (value === "ALMACENAJE") return "Almacenaje";
  if (value === "SOBREESTADIA") return "Sobreestadía";
  return "Servicio";
}

function formatStorageUnit(value: StorageUnit): string {
  if (value === "M2") return "m²";
  if (value === "M3") return "m³";
  return "No aplica";
}

function formatCargoTypes(values: CargoType[]): string {
  if (values.includes("DRY") && values.includes("REEFER")) return "Ambas";
  if (values.includes("REEFER")) return "Refrigerada";
  return "Seca";
}

function toggleValue<T extends string>(
  current: T[],
  value: T,
  checked: boolean
) {
  if (checked) return current.includes(value) ? current : [...current, value];
  return current.filter((item) => item !== value);
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceMaster[]>(initialServices);
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [calculationFilter, setCalculationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  const [selectedService, setSelectedService] =
    useState<ServiceMaster | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<ServiceMaster | null>(null);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestDraft, setRequestDraft] =
    useState<NewServiceDraft>(defaultDraft);

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !normalizedSearch ||
        service.code.toLowerCase().includes(normalizedSearch) ||
        service.name.toLowerCase().includes(normalizedSearch);

      const matchesSegment =
        segmentFilter === "ALL" ||
        service.segments.some(
          (binding) => binding.segmentCode === segmentFilter
        );

      const matchesCategory =
        categoryFilter === "ALL" || service.category === categoryFilter;

      const matchesCalculation =
        calculationFilter === "ALL" ||
        service.calculationType === calculationFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && service.catalogStatus === "ACTIVE") ||
        (statusFilter === "INACTIVE" && service.catalogStatus === "INACTIVE") ||
        (statusFilter === "PENDING" && service.catalogStatus === "PENDING");

      return (
        matchesSearch &&
        matchesSegment &&
        matchesCategory &&
        matchesCalculation &&
        matchesStatus
      );
    });
  }, [
    services,
    search,
    segmentFilter,
    categoryFilter,
    calculationFilter,
    statusFilter,
  ]);

  const configuredCount = services.filter(
    (service) => service.catalogStatus === "ACTIVE"
  ).length;

  const pendingCount = services.filter(
    (service) =>
      service.catalogStatus === "PENDING" ||
      service.segments.some(
        (binding) => binding.accountingStatus === "PENDING"
      )
  ).length;

  function clearFilters() {
    setSearch("");
    setSegmentFilter("ALL");
    setCategoryFilter("ALL");
    setCalculationFilter("ALL");
    setStatusFilter("ACTIVE");
  }

  function openNewServiceModal() {
    setRequestDraft(defaultDraft);
    setRequestModalOpen(true);
  }

  function saveNewService() {
    if (!requestDraft.name.trim() || requestDraft.segmentCodes.length === 0) {
      return;
    }

    const nextNumber = String(services.length + 1).padStart(3, "0");

    const newService: ServiceMaster = {
      id: `srv-new-${Date.now()}`,
      code: `PEND-${nextNumber}`,
      name: requestDraft.name.trim().toUpperCase(),
      category: requestDraft.category,
      calculationType: requestDraft.calculationType,
      currency: requestDraft.currency,
      minimumAmount: requestDraft.minimumAmount,
      freeStayDays: requestDraft.freeStayDays,
      energyPrice: requestDraft.energyPrice,
      freeEnergy: requestDraft.freeEnergy,
      rangeStart: requestDraft.rangeStart,
      rangeEnd: requestDraft.rangeEnd,
      containerSizes: [...requestDraft.containerSizes],
      cargoTypes: [...requestDraft.cargoTypes],
      storageUnit: requestDraft.storageUnit,
      segments: requestDraft.segmentCodes.map<SegmentBinding>((segmentCode) => ({
        segmentCode,
        articleCode: "",
        accountingStatus: "PENDING",
      })),
      active: false,
      catalogStatus: "PENDING",
    };

    setServices((current) => [newService, ...current]);
    setHistory((current) => [
      {
        id: `hist-${Date.now()}`,
        serviceId: newService.id,
        action: "CREATED",
        user: "Administrador TERPORT",
        dateTime: new Date().toISOString(),
        detail: "Solicitud de nuevo servicio creada.",
      },
      ...current,
    ]);
    setRequestModalOpen(false);
    setSelectedService(newService);
  }

  function openEditService(service: ServiceMaster) {
    setSelectedService(null);
    setEditDraft({
      ...service,
      containerSizes: [...service.containerSizes],
      cargoTypes: [...service.cargoTypes],
      segments: service.segments.map<SegmentBinding>((binding) => ({
        ...binding,
      })),
    });
    setEditModalOpen(true);
  }

  function saveEditedService() {
    if (!editDraft || !editDraft.name.trim()) return;

    setServices((current) =>
      current.map((service) =>
        service.id === editDraft.id ? { ...editDraft } : service
      )
    );

    setHistory((current) => [
      {
        id: `hist-${Date.now()}`,
        serviceId: editDraft.id,
        action: "UPDATED",
        user: "Administrador TERPORT",
        dateTime: new Date().toISOString(),
        detail: "Modificación de la configuración del servicio.",
      },
      ...current,
    ]);

    setEditModalOpen(false);
    setEditDraft(null);
  }

  function updateEditSegmentArticle(
    segmentCode: string,
    articleCode: string
  ) {
    setEditDraft((current) => {
      if (!current) return current;

      const nextAccountingStatus: AccountingStatus =
        articleCode.trim().length > 0 ? "CONFIGURED" : "PENDING";

      const segments: SegmentBinding[] = current.segments.map((binding) =>
        binding.segmentCode === segmentCode
          ? {
              ...binding,
              articleCode,
              accountingStatus: nextAccountingStatus,
            }
          : binding
      );

      const hasPending = segments.some(
        (binding) => binding.accountingStatus === "PENDING"
      );

      const nextCatalogStatus: CatalogStatus = hasPending
        ? "PENDING"
        : current.catalogStatus === "PENDING"
          ? "ACTIVE"
          : current.catalogStatus;

      const nextDraft: ServiceMaster = {
        ...current,
        segments,
        active: hasPending ? false : current.active,
        catalogStatus: nextCatalogStatus,
      };

      return nextDraft;
    });
  }


  function formatHistoryAction(action: HistoryEntry["action"]) {
    if (action === "CREATED") return "Creación";
    if (action === "ACCOUNTING") return "Configuración contable";
    return "Modificación";
  }

  function formatHistoryDate(value: string) {
    return new Intl.DateTimeFormat("es-PY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  const selectedServiceHistory = selectedService
    ? history.filter((entry) => entry.serviceId === selectedService.id)
    : [];

  return (
    <>
      <section className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.overline}>SERVICIOS Y ARTÍCULOS</span>
            <h1>Catálogo de servicios</h1>
            <p>
              Catálogo maestro de servicios y sus artículos asociados por
              segmento.
            </p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.summary}>
              <div>
                <strong>{services.length}</strong>
                <span>Servicios</span>
              </div>

              <div>
                <strong>{configuredCount}</strong>
                <span>Activos</span>
              </div>

              <div>
                <strong>{pendingCount}</strong>
                <span>Pendientes</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={openNewServiceModal}
            >
              + Solicitar nuevo servicio
            </button>
          </div>
        </header>

        <section className={styles.filtersCard}>
          <div className={styles.searchField}>
            <label htmlFor="service-search">Buscar servicio</label>
            <input
              id="service-search"
              type="search"
              placeholder="Código o descripción"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="segment-filter">Segmento</label>
            <select
              id="segment-filter"
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
            <label htmlFor="category-filter">Categoría</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="ALL">Todas</option>
              <option value="TASA_PORTUARIA">Tasa portuaria</option>
              <option value="SERVICIO">Servicio</option>
              <option value="ALMACENAJE">Almacenaje</option>
              <option value="SOBREESTADIA">Sobreestadía</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="calculation-filter">Tipo de cálculo</label>
            <select
              id="calculation-filter"
              value={calculationFilter}
              onChange={(event) =>
                setCalculationFilter(event.target.value)
              }
            >
              <option value="ALL">Todos</option>
              <option value="BOX_RATE">Box rate</option>
              <option value="PERCENTAGE">Porcentual</option>
              <option value="FIXED">Fija</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="status-filter">Estado</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ACTIVE">Activos</option>
              <option value="PENDING">Pendientes</option>
              <option value="INACTIVE">Inactivos</option>
              <option value="ALL">Todos</option>
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
              <span className={styles.overline}>CATÁLOGO</span>
              <h2>Servicios disponibles</h2>
              <p>
                {filteredServices.length} resultado
                {filteredServices.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className={styles.legend}>
              Servicio conceptual + artículos por segmento
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Categoría</th>
                  <th>Cálculo</th>
                  <th>Moneda</th>
                  <th>Contenedor</th>
                  <th>Carga</th>
                  <th>Segmentos</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>

              <tbody>
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className={styles.clickableRow}
                    onClick={() => setSelectedService(service)}
                  >
                    <td>
                      <div className={styles.serviceCell}>
                        <div className={styles.serviceIcon}>
                          {service.code.slice(0, 2)}
                        </div>

                        <div>
                          <strong>{service.name}</strong>
                          <span>{service.code}</span>
                        </div>
                      </div>
                    </td>

                    <td>{formatCategory(service.category)}</td>
                    <td>{formatCalculationType(service.calculationType)}</td>
                    <td>{service.currency}</td>

                    <td>
                      <div className={styles.smallChips}>
                        {service.containerSizes.map((size) => (
                          <span key={size}>{size}&apos;</span>
                        ))}
                      </div>
                    </td>

                    <td>{formatCargoTypes(service.cargoTypes)}</td>

                    <td>
                      <div className={styles.segmentChips}>
                        {service.segments.slice(0, 3).map((binding) => (
                          <span key={binding.segmentCode}>
                            {binding.segmentCode}
                          </span>
                        ))}

                        {service.segments.length > 3 && (
                          <span>+{service.segments.length - 3}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          service.catalogStatus === "ACTIVE"
                            ? styles.statusActive
                            : service.catalogStatus === "PENDING"
                            ? styles.statusPending
                            : styles.statusInactive
                        }`}
                      >
                        <i />
                        {service.catalogStatus === "ACTIVE"
                          ? "Activo"
                          : service.catalogStatus === "PENDING"
                          ? "Pendiente"
                          : "Inactivo"}
                      </span>
                    </td>

                    <td className={styles.actionCell}>
                      <button
                        type="button"
                        className={styles.viewButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedService(service);
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
                    </td>
                  </tr>
                ))}

                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={9} className={styles.emptyState}>
                      No se encontraron servicios con los filtros
                      seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {selectedService && (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-detail-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>DETALLE DEL SERVICIO</span>
                <h2 id="service-detail-title">{selectedService.name}</h2>
                <p>{selectedService.code}</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedService(null)}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              {selectedService.segments.some(
                (binding) => binding.accountingStatus === "PENDING"
              ) && (
                <div className={styles.warningBox}>
                  <strong>Configuración incompleta</strong>
                  <span>
                    Existen segmentos pendientes de código de artículo
                    contable.
                  </span>
                </div>
              )}

              <section className={styles.detailSection}>
                <h3>Configuración general</h3>

                <div className={styles.detailGrid}>
                  <div>
                    <span>Categoría</span>
                    <strong>{formatCategory(selectedService.category)}</strong>
                  </div>

                  <div>
                    <span>Tipo de cálculo</span>
                    <strong>
                      {formatCalculationType(
                        selectedService.calculationType
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Moneda</span>
                    <strong>{selectedService.currency}</strong>
                  </div>

                  <div>
                    <span>Importe mínimo</span>
                    <strong>
                      {selectedService.minimumAmount == null
                        ? "No aplica"
                        : `${selectedService.currency} ${selectedService.minimumAmount}`}
                    </strong>
                  </div>

                  <div>
                    <span>Días libres de estadía</span>
                    <strong>
                      {selectedService.freeStayDays ?? "No aplica"}
                    </strong>
                  </div>

                  <div>
                    <span>Unidad de almacenaje</span>
                    <strong>
                      {formatStorageUnit(selectedService.storageUnit)}
                    </strong>
                  </div>
                </div>
              </section>

              <section className={styles.detailSection}>
                <h3>Aplicabilidad</h3>

                <div className={styles.applicabilityGrid}>
                  <div>
                    <span className={styles.detailLabel}>
                      Tamaños de contenedor
                    </span>

                    <div className={styles.detailChips}>
                      {selectedService.containerSizes.map((size) => (
                        <span key={size}>{size}&apos;</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className={styles.detailLabel}>Tipo de carga</span>

                    <div className={styles.detailChips}>
                      {selectedService.cargoTypes.map((cargoType) => (
                        <span key={cargoType}>
                          {cargoType === "DRY"
                            ? "Seca"
                            : "Refrigerada"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.detailSection}>
                <div className={styles.sectionTitleRow}>
                  <div>
                    <h3>Energía y rangos</h3>
                    <p>
                      Parámetros utilizados cuando el servicio requiere
                      energía o tarifas escalonadas.
                    </p>
                  </div>
                </div>

                <div className={styles.detailGrid}>
                  <div>
                    <span>Precio energía</span>
                    <strong>
                      {selectedService.energyPrice == null
                        ? "No aplica"
                        : `${selectedService.currency} ${selectedService.energyPrice}`}
                    </strong>
                  </div>

                  <div>
                    <span>Energía libre</span>
                    <strong>
                      {selectedService.freeEnergy ?? "No aplica"}
                    </strong>
                  </div>

                  <div>
                    <span>Rango inicial</span>
                    <strong>
                      {selectedService.rangeStart ?? "No aplica"}
                    </strong>
                  </div>

                  <div>
                    <span>Rango final</span>
                    <strong>
                      {selectedService.rangeEnd ?? "No aplica"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className={styles.detailSection}>
                <div className={styles.sectionTitleRow}>
                  <div>
                    <h3>Artículos por segmento</h3>
                    <p>
                      Cada segmento puede requerir un código contable
                      independiente.
                    </p>
                  </div>
                </div>

                <div className={styles.bindingsTable}>
                  <div className={styles.bindingsHeader}>
                    <span>Segmento</span>
                    <span>Descripción</span>
                    <span>Código de artículo</span>
                    <span>Estado</span>
                  </div>

                  {selectedService.segments.map((binding) => (
                    <div
                      className={styles.bindingRow}
                      key={binding.segmentCode}
                    >
                      <strong>{binding.segmentCode}</strong>
                      <span>
                        {segmentNames[binding.segmentCode] ??
                          binding.segmentCode}
                      </span>

                      <code>
                        {binding.articleCode || "Pendiente"}
                      </code>

                      <span
                        className={`${styles.bindingStatus} ${
                          binding.accountingStatus === "CONFIGURED"
                            ? styles.bindingConfigured
                            : styles.bindingPending
                        }`}
                      >
                        {binding.accountingStatus === "CONFIGURED"
                          ? "Configurado"
                          : "Pendiente contable"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <section className={styles.detailSection}>
                <div className={styles.sectionTitleRow}>
                  <div>
                    <h3>Historial de cambios</h3>
                    <p>
                      Trazabilidad de las modificaciones realizadas sobre el
                      servicio.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.historyButton}
                    onClick={() => setHistoryModalOpen(true)}
                  >
                    Ver historial completo
                  </button>
                </div>

                <div className={styles.historySummary}>
                  <div>
                    <span>Última modificación</span>
                    <strong>
                      {selectedServiceHistory[0]
                        ? formatHistoryDate(selectedServiceHistory[0].dateTime)
                        : "Sin movimientos"}
                    </strong>
                  </div>

                  <div>
                    <span>Usuario</span>
                    <strong>
                      {selectedServiceHistory[0]?.user ?? "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Acción</span>
                    <strong>
                      {selectedServiceHistory[0]
                        ? formatHistoryAction(selectedServiceHistory[0].action)
                        : "—"}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            <footer className={styles.modalFooter}>
              <span>Catálogo maestro del prototipo.</span>

              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setSelectedService(null)}
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => openEditService(selectedService)}
                >
                  Editar servicio
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}


      {historyModalOpen && selectedService && (
        <div className={`${styles.modalBackdrop} ${styles.nestedBackdrop}`}>
          <div
            className={`${styles.modal} ${styles.historyModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>TRAZABILIDAD</span>
                <h2 id="history-title">Historial de cambios</h2>
                <p>
                  {selectedService.code} · {selectedService.name}
                </p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setHistoryModalOpen(false)}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              {selectedServiceHistory.length > 0 ? (
                <div className={styles.historyTable}>
                  <div className={styles.historyTableHeader}>
                    <span>Fecha y hora</span>
                    <span>Usuario</span>
                    <span>Acción</span>
                    <span>Detalle</span>
                  </div>

                  {selectedServiceHistory.map((entry) => (
                    <div className={styles.historyRow} key={entry.id}>
                      <span>{formatHistoryDate(entry.dateTime)}</span>
                      <strong>{entry.user}</strong>
                      <span className={styles.historyAction}>
                        {formatHistoryAction(entry.action)}
                      </span>
                      <span>{entry.detail}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.historyEmpty}>
                  No existen movimientos registrados para este servicio.
                </div>
              )}
            </div>

            <footer className={styles.modalFooter}>
              <span>
                Registro de trazabilidad del prototipo.
              </span>

              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setHistoryModalOpen(false)}
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}

      {editModalOpen && editDraft && (
        <div className={styles.modalBackdrop}>
          <div
            className={`${styles.modal} ${styles.requestModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-service-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>EDITAR SERVICIO</span>
                <h2 id="edit-service-title">{editDraft.name}</h2>
                <p>{editDraft.code}</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => {
                  setEditModalOpen(false);
                  setEditDraft(null);
                }}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <section className={styles.formSection}>
                <h3>Datos del servicio</h3>

                <div className={styles.formGrid}>
                  <label className={`${styles.formField} ${styles.fullWidth}`}>
                    <span>Nombre del servicio</span>
                    <input
                      value={editDraft.name}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? { ...current, name: event.target.value }
                            : current
                        )
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Categoría</span>
                    <select
                      value={editDraft.category}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? { ...current, category: event.target.value as Category }
                            : current
                        )
                      }
                    >
                      <option value="SERVICIO">Servicio</option>
                      <option value="TASA_PORTUARIA">Tasa portuaria</option>
                      <option value="ALMACENAJE">Almacenaje</option>
                      <option value="SOBREESTADIA">Sobreestadía</option>
                    </select>
                  </label>

                  <label className={styles.formField}>
                    <span>Tipo de cálculo</span>
                    <select
                      value={editDraft.calculationType}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? { ...current, calculationType: event.target.value as CalculationType }
                            : current
                        )
                      }
                    >
                      <option value="FIXED">Fija</option>
                      <option value="BOX_RATE">Box rate</option>
                      <option value="PERCENTAGE">Porcentual</option>
                    </select>
                  </label>

                  <label className={styles.formField}>
                    <span>Moneda</span>
                    <select
                      value={editDraft.currency}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? { ...current, currency: event.target.value as Currency }
                            : current
                        )
                      }
                    >
                      <option value="USD">USD</option>
                      <option value="PYG">PYG</option>
                    </select>
                  </label>

                  <label className={styles.formField}>
                    <span>Importe mínimo</span>
                    <input
                      type="number"
                      value={editDraft.minimumAmount ?? ""}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? { ...current, minimumAmount: event.target.value === "" ? null : Number(event.target.value) }
                            : current
                        )
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Días libres de estadía</span>
                    <input
                      type="number"
                      value={editDraft.freeStayDays ?? ""}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? { ...current, freeStayDays: event.target.value === "" ? null : Number(event.target.value) }
                            : current
                        )
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Unidad de almacenaje</span>
                    <select
                      value={editDraft.storageUnit}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? { ...current, storageUnit: event.target.value as StorageUnit }
                            : current
                        )
                      }
                    >
                      <option value="NONE">No aplica</option>
                      <option value="M2">m²</option>
                      <option value="M3">m³</option>
                    </select>
                  </label>

                  <label className={styles.formField}>
                    <span>Estado del catálogo</span>
                    <select
                      value={editDraft.catalogStatus}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? { ...current, catalogStatus: event.target.value as CatalogStatus, active: event.target.value === "ACTIVE" }
                            : current
                        )
                      }
                    >
                      <option value="ACTIVE">Activo</option>
                      <option value="PENDING">Pendiente</option>
                      <option value="INACTIVE">Inactivo</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className={styles.formSection}>
                <h3>Energía y rangos</h3>
                <p className={styles.sectionHelp}>
                  Complete estos campos únicamente cuando correspondan al
                  servicio.
                </p>

                <div className={styles.formGrid}>
                  <label className={styles.formField}>
                    <span>Precio energía</span>
                    <input
                      type="number"
                      value={editDraft.energyPrice ?? ""}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? {
                                ...current,
                                energyPrice:
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                              }
                            : current
                        )
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Energía libre</span>
                    <input
                      type="number"
                      value={editDraft.freeEnergy ?? ""}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? {
                                ...current,
                                freeEnergy:
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                              }
                            : current
                        )
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Rango inicial</span>
                    <input
                      type="number"
                      value={editDraft.rangeStart ?? ""}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? {
                                ...current,
                                rangeStart:
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                              }
                            : current
                        )
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Rango final</span>
                    <input
                      type="number"
                      value={editDraft.rangeEnd ?? ""}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current
                            ? {
                                ...current,
                                rangeEnd:
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                              }
                            : current
                        )
                      }
                    />
                  </label>
                </div>
              </section>

              <section className={styles.formSection}>
                <h3>Aplicabilidad</h3>
                <div className={styles.optionColumns}>
                  <div>
                    <span className={styles.optionTitle}>Tamaño de contenedor</span>
                    <div className={styles.checkboxRow}>
                      {["20", "40"].map((size) => (
                        <label className={styles.checkboxCard} key={size}>
                          <input
                            type="checkbox"
                            checked={editDraft.containerSizes.includes(size)}
                            onChange={(event) =>
                              setEditDraft((current) =>
                                current ? { ...current, containerSizes: toggleValue(current.containerSizes, size, event.target.checked) } : current
                              )
                            }
                          />
                          <span>{size}&apos;</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className={styles.optionTitle}>Tipo de carga</span>
                    <div className={styles.checkboxRow}>
                      {[{ value: "DRY", label: "Seca" }, { value: "REEFER", label: "Refrigerada" }].map((option) => (
                        <label className={styles.checkboxCard} key={option.value}>
                          <input
                            type="checkbox"
                            checked={editDraft.cargoTypes.includes(option.value as CargoType)}
                            onChange={(event) =>
                              setEditDraft((current) =>
                                current ? { ...current, cargoTypes: toggleValue(current.cargoTypes, option.value as CargoType, event.target.checked) } : current
                              )
                            }
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionTitleRow}>
                  <div>
                    <h3>Artículos por segmento</h3>
                    <p>Aquí se completa o corrige el código de artículo correspondiente a cada segmento.</p>
                  </div>
                </div>

                <div className={styles.editBindingsTable}>
                  <div className={styles.editBindingsHeader}>
                    <span>Segmento</span>
                    <span>Descripción</span>
                    <span>Código de artículo</span>
                    <span>Estado</span>
                  </div>

                  {editDraft.segments.map((binding) => (
                    <div className={styles.editBindingRow} key={binding.segmentCode}>
                      <strong>{binding.segmentCode}</strong>
                      <span>{segmentNames[binding.segmentCode] ?? binding.segmentCode}</span>
                      <input
                        value={binding.articleCode}
                        placeholder="Pendiente de código"
                        onChange={(event) => updateEditSegmentArticle(binding.segmentCode, event.target.value)}
                      />
                      <span className={`${styles.bindingStatus} ${binding.accountingStatus === "CONFIGURED" ? styles.bindingConfigured : styles.bindingPending}`}>
                        {binding.accountingStatus === "CONFIGURED" ? "Configurado" : "Pendiente contable"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <footer className={styles.modalFooter}>
              <span>Los cambios son temporales en este prototipo sin base de datos.</span>
              <div className={styles.footerActions}>
                <button type="button" className={styles.cancelButton} onClick={() => { setEditModalOpen(false); setEditDraft(null); }}>Cancelar</button>
                <button type="button" className={styles.primaryButton} onClick={saveEditedService}>Guardar cambios</button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {requestModalOpen && (
        <div className={styles.modalBackdrop}>
          <div
            className={`${styles.modal} ${styles.requestModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-service-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>NUEVO SERVICIO</span>
                <h2 id="new-service-title">Solicitar nuevo servicio</h2>
                <p>
                  Defina el servicio conceptual y los segmentos donde se
                  utilizará.
                </p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setRequestModalOpen(false)}
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <section className={styles.formSection}>
                <h3>Datos del servicio</h3>

                <div className={styles.formGrid}>
                  <label className={`${styles.formField} ${styles.fullWidth}`}>
                    <span>Nombre del servicio</span>
                    <input
                      value={requestDraft.name}
                      placeholder="Ej.: Servicio operativo especial"
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Categoría</span>
                    <select
                      value={requestDraft.category}
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          category: event.target.value as Category,
                        }))
                      }
                    >
                      <option value="SERVICIO">Servicio</option>
                      <option value="TASA_PORTUARIA">
                        Tasa portuaria
                      </option>
                      <option value="ALMACENAJE">Almacenaje</option>
                      <option value="SOBREESTADIA">Sobreestadía</option>
                    </select>
                  </label>

                  <label className={styles.formField}>
                    <span>Tipo de cálculo</span>
                    <select
                      value={requestDraft.calculationType}
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          calculationType:
                            event.target.value as CalculationType,
                        }))
                      }
                    >
                      <option value="FIXED">Fija</option>
                      <option value="BOX_RATE">Box rate</option>
                      <option value="PERCENTAGE">Porcentual</option>
                    </select>
                  </label>

                  <label className={styles.formField}>
                    <span>Moneda</span>
                    <select
                      value={requestDraft.currency}
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          currency: event.target.value as Currency,
                        }))
                      }
                    >
                      <option value="USD">USD</option>
                      <option value="PYG">PYG</option>
                    </select>
                  </label>

                  <label className={styles.formField}>
                    <span>Importe mínimo</span>
                    <input
                      type="number"
                      value={requestDraft.minimumAmount ?? ""}
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          minimumAmount:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        }))
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Días libres</span>
                    <input
                      type="number"
                      value={requestDraft.freeStayDays ?? ""}
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          freeStayDays:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        }))
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Unidad de almacenaje</span>
                    <select
                      value={requestDraft.storageUnit}
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          storageUnit:
                            event.target.value as StorageUnit,
                        }))
                      }
                    >
                      <option value="NONE">No aplica</option>
                      <option value="M2">m²</option>
                      <option value="M3">m³</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className={styles.formSection}>
                <h3>Energía y rangos</h3>
                <p className={styles.sectionHelp}>
                  Complete estos parámetros solo cuando el servicio los
                  requiera.
                </p>

                <div className={styles.formGrid}>
                  <label className={styles.formField}>
                    <span>Precio energía</span>
                    <input
                      type="number"
                      value={requestDraft.energyPrice ?? ""}
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          energyPrice:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        }))
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Energía libre</span>
                    <input
                      type="number"
                      value={requestDraft.freeEnergy ?? ""}
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          freeEnergy:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        }))
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Rango inicial</span>
                    <input
                      type="number"
                      value={requestDraft.rangeStart ?? ""}
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          rangeStart:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        }))
                      }
                    />
                  </label>

                  <label className={styles.formField}>
                    <span>Rango final</span>
                    <input
                      type="number"
                      value={requestDraft.rangeEnd ?? ""}
                      onChange={(event) =>
                        setRequestDraft((current) => ({
                          ...current,
                          rangeEnd:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                </div>
              </section>

              <section className={styles.formSection}>
                <h3>Aplicabilidad</h3>

                <div className={styles.optionColumns}>
                  <div>
                    <span className={styles.optionTitle}>
                      Tamaño de contenedor
                    </span>

                    <div className={styles.checkboxRow}>
                      {["20", "40"].map((size) => (
                        <label className={styles.checkboxCard} key={size}>
                          <input
                            type="checkbox"
                            checked={requestDraft.containerSizes.includes(
                              size
                            )}
                            onChange={(event) =>
                              setRequestDraft((current) => ({
                                ...current,
                                containerSizes: toggleValue(
                                  current.containerSizes,
                                  size,
                                  event.target.checked
                                ),
                              }))
                            }
                          />
                          <span>{size}&apos;</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className={styles.optionTitle}>
                      Tipo de carga
                    </span>

                    <div className={styles.checkboxRow}>
                      {[
                        { value: "DRY", label: "Seca" },
                        { value: "REEFER", label: "Refrigerada" },
                      ].map((option) => (
                        <label
                          className={styles.checkboxCard}
                          key={option.value}
                        >
                          <input
                            type="checkbox"
                            checked={requestDraft.cargoTypes.includes(
                              option.value as CargoType
                            )}
                            onChange={(event) =>
                              setRequestDraft((current) => ({
                                ...current,
                                cargoTypes: toggleValue(
                                  current.cargoTypes,
                                  option.value as CargoType,
                                  event.target.checked
                                ),
                              }))
                            }
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.formSection}>
                <h3>Segmentos de aplicación</h3>

                <div className={styles.segmentSelectionGrid}>
                  {Object.entries(segmentNames).map(([code, name]) => (
                    <label className={styles.segmentOption} key={code}>
                      <input
                        type="checkbox"
                        checked={requestDraft.segmentCodes.includes(code)}
                        onChange={(event) =>
                          setRequestDraft((current) => ({
                            ...current,
                            segmentCodes: toggleValue(
                              current.segmentCodes,
                              code,
                              event.target.checked
                            ),
                          }))
                        }
                      />

                      <div>
                        <strong>{code}</strong>
                        <span>{name}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {requestDraft.segmentCodes.length > 0 && (
                  <div className={styles.previewBox}>
                    <div>
                      <strong>
                        Artículos requeridos:{" "}
                        {requestDraft.segmentCodes.length}
                      </strong>
                      <span>
                        Los códigos contables quedan pendientes de
                        configuración.
                      </span>
                    </div>

                    <div className={styles.previewList}>
                      {requestDraft.segmentCodes.map((segmentCode) => (
                        <div key={segmentCode}>
                          <span>{segmentCode}</span>
                          <strong>Pendiente de código contable</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>

            <footer className={styles.modalFooter}>
              <span>
                Prototipo: la solicitud queda en estado pendiente.
              </span>

              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setRequestModalOpen(false)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={
                    !requestDraft.name.trim() ||
                    requestDraft.segmentCodes.length === 0
                  }
                  onClick={saveNewService}
                >
                  Crear solicitud
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}