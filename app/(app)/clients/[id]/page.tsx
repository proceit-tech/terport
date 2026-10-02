"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import clientsData from "@/mock-data/clients.json";
import styles from "./client-detail.module.css";

type TariffType = "STANDARD" | "CORPORATE" | "GROUP";
type CreditAppliesTo = "CLIENT" | "BROKER";
type CalculationType = "BOX_RATE" | "PERCENTAGE" | "FIXED";
type CurrencyType = "PYG" | "USD";
type CargoApplicability = "DRY" | "REEFER" | "BOTH";
type ServiceStatus = "BILLABLE" | "EXEMPT";
type StorageUnit = "NONE" | "M2" | "M3";

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

interface CommercialConditions {
  creditDays: number;
  creditAppliesTo: CreditAppliesTo;
  economicGroup: string | null;
  brokerAgreement: string | null;
  quotationValidUntil: string | null;
  additionalObservation: string;
}

interface ServiceMaster {
  masterId: string;
  code: string;
  name: string;
  allowedSegments: string[];
  calculationType: CalculationType;
  currency: CurrencyType;
  value: number;
  operation: string;
  minimumAmount: number | null;
  freeStayDays: number | null;
  energyPrice: number | null;
  freeEnergy: number | null;
  rangeStart: number | null;
  rangeEnd: number | null;
  price: number | null;
  storageUnit: StorageUnit;
  cargoApplicability: CargoApplicability;
  defaultAdditionalIds: string[];
  defaultNavisRuleIds: string[];
}

interface ServiceRow {
  id: string;
  masterId: string;
  code: string;
  name: string;
  observation: string;
  value: number;
  calculationType: CalculationType;
  operation: string;
  minimumAmount: number | null;
  freeStayDays: number | null;
  energyPrice: number | null;
  freeEnergy: number | null;
  rangeStart: number | null;
  rangeEnd: number | null;
  currency: CurrencyType;
  price: number | null;
  validUntil: string;
  shared: boolean;
  cip: boolean;
  cargoApplicability: CargoApplicability;
  storageUnit: StorageUnit;
  additionalIds: string[];
  navisRuleIds: string[];
  status: ServiceStatus;
}

interface SegmentDraft {
  segmentCode: string;
  segmentName: string;
  tariffType: TariffType;
  validUntil: string;
  services: ServiceRow[];
}

const clients = clientsData as Client[];

const segmentCatalog = [
  { code: "IMPTER", name: "Importación Terrestre FCL" },
  { code: "IMPFCL", name: "Importación FCL" },
  { code: "IMPLCL", name: "Importación LCL" },
  { code: "EXPFCL", name: "Exportación FCL" },
  { code: "EXPLCL", name: "Exportación LCL" },
  { code: "IMPFLU", name: "Importación Fluvial" },
  { code: "EXPFLU", name: "Exportación Fluvial" },
];

const additionalCatalog = [
  { id: "GESTION_FRONTERA", label: "Gestión de frontera" },
  { id: "ENCHUFADO", label: "Enchufado / conexión eléctrica" },
  { id: "PRECINTO", label: "Precinto" },
  { id: "APERTURA", label: "Apertura" },
  { id: "VERIFICACION", label: "Verificación" },
];

const navisRuleCatalog = [
  { id: "REEFER", label: "Contenedor refrigerado" },
  { id: "PLUGGED", label: "Contenedor enchufado" },
  { id: "SEAL", label: "Con precinto" },
  { id: "OPENING", label: "Con apertura" },
  { id: "VERIFICATION", label: "Con verificación" },
];

const serviceCatalog: ServiceMaster[] = [
  {
    masterId: "srv-vil11052",
    code: "VIL11052",
    name: "TASAS PORTUARIAS - BOX RATE CDE",
    allowedSegments: ["IMPTER", "IMPFCL"],
    calculationType: "BOX_RATE",
    currency: "USD",
    value: 0,
    operation: "B",
    minimumAmount: 88,
    freeStayDays: 30,
    energyPrice: 0,
    freeEnergy: 0,
    rangeStart: 0,
    rangeEnd: 0,
    price: 0,
    storageUnit: "NONE",
    cargoApplicability: "BOTH",
    defaultAdditionalIds: ["GESTION_FRONTERA"],
    defaultNavisRuleIds: [],
  },
  {
    masterId: "srv-vil11222",
    code: "VIL11222",
    name: "ENLACE SOFIA",
    allowedSegments: ["IMPTER", "IMPFCL", "EXPFCL", "EXPLCL"],
    calculationType: "FIXED",
    currency: "USD",
    value: 0,
    operation: "B",
    minimumAmount: null,
    freeStayDays: null,
    energyPrice: 0,
    freeEnergy: 0,
    rangeStart: 0,
    rangeEnd: 0,
    price: 0,
    storageUnit: "NONE",
    cargoApplicability: "BOTH",
    defaultAdditionalIds: [],
    defaultNavisRuleIds: [],
  },
  {
    masterId: "srv-vil11212",
    code: "VIL11212",
    name: "VGM RES. PGN 49/2016",
    allowedSegments: ["IMPTER", "IMPFCL", "EXPFCL"],
    calculationType: "FIXED",
    currency: "USD",
    value: 0,
    operation: "B",
    minimumAmount: null,
    freeStayDays: null,
    energyPrice: 0,
    freeEnergy: 0,
    rangeStart: 0,
    rangeEnd: 0,
    price: 0,
    storageUnit: "NONE",
    cargoApplicability: "BOTH",
    defaultAdditionalIds: [],
    defaultNavisRuleIds: [],
  },
  {
    masterId: "srv-vil17185",
    code: "VIL17185",
    name: "TASAS PORTUARIAS (PORCENTUAL) 40 FALCON",
    allowedSegments: ["IMPTER"],
    calculationType: "PERCENTAGE",
    currency: "USD",
    value: 0.22,
    operation: "B",
    minimumAmount: 132,
    freeStayDays: 30,
    energyPrice: 0,
    freeEnergy: 0,
    rangeStart: 0,
    rangeEnd: 0,
    price: 0,
    storageUnit: "NONE",
    cargoApplicability: "REEFER",
    defaultAdditionalIds: ["ENCHUFADO"],
    defaultNavisRuleIds: ["REEFER", "PLUGGED"],
  },
  {
    masterId: "srv-vil21015",
    code: "VIL21015",
    name: "TASAS PORTUARIAS EXPORTACIÓN FCL",
    allowedSegments: ["EXPFCL"],
    calculationType: "BOX_RATE",
    currency: "USD",
    value: 0,
    operation: "B",
    minimumAmount: 88,
    freeStayDays: 30,
    energyPrice: 0,
    freeEnergy: 0,
    rangeStart: 0,
    rangeEnd: 0,
    price: 0,
    storageUnit: "NONE",
    cargoApplicability: "BOTH",
    defaultAdditionalIds: [],
    defaultNavisRuleIds: [],
  },
  {
    masterId: "srv-vil21401",
    code: "VIL21401",
    name: "GESTIÓN DE FRONTERA EXPORTACIÓN",
    allowedSegments: ["EXPFCL", "EXPLCL"],
    calculationType: "FIXED",
    currency: "USD",
    value: 0,
    operation: "B",
    minimumAmount: null,
    freeStayDays: null,
    energyPrice: 0,
    freeEnergy: 0,
    rangeStart: 0,
    rangeEnd: 0,
    price: 0,
    storageUnit: "NONE",
    cargoApplicability: "BOTH",
    defaultAdditionalIds: ["GESTION_FRONTERA"],
    defaultNavisRuleIds: [],
  },
  {
    masterId: "srv-pbip",
    code: "PBIP",
    name: "PROTECCIÓN DE BUQUES E INSTALACIONES PORTUARIAS",
    allowedSegments: ["IMPTER", "IMPFCL", "IMPLCL", "EXPFCL", "EXPLCL", "IMPFLU", "EXPFLU"],
    calculationType: "FIXED",
    currency: "USD",
    value: 0,
    operation: "B",
    minimumAmount: null,
    freeStayDays: null,
    energyPrice: 0,
    freeEnergy: 0,
    rangeStart: 0,
    rangeEnd: 0,
    price: 0,
    storageUnit: "NONE",
    cargoApplicability: "BOTH",
    defaultAdditionalIds: [],
    defaultNavisRuleIds: [],
  },
  {
    masterId: "srv-bgm",
    code: "BGM",
    name: "BGM - SERVICIO OPERATIVO",
    allowedSegments: ["IMPTER", "IMPFCL", "IMPLCL", "EXPFCL", "EXPLCL"],
    calculationType: "FIXED",
    currency: "USD",
    value: 0,
    operation: "B",
    minimumAmount: null,
    freeStayDays: null,
    energyPrice: 0,
    freeEnergy: 0,
    rangeStart: 0,
    rangeEnd: 0,
    price: 0,
    storageUnit: "NONE",
    cargoApplicability: "BOTH",
    defaultAdditionalIds: [],
    defaultNavisRuleIds: [],
  },
  {
    masterId: "srv-almacenaje",
    code: "ALM001",
    name: "ALMACENAJE",
    allowedSegments: ["IMPTER", "IMPFCL", "IMPLCL", "EXPFCL", "EXPLCL"],
    calculationType: "FIXED",
    currency: "USD",
    value: 0,
    operation: "B",
    minimumAmount: null,
    freeStayDays: 5,
    energyPrice: 0,
    freeEnergy: 0,
    rangeStart: 0,
    rangeEnd: 0,
    price: 0,
    storageUnit: "M3",
    cargoApplicability: "BOTH",
    defaultAdditionalIds: [],
    defaultNavisRuleIds: [],
  },
];

const initialCommercialConditions: CommercialConditions = {
  creditDays: 30,
  creditAppliesTo: "CLIENT",
  economicGroup: null,
  brokerAgreement: null,
  quotationValidUntil: "2026-12-31",
  additionalObservation: "",
};

function serviceFromMaster(
  masterId: string,
  segmentCode: string,
  overrides: Partial<ServiceRow> = {}
): ServiceRow {
  const master = serviceCatalog.find((item) => item.masterId === masterId);

  if (!master) {
    throw new Error(`Servicio maestro no encontrado: ${masterId}`);
  }

  return {
    id: `${segmentCode}-${master.code}-${Date.now()}-${Math.random()}`,
    masterId: master.masterId,
    code: master.code,
    name: master.name,
    observation: "",
    value: master.value,
    calculationType: master.calculationType,
    operation: master.operation,
    minimumAmount: master.minimumAmount,
    freeStayDays: master.freeStayDays,
    energyPrice: master.energyPrice,
    freeEnergy: master.freeEnergy,
    rangeStart: master.rangeStart,
    rangeEnd: master.rangeEnd,
    currency: master.currency,
    price: master.price,
    validUntil: "2026-12-31",
    shared: false,
    cip: false,
    cargoApplicability: master.cargoApplicability,
    storageUnit: master.storageUnit,
    additionalIds: [...master.defaultAdditionalIds],
    navisRuleIds: [...master.defaultNavisRuleIds],
    status: "BILLABLE",
    ...overrides,
  };
}

const initialServicesBySegment: Record<string, ServiceRow[]> = {
  IMPTER: [
    serviceFromMaster("srv-vil11052", "IMPTER", {
      id: "IMPTER-VIL11052",
      shared: true,
    }),
    serviceFromMaster("srv-vil11222", "IMPTER", {
      id: "IMPTER-VIL11222",
      status: "EXEMPT",
    }),
  ],
  EXPFCL: [
    serviceFromMaster("srv-vil21015", "EXPFCL", {
      id: "EXPFCL-VIL21015",
    }),
    serviceFromMaster("srv-vil11222", "EXPFCL", {
      id: "EXPFCL-VIL21222",
      status: "EXEMPT",
      code: "VIL21222",
      name: "ENLACE SOFIA EXPORTACIÓN",
    }),
    serviceFromMaster("srv-vil21401", "EXPFCL", {
      id: "EXPFCL-VIL21401",
    }),
  ],
};

function formatTariffType(value: TariffType) {
  if (value === "CORPORATE") return "Corporativa";
  if (value === "GROUP") return "De grupo";
  return "Estándar";
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatCalculationType(value: CalculationType) {
  if (value === "BOX_RATE") return "Box rate";
  if (value === "PERCENTAGE") return "Porcentual";
  return "Fija";
}

function formatCargo(value: CargoApplicability) {
  if (value === "DRY") return "Seca";
  if (value === "REEFER") return "Refrigerada";
  return "Ambas";
}

function formatStorageUnit(value: StorageUnit) {
  if (value === "M2") return "m²";
  if (value === "M3") return "m³";
  return "No aplica";
}

function toggleArrayValue(
  values: string[],
  value: string,
  checked: boolean
): string[] {
  if (checked) {
    return values.includes(value) ? values : [...values, value];
  }

  return values.filter((item) => item !== value);
}

export default function ClientDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const clientId = Array.isArray(rawId) ? rawId[0] : rawId;

  const client = useMemo(
    () => clients.find((item) => item.id === clientId),
    [clientId]
  );

  const [commercialConditions, setCommercialConditions] =
    useState<CommercialConditions>(initialCommercialConditions);

  const [segmentConfigurations, setSegmentConfigurations] = useState<
    ClientConfiguration[]
  >(() => client?.configurations ?? []);

  const [servicesBySegment, setServicesBySegment] =
    useState<Record<string, ServiceRow[]>>(initialServicesBySegment);

  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const [conditionsModalOpen, setConditionsModalOpen] = useState(false);
  const [conditionsDraft, setConditionsDraft] =
    useState<CommercialConditions>(commercialConditions);

  const [segmentModalOpen, setSegmentModalOpen] = useState(false);
  const [segmentMode, setSegmentMode] = useState<"ADD" | "EDIT">("ADD");
  const [segmentDraft, setSegmentDraft] = useState<SegmentDraft | null>(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceMode, setServiceMode] = useState<"ADD" | "EDIT">("ADD");
  const [serviceDraft, setServiceDraft] = useState<ServiceRow | null>(null);
  const [selectedMasterId, setSelectedMasterId] = useState("");

  const selectedConfiguration = useMemo(() => {
    if (!selectedSegment) return null;

    return (
      segmentConfigurations.find(
        (item) => item.segmentCode === selectedSegment
      ) ?? null
    );
  }, [selectedSegment, segmentConfigurations]);

  const unconfiguredSegments = useMemo(() => {
    const configured = new Set(
      segmentConfigurations.map((item) => item.segmentCode)
    );

    return segmentCatalog.filter((item) => !configured.has(item.code));
  }, [segmentConfigurations]);

  const selectedServices = selectedSegment
    ? servicesBySegment[selectedSegment] ?? []
    : [];

  const availableServiceMasters = useMemo(() => {
    if (!segmentDraft) return [];

    const alreadySelected = new Set(
      segmentDraft.services.map((service) => service.masterId)
    );

    return serviceCatalog.filter(
      (service) =>
        service.allowedSegments.includes(segmentDraft.segmentCode) &&
        (!alreadySelected.has(service.masterId) ||
          service.masterId === selectedMasterId)
    );
  }, [segmentDraft, selectedMasterId]);

  function openConditionsModal() {
    setConditionsDraft({ ...commercialConditions });
    setConditionsModalOpen(true);
  }

  function saveConditions() {
    setCommercialConditions({ ...conditionsDraft });
    setConditionsModalOpen(false);
  }

  function openAddSegmentModal(segmentCode?: string) {
    const base =
      segmentCatalog.find((item) => item.code === segmentCode) ??
      unconfiguredSegments[0];

    if (!base) return;

    setSegmentMode("ADD");
    setSegmentDraft({
      segmentCode: base.code,
      segmentName: base.name,
      tariffType: "STANDARD",
      validUntil: "2026-12-31",
      services: [],
    });
    setSegmentModalOpen(true);
  }

  function openEditSegmentModal(configuration: ClientConfiguration) {
    setSegmentMode("EDIT");
    setSegmentDraft({
      segmentCode: configuration.segmentCode,
      segmentName: configuration.segmentName,
      tariffType: configuration.tariffType,
      validUntil: configuration.validUntil,
      services: [
        ...(servicesBySegment[configuration.segmentCode] ?? []),
      ].map((service) => ({ ...service })),
    });
    setSegmentModalOpen(true);
  }

  function saveSegmentModal() {
    if (!segmentDraft) return;

    const configuration: ClientConfiguration = {
      segmentCode: segmentDraft.segmentCode,
      segmentName: segmentDraft.segmentName,
      tariffType: segmentDraft.tariffType,
      validUntil: segmentDraft.validUntil,
      status: "CONFIGURED",
    };

    setSegmentConfigurations((current) => {
      if (segmentMode === "ADD") {
        return [...current, configuration];
      }

      return current.map((item) =>
        item.segmentCode === configuration.segmentCode
          ? configuration
          : item
      );
    });

    setServicesBySegment((current) => ({
      ...current,
      [segmentDraft.segmentCode]: segmentDraft.services,
    }));

    setSelectedSegment(segmentDraft.segmentCode);
    setSegmentModalOpen(false);
    setSegmentDraft(null);
  }

  function removeSegment() {
    if (!segmentDraft) return;

    const confirmed = window.confirm(
      `¿Desea quitar el segmento "${segmentDraft.segmentName}" de este cliente?`
    );

    if (!confirmed) return;

    setSegmentConfigurations((current) =>
      current.filter(
        (item) => item.segmentCode !== segmentDraft.segmentCode
      )
    );

    setServicesBySegment((current) => {
      const copy = { ...current };
      delete copy[segmentDraft.segmentCode];
      return copy;
    });

    if (selectedSegment === segmentDraft.segmentCode) {
      setSelectedSegment(null);
    }

    setSegmentModalOpen(false);
    setSegmentDraft(null);
  }

  function openAddServiceModal() {
    if (!segmentDraft) return;

    setServiceMode("ADD");
    setSelectedMasterId("");
    setServiceDraft(null);
    setServiceModalOpen(true);
  }

  function selectServiceMaster(masterId: string) {
    if (!segmentDraft) return;

    setSelectedMasterId(masterId);

    if (!masterId) {
      setServiceDraft(null);
      return;
    }

    setServiceDraft(
      serviceFromMaster(masterId, segmentDraft.segmentCode, {
        validUntil: segmentDraft.validUntil,
      })
    );
  }

  function openEditServiceModal(service: ServiceRow) {
    setServiceMode("EDIT");
    setSelectedMasterId(service.masterId);
    setServiceDraft({ ...service });
    setServiceModalOpen(true);
  }

  function saveServiceModal() {
    if (!segmentDraft || !serviceDraft) return;

    setSegmentDraft((current) => {
      if (!current) return current;

      const services =
        serviceMode === "ADD"
          ? [...current.services, serviceDraft]
          : current.services.map((service) =>
              service.id === serviceDraft.id ? serviceDraft : service
            );

      return {
        ...current,
        services,
      };
    });

    setServiceModalOpen(false);
    setServiceDraft(null);
    setSelectedMasterId("");
  }

  function removeService(serviceId: string) {
    setSegmentDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        services: current.services.filter(
          (service) => service.id !== serviceId
        ),
      };
    });
  }

  if (!client) {
    return (
      <section className={styles.notFound}>
        <h1>Cliente no encontrado</h1>
        <Link href="/clients">Volver al listado</Link>
      </section>
    );
  }

  return (
    <>
      <section className={styles.page}>
        <header className={styles.pageHeader}>
          <Link href="/clients" className={styles.backLink}>
            ← Volver a clientes
          </Link>

          <div className={styles.titleRow}>
            <div>
              <span className={styles.overline}>
                CONFIGURACIÓN DE CLIENTE
              </span>
              <h1>{client.name}</h1>
              <p>
                Condiciones comerciales y configuración tarifaria por
                segmento.
              </p>
            </div>

            <span
              className={`${styles.clientStatus} ${
                client.billable
                  ? styles.statusActive
                  : styles.statusInactive
              }`}
            >
              <span />
              {client.billable ? "Facturable" : "No facturable"}
            </span>
          </div>
        </header>

        <section className={styles.clientInfo}>
          <div className={styles.infoItem}>
            <span>Código</span>
            <strong>{client.code}</strong>
          </div>

          <div className={styles.infoItem}>
            <span>RUC</span>
            <strong>{client.ruc}</strong>
          </div>

          <div className={styles.infoItem}>
            <span>Localidad</span>
            <strong>{client.city}</strong>
          </div>

          <div className={styles.infoItem}>
            <span>País</span>
            <strong>{client.country}</strong>
          </div>

          <div className={styles.readOnlyNote}>
            Datos maestros de solo lectura
          </div>
        </section>

        <section className={styles.commercialPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.overline}>
                CONDICIONES COMERCIALES
              </span>
              <h2>Condiciones generales del cliente</h2>
            </div>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={openConditionsModal}
            >
              Editar condiciones
            </button>
          </div>

          <div className={styles.conditionsGrid}>
            <div className={styles.conditionItem}>
              <span>Días de crédito</span>
              <strong>{commercialConditions.creditDays} días</strong>
            </div>

            <div className={styles.conditionItem}>
              <span>Crédito aplicado a</span>
              <strong>
                {commercialConditions.creditAppliesTo === "BROKER"
                  ? "Despachante"
                  : "Cliente"}
              </strong>
            </div>

            <div className={styles.conditionItem}>
              <span>Grupo económico</span>
              <strong>{commercialConditions.economicGroup ?? "—"}</strong>
            </div>

            <div className={styles.conditionItem}>
              <span>Acuerdo despachante / agencia</span>
              <strong>{commercialConditions.brokerAgreement ?? "—"}</strong>
            </div>

            <div className={styles.conditionItem}>
              <span>Vencimiento de cotización</span>
              <strong>
                {formatDate(commercialConditions.quotationValidUntil)}
              </strong>
            </div>

            <div
              className={`${styles.conditionItem} ${styles.observationItem}`}
            >
              <span>Observación adicional</span>
              <strong>
                {commercialConditions.additionalObservation ||
                  "Sin observaciones adicionales"}
              </strong>
            </div>
          </div>
        </section>

        <section className={styles.segmentSection}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.overline}>
                SEGMENTOS CONFIGURADOS
              </span>
              <h2>Configuraciones tarifarias activas</h2>
              <p>
                Cada segmento mantiene su propia tarifa, vigencia y
                servicios.
              </p>
            </div>

            {unconfiguredSegments.length > 0 && (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => openAddSegmentModal()}
              >
                + Agregar segmento
              </button>
            )}
          </div>

          <div className={styles.segmentGrid}>
            {segmentConfigurations.map((configuration) => {
              const active =
                selectedSegment === configuration.segmentCode;

              const serviceCount =
                servicesBySegment[configuration.segmentCode]?.length ?? 0;

              return (
                <article
                  key={configuration.segmentCode}
                  className={`${styles.segmentCard} ${
                    active ? styles.segmentCardActive : ""
                  }`}
                  onClick={() =>
                    setSelectedSegment(configuration.segmentCode)
                  }
                >
                  <div className={styles.segmentCardTop}>
                    <div>
                      <span className={styles.segmentCode}>
                        {configuration.segmentCode}
                      </span>
                      <h3>{configuration.segmentName}</h3>
                    </div>

                    <button
                      type="button"
                      className={styles.cardEditButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditSegmentModal(configuration);
                      }}
                    >
                      Editar
                    </button>
                  </div>

                  <div className={styles.segmentMeta}>
                    <div>
                      <span>Tarifa</span>
                      <strong>
                        {formatTariffType(configuration.tariffType)}
                      </strong>
                    </div>

                    <div>
                      <span>Vigencia</span>
                      <strong>
                        {formatDate(configuration.validUntil)}
                      </strong>
                    </div>

                    <div>
                      <span>Servicios</span>
                      <strong>{serviceCount}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {selectedConfiguration && (
          <section className={styles.servicesPanel}>
            <div className={styles.serviceHeader}>
              <div>
                <span className={styles.overline}>
                  SERVICIOS DEL SEGMENTO
                </span>
                <h2>{selectedConfiguration.segmentName}</h2>
                <p>
                  Vista resumida. La configuración se realiza desde
                  “Editar” en el segmento.
                </p>
              </div>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() =>
                  openEditSegmentModal(selectedConfiguration)
                }
              >
                Configurar segmento y servicios
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.servicesTable}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Servicio / Tasa</th>
                    <th>Cálculo</th>
                    <th>Aplicación</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedServices.map((service) => (
                    <tr key={service.id}>
                      <td>
                        <strong>{service.code}</strong>
                      </td>
                      <td>{service.name}</td>
                      <td>
                        {formatCalculationType(
                          service.calculationType
                        )}
                      </td>
                      <td>{formatCargo(service.cargoApplicability)}</td>
                      <td>
                        <span
                          className={
                            service.status === "EXEMPT"
                              ? styles.serviceExempt
                              : styles.serviceBillable
                          }
                        >
                          {service.status === "EXEMPT"
                            ? "Exonerado"
                            : "Facturable"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {selectedServices.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.emptyTable}>
                        Este segmento todavía no tiene servicios
                        configurados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {unconfiguredSegments.length > 0 && (
          <section className={styles.availablePanel}>
            <div>
              <span className={styles.overline}>
                SEGMENTOS DISPONIBLES
              </span>
              <h2>Aún no configurados</h2>
            </div>

            <div className={styles.availableList}>
              {unconfiguredSegments.map((segment) => (
                <button
                  type="button"
                  key={segment.code}
                  onClick={() =>
                    openAddSegmentModal(segment.code)
                  }
                >
                  <span>{segment.code}</span>
                  <strong>{segment.name}</strong>
                  <i>+</i>
                </button>
              ))}
            </div>
          </section>
        )}
      </section>

      {conditionsModalOpen && (
        <div className={styles.modalBackdrop}>
          <div
            className={`${styles.modal} ${styles.modalMedium}`}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>
                  CONDICIONES COMERCIALES
                </span>
                <h2>Editar condiciones del cliente</h2>
              </div>

              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setConditionsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <label className={styles.formField}>
                  <span>Días de crédito</span>
                  <input
                    type="number"
                    min={0}
                    value={conditionsDraft.creditDays}
                    onChange={(event) =>
                      setConditionsDraft((current) => ({
                        ...current,
                        creditDays: Number(event.target.value),
                      }))
                    }
                  />
                </label>

                <label className={styles.formField}>
                  <span>Crédito aplicado a</span>
                  <select
                    value={conditionsDraft.creditAppliesTo}
                    onChange={(event) =>
                      setConditionsDraft((current) => ({
                        ...current,
                        creditAppliesTo:
                          event.target.value as CreditAppliesTo,
                      }))
                    }
                  >
                    <option value="CLIENT">Cliente</option>
                    <option value="BROKER">Despachante</option>
                  </select>
                </label>

                <label className={styles.formField}>
                  <span>Grupo económico</span>
                  <input
                    value={conditionsDraft.economicGroup ?? ""}
                    onChange={(event) =>
                      setConditionsDraft((current) => ({
                        ...current,
                        economicGroup: event.target.value || null,
                      }))
                    }
                  />
                </label>

                <label className={styles.formField}>
                  <span>Acuerdo despachante / agencia</span>
                  <input
                    value={conditionsDraft.brokerAgreement ?? ""}
                    onChange={(event) =>
                      setConditionsDraft((current) => ({
                        ...current,
                        brokerAgreement: event.target.value || null,
                      }))
                    }
                  />
                </label>

                <label className={styles.formField}>
                  <span>Vencimiento de cotización</span>
                  <input
                    type="date"
                    value={conditionsDraft.quotationValidUntil ?? ""}
                    onChange={(event) =>
                      setConditionsDraft((current) => ({
                        ...current,
                        quotationValidUntil:
                          event.target.value || null,
                      }))
                    }
                  />
                </label>

                <label
                  className={`${styles.formField} ${styles.fullWidth}`}
                >
                  <span>Observación adicional</span>
                  <textarea
                    value={conditionsDraft.additionalObservation}
                    onChange={(event) =>
                      setConditionsDraft((current) => ({
                        ...current,
                        additionalObservation: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setConditionsModalOpen(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={saveConditions}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {segmentModalOpen && segmentDraft && (
        <div className={styles.modalBackdrop}>
          <div
            className={`${styles.modal} ${styles.modalLarge}`}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>
                  {segmentMode === "ADD"
                    ? "NUEVO SEGMENTO"
                    : "CONFIGURACIÓN DEL SEGMENTO"}
                </span>
                <h2>
                  {segmentMode === "ADD"
                    ? "Agregar segmento"
                    : segmentDraft.segmentName}
                </h2>
                <p>
                  Configure el segmento y sus servicios antes de guardar.
                </p>
              </div>

              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setSegmentModalOpen(false);
                  setSegmentDraft(null);
                }}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.segmentSettings}>
                <label className={styles.formField}>
                  <span>Segmento</span>
                  <select
                    value={segmentDraft.segmentCode}
                    disabled={segmentMode === "EDIT"}
                    onChange={(event) => {
                      const selected = segmentCatalog.find(
                        (item) => item.code === event.target.value
                      );

                      if (!selected) return;

                      setSegmentDraft((current) =>
                        current
                          ? {
                              ...current,
                              segmentCode: selected.code,
                              segmentName: selected.name,
                              services: [],
                            }
                          : current
                      );
                    }}
                  >
                    {(segmentMode === "ADD"
                      ? unconfiguredSegments
                      : segmentCatalog.filter(
                          (item) =>
                            item.code === segmentDraft.segmentCode
                        )
                    ).map((segment) => (
                      <option key={segment.code} value={segment.code}>
                        {segment.code} - {segment.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.formField}>
                  <span>Tipo de tarifa</span>
                  <select
                    value={segmentDraft.tariffType}
                    onChange={(event) =>
                      setSegmentDraft((current) =>
                        current
                          ? {
                              ...current,
                              tariffType:
                                event.target.value as TariffType,
                            }
                          : current
                      )
                    }
                  >
                    <option value="STANDARD">Estándar</option>
                    <option value="CORPORATE">Corporativa</option>
                    <option value="GROUP">De grupo</option>
                  </select>
                </label>

                <label className={styles.formField}>
                  <span>Vigencia</span>
                  <input
                    type="date"
                    value={segmentDraft.validUntil}
                    onChange={(event) =>
                      setSegmentDraft((current) =>
                        current
                          ? {
                              ...current,
                              validUntil: event.target.value,
                            }
                          : current
                      )
                    }
                  />
                </label>
              </div>

              <div className={styles.modalSectionHeader}>
                <div>
                  <span className={styles.overline}>
                    SERVICIOS / TASAS
                  </span>
                  <h3>Servicios del segmento</h3>
                  <p>
                    Los servicios se seleccionan desde el catálogo maestro.
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={openAddServiceModal}
                >
                  + Agregar servicio
                </button>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.servicesTable}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Servicio / Tasa</th>
                      <th>Cálculo</th>
                      <th>Aplicación</th>
                      <th>Adicionales</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {segmentDraft.services.map((service) => (
                      <tr key={service.id}>
                        <td>
                          <strong>{service.code}</strong>
                        </td>
                        <td>{service.name}</td>
                        <td>
                          {formatCalculationType(
                            service.calculationType
                          )}
                        </td>
                        <td>
                          {formatCargo(service.cargoApplicability)}
                        </td>
                        <td>{service.additionalIds.length}</td>
                        <td>
                          <span
                            className={
                              service.status === "EXEMPT"
                                ? styles.serviceExempt
                                : styles.serviceBillable
                            }
                          >
                            {service.status === "EXEMPT"
                              ? "Exonerado"
                              : "Facturable"}
                          </span>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              onClick={() =>
                                openEditServiceModal(service)
                              }
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className={styles.dangerAction}
                              onClick={() =>
                                removeService(service.id)
                              }
                            >
                              Quitar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {segmentDraft.services.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className={styles.emptyTable}
                        >
                          Aún no hay servicios configurados para este
                          segmento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.modalFooter}>
              {segmentMode === "EDIT" && (
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={removeSegment}
                >
                  Quitar segmento
                </button>
              )}

              <div className={styles.footerRight}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setSegmentModalOpen(false);
                    setSegmentDraft(null);
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={saveSegmentModal}
                >
                  {segmentMode === "ADD"
                    ? "Agregar segmento"
                    : "Guardar configuración"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {serviceModalOpen && (
        <div className={`${styles.modalBackdrop} ${styles.nestedBackdrop}`}>
          <div
            className={`${styles.modal} ${styles.modalLarge}`}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.overline}>
                  {serviceMode === "ADD"
                    ? "AGREGAR SERVICIO"
                    : "EDITAR SERVICIO"}
                </span>
                <h2>
                  {serviceMode === "ADD"
                    ? "Seleccionar y configurar servicio"
                    : serviceDraft?.name}
                </h2>
                <p>
                  El código y la descripción provienen del catálogo de
                  servicios.
                </p>
              </div>

              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setServiceModalOpen(false);
                  setServiceDraft(null);
                  setSelectedMasterId("");
                }}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {serviceMode === "ADD" && (
                <div className={styles.catalogSelector}>
                  <label className={styles.formField}>
                    <span>Servicio del catálogo</span>
                    <select
                      value={selectedMasterId}
                      onChange={(event) =>
                        selectServiceMaster(event.target.value)
                      }
                    >
                      <option value="">
                        Seleccione código y servicio...
                      </option>

                      {availableServiceMasters.map((service) => (
                        <option
                          key={service.masterId}
                          value={service.masterId}
                        >
                          {service.code} - {service.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {!serviceDraft ? (
                <div className={styles.catalogEmptyState}>
                  Seleccione un servicio del catálogo para cargar su
                  configuración base.
                </div>
              ) : (
                <>
                  <div className={styles.serviceIdentityGrid}>
                    <div className={styles.readonlyField}>
                      <span>Código</span>
                      <strong>{serviceDraft.code}</strong>
                    </div>

                    <div
                      className={`${styles.readonlyField} ${styles.doubleField}`}
                    >
                      <span>Descripción Tasa / Servicio</span>
                      <strong>{serviceDraft.name}</strong>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3>Cálculo y valores</h3>

                    <div className={styles.serviceFormGrid}>
                      <label className={styles.formField}>
                        <span>Tipo de cálculo</span>
                        <select
                          value={serviceDraft.calculationType}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    calculationType:
                                      event.target
                                        .value as CalculationType,
                                  }
                                : current
                            )
                          }
                        >
                          <option value="BOX_RATE">Box rate</option>
                          <option value="PERCENTAGE">
                            Porcentual
                          </option>
                          <option value="FIXED">Fija</option>
                        </select>
                      </label>

                      <label className={styles.formField}>
                        <span>Valor</span>
                        <input
                          type="number"
                          value={serviceDraft.value}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    value: Number(event.target.value),
                                  }
                                : current
                            )
                          }
                        />
                      </label>

                      <label className={styles.formField}>
                        <span>Operación</span>
                        <input
                          value={serviceDraft.operation}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    operation: event.target.value,
                                  }
                                : current
                            )
                          }
                        />
                      </label>

                      <label className={styles.formField}>
                        <span>Moneda</span>
                        <select
                          value={serviceDraft.currency}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    currency:
                                      event.target.value as CurrencyType,
                                  }
                                : current
                            )
                          }
                        >
                          <option value="USD">
                            Extranjera (USD)
                          </option>
                          <option value="PYG">Local (PYG)</option>
                        </select>
                      </label>

                      <label className={styles.formField}>
                        <span>Importe mínimo</span>
                        <input
                          type="number"
                          value={serviceDraft.minimumAmount ?? ""}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    minimumAmount:
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
                        <span>Precio</span>
                        <input
                          type="number"
                          value={serviceDraft.price ?? ""}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    price:
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
                  </div>

                  <div className={styles.formSection}>
                    <h3>Condiciones estructuradas</h3>

                    <div className={styles.serviceFormGrid}>
                      <label className={styles.formField}>
                        <span>Aplicación de carga</span>
                        <select
                          value={serviceDraft.cargoApplicability}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    cargoApplicability:
                                      event.target
                                        .value as CargoApplicability,
                                  }
                                : current
                            )
                          }
                        >
                          <option value="BOTH">
                            Seca / Refrigerada
                          </option>
                          <option value="DRY">Seca</option>
                          <option value="REEFER">
                            Refrigerada
                          </option>
                        </select>
                      </label>

                      <label className={styles.formField}>
                        <span>Unidad de almacenaje</span>
                        <select
                          value={serviceDraft.storageUnit}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    storageUnit:
                                      event.target.value as StorageUnit,
                                  }
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
                        <span>Fecha vencimiento</span>
                        <input
                          type="date"
                          value={serviceDraft.validUntil}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    validUntil: event.target.value,
                                  }
                                : current
                            )
                          }
                        />
                      </label>

                      <label className={styles.formField}>
                        <span>Estado</span>
                        <select
                          value={serviceDraft.status}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    status:
                                      event.target
                                        .value as ServiceStatus,
                                  }
                                : current
                            )
                          }
                        >
                          <option value="BILLABLE">
                            Facturable
                          </option>
                          <option value="EXEMPT">Exonerado</option>
                        </select>
                      </label>

                      <label className={styles.checkField}>
                        <input
                          type="checkbox"
                          checked={serviceDraft.shared}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    shared: event.target.checked,
                                  }
                                : current
                            )
                          }
                        />
                        <span>Compartido</span>
                      </label>

                      <label className={styles.checkField}>
                        <input
                          type="checkbox"
                          checked={serviceDraft.cip}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    cip: event.target.checked,
                                  }
                                : current
                            )
                          }
                        />
                        <span>CIP</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <div className={styles.formSectionHeading}>
                      <div>
                        <h3>Adicionales incluidos</h3>
                        <p>
                          Reemplaza textos como “incluye adicionales” o
                          “incluye gestión de frontera”.
                        </p>
                      </div>
                    </div>

                    <div className={styles.checkboxGrid}>
                      {additionalCatalog.map((option) => (
                        <label
                          className={styles.checkboxCard}
                          key={option.id}
                        >
                          <input
                            type="checkbox"
                            checked={serviceDraft.additionalIds.includes(
                              option.id
                            )}
                            onChange={(event) =>
                              setServiceDraft((current) =>
                                current
                                  ? {
                                      ...current,
                                      additionalIds: toggleArrayValue(
                                        current.additionalIds,
                                        option.id,
                                        event.target.checked
                                      ),
                                    }
                                  : current
                              )
                            }
                          />

                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <div className={styles.formSectionHeading}>
                      <div>
                        <h3>Validaciones operativas NAVIS</h3>
                        <p>
                          Condiciones que podrán utilizarse para sugerir o
                          validar adicionales automáticamente.
                        </p>
                      </div>
                    </div>

                    <div className={styles.checkboxGrid}>
                      {navisRuleCatalog.map((option) => (
                        <label
                          className={styles.checkboxCard}
                          key={option.id}
                        >
                          <input
                            type="checkbox"
                            checked={serviceDraft.navisRuleIds.includes(
                              option.id
                            )}
                            onChange={(event) =>
                              setServiceDraft((current) =>
                                current
                                  ? {
                                      ...current,
                                      navisRuleIds: toggleArrayValue(
                                        current.navisRuleIds,
                                        option.id,
                                        event.target.checked
                                      ),
                                    }
                                  : current
                              )
                            }
                          />

                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3>Estadía, energía y rangos</h3>

                    <div className={styles.serviceFormGrid}>
                      <label className={styles.formField}>
                        <span>Estadía libre</span>
                        <input
                          type="number"
                          value={serviceDraft.freeStayDays ?? ""}
                          onChange={(event) =>
                            setServiceDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    freeStayDays:
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
                        <span>Precio energía</span>
                        <input
                          type="number"
                          value={serviceDraft.energyPrice ?? ""}
                          onChange={(event) =>
                            setServiceDraft((current) =>
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
                          value={serviceDraft.freeEnergy ?? ""}
                          onChange={(event) =>
                            setServiceDraft((current) =>
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
                          value={serviceDraft.rangeStart ?? ""}
                          onChange={(event) =>
                            setServiceDraft((current) =>
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
                          value={serviceDraft.rangeEnd ?? ""}
                          onChange={(event) =>
                            setServiceDraft((current) =>
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
                  </div>

                  <div className={styles.formSection}>
                    <h3>Observación adicional</h3>
                    <p className={styles.helperText}>
                      Solo comentarios no normativos. Las reglas anteriores
                      ya quedan parametrizadas.
                    </p>

                    <textarea
                      className={styles.observationInput}
                      value={serviceDraft.observation}
                      onChange={(event) =>
                        setServiceDraft((current) =>
                          current
                            ? {
                                ...current,
                                observation: event.target.value,
                              }
                            : current
                        )
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setServiceModalOpen(false);
                  setServiceDraft(null);
                  setSelectedMasterId("");
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                disabled={!serviceDraft}
                onClick={saveServiceModal}
              >
                {serviceMode === "ADD"
                  ? "Agregar servicio"
                  : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
