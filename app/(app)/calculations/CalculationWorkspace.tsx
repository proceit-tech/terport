"use client";

import { useMemo, useState, type ReactNode } from "react";
import clientsData from "@/mock-data/clients.json";
import servicesData from "@/mock-data/services.json";
import tariffsData from "@/mock-data/tariffs.json";
import matrixData from "@/mock-data/service-matrix.json";
import demoData from "@/mock-data/calculation-demo.json";
import styles from "./calculation.module.css";

type TariffType = "STANDARD" | "CORPORATE" | "GROUP";
type CalculationType = "BOX_RATE" | "PERCENTAGE" | "FIXED";
type ContainerSize = "20" | "40";
type CargoType = "DRY" | "REEFER";
type Direction = "IMPORT" | "EXPORT";
type DateMode = "EMISSION" | "FUTURE";
type CreditAppliedTo = "CLIENT" | "BROKER";

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

interface Service {
  id: string;
  code: string;
  name: string;
  category: string;
  calculationType: CalculationType;
  currency: string;
  minimumAmount: number | null;
  freeStayDays: number | null;
  energyPrice: number | null;
  freeEnergy: number | null;
  rangeStart: number | null;
  rangeEnd: number | null;
  containerSizes: string[];
  cargoTypes: CargoType[];
  storageUnit: "NONE" | "M2" | "M3";
  segments: Array<{ segmentCode: string; articleCode: string }>;
  active: boolean;
}

interface TariffLine {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  articleCode: string;
  calculationType: CalculationType;
  value: number;
  minimumAmount: number | null;
  currency: string;
  freeStayDaysOverride?: number | null;
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
  currency: string;
  status: string;
  lines: TariffLine[];
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

interface CommercialCondition {
  creditDays: number;
  creditAppliedTo: CreditAppliedTo;
  economicGroup: string | null;
  brokerAgreement: string | null;
  quotationValidUntil: string;
}

interface NavisRecord {
  containerNumber: string;
  navisDocument: string;
  port: string;
  size: ContainerSize;
  entryDateTime: string;
  cargoType: CargoType;
  plugged: boolean;
  sealVerified: boolean;
  opened: boolean;
  verification: boolean;
}

interface AutomaticRule {
  id: string;
  trigger: CargoType;
  serviceId: string;
  label: string;
  reason: string;
  containerSizes: ContainerSize[];
  navisConditions?: {
    plugged?: boolean;
    sealVerified?: boolean;
    opened?: boolean;
    verification?: boolean;
  };
}

interface ContainerDraft {
  id: string;
  number: string;
  port: string;
  size: ContainerSize;
  navisDocument: string;
  entryDateTime: string;
  cargoType: CargoType;
  navisSynced: boolean;
  navisReportedSize: ContainerSize | null;
  navis: {
    plugged: boolean;
    sealVerified: boolean;
    opened: boolean;
    verification: boolean;
  };
  storageQuantity: number;
  excludedServiceIds: string[];
  excludedAutomatic: Array<{ serviceId: string; reason: string }>;
}

interface AppliedService {
  service: Service;
  articleCode: string;
  origin: "TARIFF" | "AUTOMATIC";
  reason: string;
  unitPrice: number;
  quantity: number;
  total: number;
  minimumApplied: number | null;
  exonerated: boolean;
}

interface ValidationItem {
  id: string;
  level: "BLOCKING" | "WARNING" | "INFO";
  title: string;
  detail: string;
}

const clients = clientsData as Client[];
const services = servicesData as Service[];
const tariffs = tariffsData as Tariff[];
const matrix = matrixData as MatrixEntry[];
const navisRecords = demoData.navisRecords as NavisRecord[];
const automaticRules = demoData.automaticRules as AutomaticRule[];
const commercialConditions =
  demoData.commercialConditions as Record<string, CommercialCondition>;

const segmentNames: Record<string, string> = {
  IMPTER: "Importación Terrestre FCL",
  IMPFCL: "Importación FCL",
  IMPLCL: "Importación LCL",
  EXPFCL: "Exportación FCL",
  EXPLCL: "Exportación LCL",
  IMPFLU: "Importación Fluvial",
  EXPFLU: "Exportación Fluvial",
};

const operationLabel = (direction: Direction) =>
  direction === "IMPORT" ? "IMPORTACIÓN" : "EXPORTACIÓN";

const directionFromSegment = (segmentCode: string): Direction =>
  segmentCode.startsWith("EXP") ? "EXPORT" : "IMPORT";

const formatTariffType = (type: TariffType) =>
  type === "CORPORATE"
    ? "Corporativa"
    : type === "GROUP"
      ? "De grupo"
      : "Estándar";

const formatCargoType = (type: CargoType) =>
  type === "REEFER" ? "Refrigerada" : "Seca";

const formatCalculation = (type: CalculationType) =>
  type === "BOX_RATE"
    ? "Box rate"
    : type === "PERCENTAGE"
      ? "Porcentual"
      : "Fija";

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

function formatDateTime(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value: number, currency: "USD" | "PYG" = "USD") {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "PYG" ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function daysBetween(from: string, to: string) {
  if (!from || !to) return 0;
  const [fy, fm, fd] = from.slice(0, 10).split("-").map(Number);
  const [ty, tm, td] = to.slice(0, 10).split("-").map(Number);
  return Math.max(
    0,
    Math.floor(
      (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) /
        86400000
    )
  );
}

function newContainer(id: string, size: ContainerSize): ContainerDraft {
  return {
    id,
    number: "",
    port: "PYVIL",
    size,
    navisDocument: "",
    entryDateTime: "",
    cargoType: "DRY",
    navisSynced: false,
    navisReportedSize: null,
    navis: {
      plugged: false,
      sealVerified: false,
      opened: false,
      verification: false,
    },
    storageQuantity: 0,
    excludedServiceIds: [],
    excludedAutomatic: [],
  };
}

export default function CalculationWorkspace() {
  const [clientId, setClientId] = useState("0102461");
  const [dateMode, setDateMode] = useState<DateMode>("EMISSION");
  const [emissionDate, setEmissionDate] = useState("2026-09-12");
  const [futureDate, setFutureDate] = useState("2026-09-12");
  const [dispatchNumber, setDispatchNumber] = useState("IMP-45873");
  const [segmentCode, setSegmentCode] = useState("IMPTER");
  const [tariffType, setTariffType] =
    useState<TariffType>("CORPORATE");

  const [invoiceValue, setInvoiceValue] = useState(1000);
  const [freightValue, setFreightValue] = useState(500);
  const [insuranceValue, setInsuranceValue] = useState(15);
  const [fobValue, setFobValue] = useState(1200);

  const [declared20, setDeclared20] = useState(1);
  const [declared40, setDeclared40] = useState(1);

  const [containers, setContainers] = useState<ContainerDraft[]>([
    {
      ...newContainer("cnt-1", "20"),
      number: "HASU5037924",
      navisDocument: "NAV-45873-01",
      entryDateTime: "2026-09-10T08:30",
      navisSynced: true,
      navis: {
        plugged: false,
        sealVerified: true,
        opened: false,
        verification: true,
      },
    },
    {
      ...newContainer("cnt-2", "40"),
      number: "TGHU9083371",
      navisDocument: "NAV-45873-02",
      entryDateTime: "2026-09-09T12:15",
      navisSynced: true,
      navis: {
        plugged: false,
        sealVerified: true,
        opened: false,
        verification: false,
      },
    },
  ]);

  const [expandedIds, setExpandedIds] = useState<string[]>([
    "cnt-1",
    "cnt-2",
  ]);
  const [showExonerated, setShowExonerated] = useState<
    Record<string, boolean>
  >({});

  const [observation, setObservation] = useState("");

  const [creditExceptionEnabled, setCreditExceptionEnabled] =
    useState(false);
  const [operationCreditDays, setOperationCreditDays] = useState(30);
  const [operationCreditAppliedTo, setOperationCreditAppliedTo] =
    useState<CreditAppliedTo>("CLIENT");
  const [creditExceptionValidated, setCreditExceptionValidated] =
    useState(false);
  const [creditValidationOpen, setCreditValidationOpen] =
    useState(false);
  const [creditValidationReason, setCreditValidationReason] =
    useState("");

  const [autoRemoval, setAutoRemoval] = useState<{
    containerId: string;
    serviceId: string;
  } | null>(null);
  const [autoRemovalReason, setAutoRemovalReason] = useState("");

  const [proformaOpen, setProformaOpen] = useState(false);
  const [proformaIssuedAt, setProformaIssuedAt] = useState<string | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === clientId) ?? null,
    [clientId]
  );

  const clientCommercial = useMemo(
    () => commercialConditions[clientId] ?? null,
    [clientId]
  );

  const availableSegments = selectedClient?.configurations ?? [];

  const matrixEntry = useMemo(
    () => matrix.find((entry) => entry.clientId === clientId) ?? null,
    [clientId]
  );

  const matrixSegment = useMemo(
    () =>
      matrixEntry?.segments.find(
        (segment) => segment.segmentCode === segmentCode
      ) ?? null,
    [matrixEntry, segmentCode]
  );

  const direction = directionFromSegment(segmentCode);
  const calculationDate =
    dateMode === "FUTURE" ? futureDate : emissionDate;

  const recommendedTariffType =
    matrixSegment?.tariffType ??
    selectedClient?.configurations.find(
      (item) => item.segmentCode === segmentCode
    )?.tariffType ??
    "STANDARD";

  const groupOwnerId = useMemo(() => {
    if (clientCommercial?.economicGroup === "GRUPO LOGÍSTICO")
      return "grp-logistico";
    if (clientCommercial?.economicGroup === "GRUPO COMERCIAL")
      return "grp-comercial";
    return clientCommercial?.economicGroup ? "grp-industrial" : null;
  }, [clientCommercial]);

  const selectedTariff = useMemo(() => {
    if (tariffType === "STANDARD") {
      return (
        tariffs.find(
          (tariff) =>
            tariff.type === "STANDARD" &&
            tariff.segmentCode === segmentCode &&
            tariff.status !== "EXPIRED"
        ) ?? null
      );
    }

    if (tariffType === "CORPORATE") {
      return (
        tariffs.find(
          (tariff) =>
            tariff.type === "CORPORATE" &&
            tariff.segmentCode === segmentCode &&
            tariff.ownerId === clientId &&
            tariff.status !== "EXPIRED"
        ) ?? null
      );
    }

    return (
      tariffs.find(
        (tariff) =>
          tariff.type === "GROUP" &&
          tariff.segmentCode === segmentCode &&
          tariff.ownerId === groupOwnerId &&
          tariff.status !== "EXPIRED"
      ) ?? null
    );
  }, [tariffType, segmentCode, clientId, groupOwnerId]);

  const exchangeRate = Number(demoData.exchangeRate.value);
  const commercialBaseUSD =
    direction === "IMPORT"
      ? invoiceValue + freightValue + insuranceValue
      : fobValue;
  const commercialBasePYG = commercialBaseUSD * exchangeRate;

  const eligibleTariffLines = useMemo(() => {
    if (!selectedTariff) return [];

    if (tariffType === "STANDARD") {
      return selectedTariff.lines;
    }

    if (!matrixSegment) return [];

    const allowed = new Set(matrixSegment.serviceIds);
    return selectedTariff.lines.filter((line) =>
      allowed.has(line.serviceId)
    );
  }, [selectedTariff, tariffType, matrixSegment]);

  const getService = (serviceId: string) =>
    services.find((service) => service.id === serviceId) ?? null;

  const lineForService = (serviceId: string) =>
    selectedTariff?.lines.find((line) => line.serviceId === serviceId) ??
    null;

  function articleForSegment(service: Service) {
    return (
      service.segments.find(
        (segment) => segment.segmentCode === segmentCode
      )?.articleCode ?? service.code
    );
  }

  function automaticRuleMatches(
    rule: AutomaticRule,
    container: ContainerDraft
  ) {
    if (
      rule.trigger !== container.cargoType ||
      !rule.containerSizes.includes(container.size)
    ) {
      return false;
    }

    if (!rule.navisConditions) return true;
    if (!container.navisSynced) return false;

    return Object.entries(rule.navisConditions).every(
      ([key, expected]) =>
        container.navis[key as keyof ContainerDraft["navis"]] === expected
    );
  }

  function appliedServices(container: ContainerDraft): AppliedService[] {
    const rows: AppliedService[] = [];

    eligibleTariffLines.forEach((line) => {
      if (container.excludedServiceIds.includes(line.serviceId)) return;

      const service = getService(line.serviceId);
      if (!service || !service.active) return;

      const segmentCompatible = service.segments.some(
        (segment) => segment.segmentCode === segmentCode
      );
      const sizeCompatible = service.containerSizes.includes(
        container.size
      );
      const cargoCompatible = service.cargoTypes.includes(
        container.cargoType
      );

      if (!segmentCompatible || !sizeCompatible || !cargoCompatible)
        return;

      const quantity =
        service.storageUnit === "NONE"
          ? 1
          : Math.max(0, container.storageQuantity);

      let calculated =
        line.calculationType === "PERCENTAGE"
          ? commercialBaseUSD * (line.value / 100)
          : line.value * quantity;

      const minimum =
        line.minimumAmount ?? service.minimumAmount ?? null;
      let minimumApplied: number | null = null;

      if (minimum !== null && calculated < minimum) {
        calculated = minimum;
        minimumApplied = minimum;
      }

      rows.push({
        service,
        articleCode: line.articleCode || articleForSegment(service),
        origin: "TARIFF",
        reason: "Condición tarifaria",
        unitPrice: line.value,
        quantity,
        total: calculated,
        minimumApplied,
        exonerated: line.value === 0,
      });
    });

    automaticRules.forEach((rule) => {
      if (
        !automaticRuleMatches(rule, container) ||
        container.excludedAutomatic.some(
          (item) => item.serviceId === rule.serviceId
        )
      )
        return;

      const service = getService(rule.serviceId);
      const line = lineForService(rule.serviceId);
      const matrixAllows =
        tariffType === "STANDARD" ||
        Boolean(matrixSegment?.serviceIds.includes(rule.serviceId));

      if (!service || !line || !matrixAllows) return;
      if (rows.some((row) => row.service.id === service.id)) return;

      let calculated = line.value;
      const minimum =
        line.minimumAmount ?? service.minimumAmount ?? null;
      let minimumApplied: number | null = null;

      if (minimum !== null && calculated < minimum) {
        calculated = minimum;
        minimumApplied = minimum;
      }

      rows.push({
        service,
        articleCode: line.articleCode || articleForSegment(service),
        origin: "AUTOMATIC",
        reason: rule.reason,
        unitPrice: line.value,
        quantity: 1,
        total: calculated,
        minimumApplied,
        exonerated: line.value === 0,
      });
    });

    return rows;
  }

  function automaticSuggestions(container: ContainerDraft) {
    return automaticRules
      .filter((rule) => automaticRuleMatches(rule, container))
      .map((rule) => {
        const service = getService(rule.serviceId);
        const tariffLine = lineForService(rule.serviceId);
        const matrixAllows =
          tariffType === "STANDARD" ||
          Boolean(matrixSegment?.serviceIds.includes(rule.serviceId));

        return {
          rule,
          service,
          tariffLine,
          matrixAllows,
          applicable: Boolean(service && tariffLine && matrixAllows),
        };
      });
  }

  function overstayFor(container: ContainerDraft) {
    const service =
      services.find(
        (item) =>
          item.category === "SOBREESTADIA" &&
          item.containerSizes.includes(container.size) &&
          item.segments.some(
            (segment) => segment.segmentCode === segmentCode
          )
      ) ?? null;

    if (!service || !emissionDate || !calculationDate) return null;

    const line = lineForService(service.id);
    const matrixAllows =
      tariffType === "STANDARD" ||
      Boolean(matrixSegment?.serviceIds.includes(service.id));

    const freeDays =
      line?.freeStayDaysOverride ?? service.freeStayDays ?? 0;
    const elapsedDays = daysBetween(
      emissionDate,
      calculationDate
    );
    const billableDays = Math.max(0, elapsedDays - freeDays);

    return {
      service,
      configured: Boolean(line && matrixAllows),
      freeDays,
      elapsedDays,
      billableDays,
      rate: line?.value ?? 0,
      total: line && matrixAllows ? line.value * billableDays : 0,
    };
  }

  const perContainer = useMemo(
    () =>
      containers.map((container) => ({
        container,
        services: appliedServices(container),
        suggestions: automaticSuggestions(container),
        overstay: overstayFor(container),
      })),
    [
      containers,
      eligibleTariffLines,
      selectedTariff,
      tariffType,
      matrixSegment,
      segmentCode,
      commercialBaseUSD,
      emissionDate,
      calculationDate,
    ]
  );

  const loaded20 = containers.filter(
    (container) => container.size === "20"
  ).length;
  const loaded40 = containers.filter(
    (container) => container.size === "40"
  ).length;

  const serviceSubtotal = perContainer.reduce(
    (total, item) =>
      total +
      item.services
        .filter((service) => !service.exonerated)
        .reduce((sum, service) => sum + service.total, 0),
    0
  );

  const overstayTotal = perContainer.reduce(
    (total, item) => total + (item.overstay?.total ?? 0),
    0
  );

  const totalUSD = serviceSubtotal + overstayTotal;
  const totalPYG = totalUSD * exchangeRate;

  const exoneratedCount = perContainer.reduce(
    (total, item) =>
      total +
      item.services.filter((service) => service.exonerated).length,
    0
  );

  const automaticCount = perContainer.reduce(
    (total, item) =>
      total +
      item.services.filter(
        (service) => service.origin === "AUTOMATIC"
      ).length,
    0
  );

  const creditChanged =
    creditExceptionEnabled &&
    clientCommercial !== null &&
    (operationCreditDays !== clientCommercial.creditDays ||
      operationCreditAppliedTo !== clientCommercial.creditAppliedTo);

  const validations = useMemo<ValidationItem[]>(() => {
    const rows: ValidationItem[] = [];

    if (!selectedClient) {
      rows.push({
        id: "client",
        level: "BLOCKING",
        title: "Cliente requerido",
        detail: "Seleccione el cliente de la operación.",
      });
    } else if (!selectedClient.billable) {
      rows.push({
        id: "billable",
        level: "BLOCKING",
        title: "Cliente no facturable",
        detail:
          "El cliente seleccionado está marcado como no facturable.",
      });
    } else {
      rows.push({
        id: "client-ok",
        level: "INFO",
        title: "Cliente validado",
        detail: `${selectedClient.name} está habilitado para facturación.`,
      });
    }

    if (!dispatchNumber.trim()) {
      rows.push({
        id: "dispatch",
        level: "BLOCKING",
        title: "N.º de despacho requerido",
        detail: "Ingrese la referencia operativa del despacho.",
      });
    }

    if (!emissionDate) {
      rows.push({
        id: "emission-date",
        level: "BLOCKING",
        title: "Fecha de emisión requerida",
        detail: "Ingrese la fecha de emisión de la operación.",
      });
    }

    if (dateMode === "FUTURE") {
      if (!futureDate) {
        rows.push({
          id: "withdrawal-date",
          level: "BLOCKING",
          title: "Fecha de retiro/facturación requerida",
          detail:
            "Para un cálculo futuro debe indicar la fecha de retiro o facturación.",
        });
      } else if (emissionDate && futureDate < emissionDate) {
        rows.push({
          id: "withdrawal-date-order",
          level: "BLOCKING",
          title: "Fecha de retiro/facturación inválida",
          detail:
            "La fecha de retiro o facturación no puede ser anterior a la fecha de emisión.",
        });
      }
    }

    if (!selectedTariff) {
      rows.push({
        id: "tariff",
        level: "BLOCKING",
        title: "Tarifa no disponible",
        detail:
          "No existe una tarifa vigente para la combinación seleccionada.",
      });
    } else {
      rows.push({
        id: "tariff-ok",
        level: "INFO",
        title: "Tarifa vigente",
        detail: `${selectedTariff.name} hasta ${formatDate(
          selectedTariff.validUntil
        )}.`,
      });
    }

    if (!matrixSegment && tariffType !== "STANDARD") {
      rows.push({
        id: "matrix",
        level: "BLOCKING",
        title: "Matriz corporativa no configurada",
        detail:
          "No existe relación Cliente × Segmento × Servicio para la tarifa seleccionada.",
      });
    }

    if (loaded20 !== declared20 || loaded40 !== declared40) {
      rows.push({
        id: "count",
        level: "BLOCKING",
        title: "Cantidad de contenedores inconsistente",
        detail: `Declarados: ${declared20} × 20' y ${declared40} × 40'. Cargados: ${loaded20} × 20' y ${loaded40} × 40'.`,
      });
    } else {
      rows.push({
        id: "count-ok",
        level: "INFO",
        title: "Cantidad de contenedores validada",
        detail: `${containers.length} contenedores coinciden con lo declarado.`,
      });
    }

    containers.forEach((container, index) => {
      if (
        !container.number.trim() ||
        !container.port.trim() ||
        !container.navisDocument.trim() ||
        !container.entryDateTime
      ) {
        rows.push({
          id: `container-${container.id}`,
          level: "BLOCKING",
          title: `Contenedor ${index + 1} incompleto`,
          detail:
            "Complete número, puerto, documento NAVIS y fecha/hora de ingreso.",
        });
      }

      if (
        container.navisReportedSize &&
        container.navisReportedSize !== container.size
      ) {
        rows.push({
          id: `navis-size-${container.id}`,
          level: "BLOCKING",
          title: `Tamaño inconsistente en contenedor ${index + 1}`,
          detail: `El contenedor fue creado como ${container.size}', pero NAVIS informa ${container.navisReportedSize}'. El tamaño no se modifica automáticamente; verifique el contenedor o el documento NAVIS.`,
        });
      }

      automaticSuggestions(container).forEach((suggestion) => {
        if (!suggestion.service || suggestion.applicable) return;

        rows.push({
          id: `auto-${container.id}-${suggestion.rule.id}`,
          level: "WARNING",
          title: suggestion.matrixAllows
            ? "Adicional automático sin valor tarifario"
            : "Adicional sugerido no habilitado en matriz",
          detail: suggestion.matrixAllows
            ? `${suggestion.service.name} corresponde por la regla automática, pero no posee valor en la tarifa.`
            : `${suggestion.service.name} fue sugerido por NAVIS/tipo de carga, pero no está habilitado en la matriz corporativa.`,
        });
      });
    });

    if (creditChanged && !creditExceptionValidated) {
      rows.push({
        id: "credit",
        level: "BLOCKING",
        title: "Excepción de crédito pendiente",
        detail:
          "La condición difiere del acuerdo comercial y requiere segunda validación.",
      });
    }

    if (observation.trim()) {
      rows.push({
        id: "observation",
        level: "INFO",
        title: "Observación informativa",
        detail:
          "El comentario no modifica reglas ni condiciones comerciales.",
      });
    }

    return rows;
  }, [
    selectedClient,
    dispatchNumber,
    selectedTariff,
    matrixSegment,
    tariffType,
    loaded20,
    loaded40,
    declared20,
    declared40,
    containers,
    creditChanged,
    creditExceptionValidated,
    observation,
    segmentCode,
    dateMode,
    emissionDate,
    futureDate,
    calculationDate,
  ]);

  const blockingCount = validations.filter(
    (item) => item.level === "BLOCKING"
  ).length;
  const warningCount = validations.filter(
    (item) => item.level === "WARNING"
  ).length;

  function updateClient(nextClientId: string) {
    setClientId(nextClientId);
    const client =
      clients.find((item) => item.id === nextClientId) ?? null;
    const first = client?.configurations[0] ?? null;

    if (first) {
      setSegmentCode(first.segmentCode);
      setTariffType(first.tariffType);
    } else {
      setSegmentCode("IMPTER");
      setTariffType("STANDARD");
    }

    const conditions = commercialConditions[nextClientId];
    if (conditions) {
      setOperationCreditDays(conditions.creditDays);
      setOperationCreditAppliedTo(conditions.creditAppliedTo);
    }

    setCreditExceptionEnabled(false);
    setCreditExceptionValidated(false);
  }

  function updateSegment(nextSegment: string) {
    setSegmentCode(nextSegment);
    const m =
      matrixEntry?.segments.find(
        (item) => item.segmentCode === nextSegment
      ) ?? null;
    const configured =
      selectedClient?.configurations.find(
        (item) => item.segmentCode === nextSegment
      )?.tariffType ?? "STANDARD";
    setTariffType(m?.tariffType ?? configured);
  }

  function updateContainer(
    containerId: string,
    updater: (container: ContainerDraft) => ContainerDraft
  ) {
    setContainers((current) =>
      current.map((container) =>
        container.id === containerId ? updater(container) : container
      )
    );
  }

  function addContainer(size: ContainerSize) {
    const id = `cnt-${Date.now()}`;
    setContainers((current) => [...current, newContainer(id, size)]);
    setExpandedIds((current) => [...current, id]);
  }

  function removeContainer(containerId: string) {
    setContainers((current) =>
      current.filter((container) => container.id !== containerId)
    );
    setExpandedIds((current) =>
      current.filter((id) => id !== containerId)
    );
  }

  function syncNavis(containerId: string) {
    const current = containers.find(
      (container) => container.id === containerId
    );
    if (!current) return;

    const record =
      navisRecords.find(
        (item) =>
          item.navisDocument.toLowerCase() ===
            current.navisDocument.toLowerCase() ||
          item.containerNumber.toLowerCase() ===
            current.number.toLowerCase()
      ) ?? null;

    if (!record) {
      updateContainer(containerId, (container) => ({
        ...container,
        navisSynced: false,
        navisReportedSize: null,
      }));
      return;
    }

    const sizeMismatch = record.size !== current.size;

    updateContainer(containerId, (container) => ({
      ...container,
      number: record.containerNumber,
      navisDocument: record.navisDocument,
      port: record.port,
      entryDateTime: record.entryDateTime,
      cargoType: record.cargoType,
      navisSynced: !sizeMismatch,
      navisReportedSize: sizeMismatch ? record.size : null,
      navis: {
        plugged: record.plugged,
        sealVerified: record.sealVerified,
        opened: record.opened,
        verification: record.verification,
      },
    }));
  }

  function excludeAutomatic() {
    if (!autoRemoval || !autoRemovalReason.trim()) return;
    updateContainer(autoRemoval.containerId, (container) => ({
      ...container,
      excludedAutomatic: [
        ...container.excludedAutomatic.filter(
          (item) => item.serviceId !== autoRemoval.serviceId
        ),
        {
          serviceId: autoRemoval.serviceId,
          reason: autoRemovalReason.trim(),
        },
      ],
    }));
    setAutoRemoval(null);
    setAutoRemovalReason("");
  }

  const operationClass =
    direction === "IMPORT"
      ? styles.operationImport
      : styles.operationExport;

  return (
    <>
      <section className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.overline}>CÁLCULO DE TASAS</span>
            <h1>Nuevo cálculo</h1>
            <p>
              Operación, contenedores, servicios, validaciones y cierre
              en un único flujo.
            </p>
          </div>

          <div className={styles.headerStatus}>
            <span className={styles.draftBadge}>Borrador</span>
            <span
              className={`${styles.operationBadge} ${
                direction === "IMPORT"
                  ? styles.operationBadgeImport
                  : styles.operationBadgeExport
              }`}
            >
              {operationLabel(direction)}
            </span>
          </div>
        </header>

        <section
          className={`${styles.panel} ${styles.operationPanel} ${operationClass}`}
        >
          <SectionTitle
            index="01"
            eyebrow="OPERACIÓN"
            title="Datos principales"
            description="Cliente, referencia, segmento, fecha y tarifa."
            aside={
              <div className={styles.operationAside}>
                <i
                  className={
                    direction === "IMPORT"
                      ? styles.importDot
                      : styles.exportDot
                  }
                />
                <strong>{operationLabel(direction)}</strong>
                <span>{segmentNames[segmentCode]}</span>
              </div>
            }
          />

          <div className={styles.formGrid}>
            <label className={styles.span2}>
              <span>Cliente</span>
              <select
                value={clientId}
                onChange={(event) => updateClient(event.target.value)}
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.code} - {client.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>N.º de despacho</span>
              <input
                value={dispatchNumber}
                onChange={(event) =>
                  setDispatchNumber(event.target.value)
                }
              />
            </label>

            <label>
              <span>Segmento / operación</span>
              <select
                value={segmentCode}
                onChange={(event) =>
                  updateSegment(event.target.value)
                }
              >
                {(availableSegments.length
                  ? availableSegments.map((item) => [
                      item.segmentCode,
                      item.segmentName,
                    ])
                  : Object.entries(segmentNames)
                ).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Tipo de tarifa</span>
              <select
                value={tariffType}
                onChange={(event) =>
                  setTariffType(event.target.value as TariffType)
                }
              >
                <option value="STANDARD">Estándar</option>
                <option value="CORPORATE">Corporativa</option>
                <option value="GROUP">De grupo</option>
              </select>
              <small>
                Recomendada: {formatTariffType(recommendedTariffType)}
              </small>
            </label>

            <div className={styles.dateType}>
              <span>Tipo de fecha</span>
              <div>
                <button
                  type="button"
                  className={
                    dateMode === "EMISSION" ? styles.activeToggle : ""
                  }
                  onClick={() => setDateMode("EMISSION")}
                >
                  Emisión
                </button>
                <button
                  type="button"
                  className={
                    dateMode === "FUTURE" ? styles.activeToggle : ""
                  }
                  onClick={() => setDateMode("FUTURE")}
                >
                  Cálculo futuro
                </button>
              </div>
            </div>

            <label>
              <span>Fecha de emisión</span>
              <input
                type="date"
                value={emissionDate}
                onChange={(event) =>
                  setEmissionDate(event.target.value)
                }
              />
            </label>

            {dateMode === "FUTURE" && (
              <label>
                <span>Fecha de retiro / facturación</span>
                <input
                  type="date"
                  value={futureDate}
                  onChange={(event) =>
                    setFutureDate(event.target.value)
                  }
                />
              </label>
            )}
          </div>

          {selectedClient && clientCommercial && (
            <div className={styles.clientStrip}>
              <Info label="RUC" value={selectedClient.ruc} />
              <Info label="Localidad" value={selectedClient.city} />
              <Info
                label="Crédito"
                value={`${clientCommercial.creditDays} días · ${
                  clientCommercial.creditAppliedTo === "BROKER"
                    ? "Despachante"
                    : "Cliente"
                }`}
              />
              <Info
                label="Grupo económico"
                value={clientCommercial.economicGroup ?? "—"}
              />
              <Info
                label="Acuerdo agencia"
                value={clientCommercial.brokerAgreement ?? "—"}
              />
              <Info
                label="Condición vigente"
                value={formatDate(
                  clientCommercial.quotationValidUntil
                )}
              />
            </div>
          )}

          {selectedTariff ? (
            <div className={styles.successNotice}>
              <i />
              <div>
                <strong>{selectedTariff.name}</strong>
                <span>
                  Vigente hasta {formatDate(selectedTariff.validUntil)} ·{" "}
                  {eligibleTariffLines.length} valores disponibles
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.warningNotice}>
              <b>!</b>
              <div>
                <strong>Tarifa no configurada</strong>
                <span>
                  Revise cliente, segmento y tipo antes de confirmar.
                </span>
              </div>
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <SectionTitle
            index="02"
            eyebrow="VALOR COMERCIAL"
            title={direction === "IMPORT" ? "Base CIF" : "Base FOB"}
            description="Conversión automática a guaraníes con cotización Waldbott."
            aside={
              <div className={styles.exchangeCard}>
                <span>Cotización USD / Gs.</span>
                <strong>{exchangeRate.toLocaleString("es-PY")}</strong>
                <small>
                  {demoData.exchangeRate.source} ·{" "}
                  {formatDateTime(demoData.exchangeRate.updatedAt)}
                </small>
              </div>
            }
          />

          {direction === "IMPORT" ? (
            <div className={styles.valueGrid}>
              <NumberField
                label="Valor factura USD"
                value={invoiceValue}
                onChange={setInvoiceValue}
              />
              <NumberField
                label="Flete USD"
                value={freightValue}
                onChange={setFreightValue}
              />
              <NumberField
                label="Seguro USD"
                value={insuranceValue}
                onChange={setInsuranceValue}
              />
              <Result
                label="CIF USD"
                value={formatMoney(commercialBaseUSD, "USD")}
                hint="Calculado automáticamente"
              />
              <Result
                label="CIF Gs."
                value={formatMoney(commercialBasePYG, "PYG")}
                hint={`Cotización ${exchangeRate.toLocaleString("es-PY")}`}
              />
            </div>
          ) : (
            <div className={styles.valueGridExport}>
              <NumberField
                label="Valor FOB USD"
                value={fobValue}
                onChange={setFobValue}
              />
              <Result
                label="FOB USD"
                value={formatMoney(commercialBaseUSD, "USD")}
                hint="Base de exportación"
              />
              <Result
                label="FOB Gs."
                value={formatMoney(commercialBasePYG, "PYG")}
                hint={`Cotización ${exchangeRate.toLocaleString("es-PY")}`}
              />
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <SectionTitle
            index="03"
            eyebrow="CONTENEDORES"
            title="Declaración y carga"
            description="20' y 40' se gestionan como líneas independientes."
            aside={<VisualLegend />}
          />

          <div className={styles.declaredGrid}>
            <DeclaredCard
              size="20"
              declared={declared20}
              loaded={loaded20}
              onChange={setDeclared20}
            />
            <DeclaredCard
              size="40"
              declared={declared40}
              loaded={loaded40}
              onChange={setDeclared40}
            />
            <div className={styles.addButtons}>
              <button
                type="button"
                className={styles.add20}
                onClick={() => addContainer("20")}
              >
                + Agregar 20&apos;
              </button>
              <button
                type="button"
                className={styles.add40}
                onClick={() => addContainer("40")}
              >
                + Agregar 40&apos;
              </button>
            </div>
          </div>

          <div className={styles.containerStack}>
            {perContainer.map((entry, index) => {
              const { container, services: applied, suggestions, overstay } =
                entry;
              const expanded = expandedIds.includes(container.id);
              const hiddenExonerated = applied.filter(
                (item) => item.exonerated
              ).length;
              const visible = applied.filter(
                (item) =>
                  !item.exonerated || showExonerated[container.id]
              );
              const subtotal = applied
                .filter((item) => !item.exonerated)
                .reduce((sum, item) => sum + item.total, 0);

              return (
                <article
                  key={container.id}
                  className={`${styles.containerCard} ${
                    container.size === "20"
                      ? styles.container20
                      : styles.container40
                  }`}
                >
                  <div
                    className={`${styles.operationStripe} ${
                      direction === "IMPORT"
                        ? styles.stripeImport
                        : styles.stripeExport
                    }`}
                  />

                  <header className={styles.containerHeader}>
                    <button
                      type="button"
                      className={styles.containerMainButton}
                      onClick={() =>
                        setExpandedIds((current) =>
                          current.includes(container.id)
                            ? current.filter(
                                (id) => id !== container.id
                              )
                            : [...current, container.id]
                        )
                      }
                    >
                      <span
                        className={`${styles.sizeBadge} ${
                          container.size === "20"
                            ? styles.size20
                            : styles.size40
                        }`}
                      >
                        {container.size}&apos;
                      </span>

                      <div className={styles.containerIdentity}>
                        <div>
                          <span
                            className={
                              direction === "IMPORT"
                                ? styles.directionImport
                                : styles.directionExport
                            }
                          >
                            {operationLabel(direction)}
                          </span>
                          <small>Contenedor {index + 1}</small>
                        </div>
                        <strong>
                          {container.number ||
                            `Nuevo contenedor ${container.size}'`}
                        </strong>
                        <small>
                          {formatCargoType(container.cargoType)} ·{" "}
                          {container.navisSynced
                            ? "NAVIS sincronizado"
                            : "Datos pendientes"}
                        </small>
                      </div>

                      <div className={styles.quickTotal}>
                        <span>
                          {
                            applied.filter(
                              (service) => !service.exonerated
                            ).length
                          }{" "}
                          servicios
                        </span>
                        <strong>
                          {formatMoney(
                            subtotal + (overstay?.total ?? 0),
                            "USD"
                          )}
                        </strong>
                      </div>

                      <span
                        className={`${styles.chevron} ${
                          expanded ? styles.chevronOpen : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => removeContainer(container.id)}
                    >
                      ×
                    </button>
                  </header>

                  {expanded && (
                    <div className={styles.containerBody}>
                      <div className={styles.subsection}>
                        <SubsectionHeader
                          eyebrow="DATOS DEL CONTENEDOR"
                          title="Información operativa y NAVIS"
                          action={
                            <button
                              type="button"
                              className={styles.outlineButton}
                              onClick={() => syncNavis(container.id)}
                            >
                              Sincronizar NAVIS
                            </button>
                          }
                        />

                        <div className={styles.containerFields}>
                          <TextField
                            label="Número de contenedor"
                            value={container.number}
                            onChange={(value) =>
                              updateContainer(
                                container.id,
                                (current) => ({
                                  ...current,
                                  number: value.toUpperCase(),
                                  navisSynced: false,
                                  navisReportedSize: null,
                                })
                              )
                            }
                          />
                          <TextField
                            label="Documento NAVIS"
                            value={container.navisDocument}
                            onChange={(value) =>
                              updateContainer(
                                container.id,
                                (current) => ({
                                  ...current,
                                  navisDocument: value.toUpperCase(),
                                  navisSynced: false,
                                  navisReportedSize: null,
                                })
                              )
                            }
                          />

                          <label>
                            <span>Puerto</span>
                            <select
                              value={container.port}
                              onChange={(event) =>
                                updateContainer(
                                  container.id,
                                  (current) => ({
                                    ...current,
                                    port: event.target.value,
                                  })
                                )
                              }
                            >
                              {demoData.ports.map((port) => (
                                <option
                                  key={port.code}
                                  value={port.code}
                                >
                                  {port.code} - {port.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            <span>Tamaño</span>
                            <input
                              value={`${container.size}' · Fijo`}
                              readOnly
                              aria-readonly="true"
                              title="El tamaño queda definido al agregar el contenedor. Para cambiarlo, elimine este contenedor y agregue uno del otro tamaño."
                            />
                          </label>

                          <label>
                            <span>Fecha/hora de ingreso</span>
                            <input
                              type="datetime-local"
                              value={container.entryDateTime}
                              onChange={(event) =>
                                updateContainer(
                                  container.id,
                                  (current) => ({
                                    ...current,
                                    entryDateTime: event.target.value,
                                  })
                                )
                              }
                            />
                          </label>

                          <label>
                            <span>Tipo de carga</span>
                            <select
                              value={container.cargoType}
                              onChange={(event) =>
                                updateContainer(
                                  container.id,
                                  (current) => ({
                                    ...current,
                                    cargoType: event.target
                                      .value as CargoType,
                                  })
                                )
                              }
                            >
                              <option value="DRY">Seca</option>
                              <option value="REEFER">
                                Refrigerada
                              </option>
                            </select>
                          </label>
                        </div>

                        {container.navisReportedSize &&
                          container.navisReportedSize !== container.size && (
                            <div className={styles.warningNotice}>
                              <b>!</b>
                              <div>
                                <strong>Inconsistencia de tamaño con NAVIS</strong>
                                <span>
                                  Este contenedor fue creado como{" "}
                                  {container.size}&apos;, pero NAVIS informa{" "}
                                  {container.navisReportedSize}&apos;. El tamaño
                                  del card permanece fijo. Verifique el número de
                                  contenedor o el documento NAVIS antes de
                                  continuar.
                                </span>
                              </div>
                            </div>
                          )}

                        <NavisPanel container={container} />
                      </div>

                      <div className={styles.subsection}>
                        <SubsectionHeader
                          eyebrow="SERVICIOS APLICABLES"
                          title="Tarifa + matriz + reglas automáticas"
                          action={
                            <div className={styles.serviceActions}>
                              {hiddenExonerated > 0 && (
                                <button
                                  type="button"
                                  className={styles.outlineButton}
                                  onClick={() =>
                                    setShowExonerated((current) => ({
                                      ...current,
                                      [container.id]:
                                        !current[container.id],
                                    }))
                                  }
                                >
                                  {showExonerated[container.id]
                                    ? "Ocultar"
                                    : "Mostrar"}{" "}
                                  exonerados ({hiddenExonerated})
                                </button>
                              )}

                              {container.excludedServiceIds.length >
                                0 && (
                                <select
                                  className={styles.restoreSelect}
                                  defaultValue=""
                                  onChange={(event) => {
                                    if (!event.target.value) return;
                                    updateContainer(
                                      container.id,
                                      (current) => ({
                                        ...current,
                                        excludedServiceIds:
                                          current.excludedServiceIds.filter(
                                            (id) =>
                                              id !== event.target.value
                                          ),
                                      })
                                    );
                                    event.target.value = "";
                                  }}
                                >
                                  <option value="">
                                    + Agregar servicio
                                  </option>
                                  {container.excludedServiceIds.map(
                                    (serviceId) => (
                                      <option
                                        key={serviceId}
                                        value={serviceId}
                                      >
                                        {getService(serviceId)?.name ??
                                          serviceId}
                                      </option>
                                    )
                                  )}
                                </select>
                              )}
                            </div>
                          }
                        />

                        <div className={styles.serviceTable}>
                          <div className={styles.serviceHead}>
                            <span>Servicio</span>
                            <span>Origen</span>
                            <span>Cálculo</span>
                            <span>Cant.</span>
                            <span>Precio</span>
                            <span>Total</span>
                            <span />
                          </div>

                          {visible.map((item) => (
                            <div
                              key={`${container.id}-${item.service.id}-${item.origin}`}
                              className={`${styles.serviceRow} ${
                                item.exonerated
                                  ? styles.exoneratedRow
                                  : ""
                              }`}
                            >
                              <div>
                                <strong>{item.service.name}</strong>
                                <span>
                                  {item.articleCode} ·{" "}
                                  {item.service.code}
                                </span>
                                {item.minimumApplied !== null && (
                                  <small>
                                    Mínimo aplicado:{" "}
                                    {formatMoney(
                                      item.minimumApplied,
                                      "USD"
                                    )}
                                  </small>
                                )}
                              </div>

                              <span
                                className={`${styles.originBadge} ${
                                  item.origin === "AUTOMATIC"
                                    ? styles.originAuto
                                    : styles.originTariff
                                }`}
                              >
                                {item.origin === "AUTOMATIC"
                                  ? "Automático"
                                  : "Tarifa"}
                              </span>

                              <span>
                                {formatCalculation(
                                  item.service.calculationType
                                )}
                              </span>

                              <span>
                                {item.service.storageUnit === "NONE"
                                  ? item.quantity
                                  : `${item.quantity} ${
                                      item.service.storageUnit === "M3"
                                        ? "m³"
                                        : "m²"
                                    }`}
                              </span>

                              <span>
                                {item.exonerated
                                  ? "Exonerado"
                                  : formatMoney(
                                      item.unitPrice,
                                      "USD"
                                    )}
                              </span>

                              <strong>
                                {item.exonerated
                                  ? formatMoney(0, "USD")
                                  : formatMoney(item.total, "USD")}
                              </strong>

                              <div className={styles.rowAction}>
                                {item.origin === "AUTOMATIC" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAutoRemoval({
                                        containerId: container.id,
                                        serviceId: item.service.id,
                                      });
                                      setAutoRemovalReason("");
                                    }}
                                  >
                                    Excluir
                                  </button>
                                ) : !item.exonerated ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateContainer(
                                        container.id,
                                        (current) => ({
                                          ...current,
                                          excludedServiceIds: [
                                            ...current.excludedServiceIds,
                                            item.service.id,
                                          ],
                                        })
                                      )
                                    }
                                  >
                                    Quitar
                                  </button>
                                ) : (
                                  <span>—</span>
                                )}
                              </div>

                              {item.origin === "AUTOMATIC" && (
                                <div className={styles.autoReason}>
                                  <b>Aplicado automáticamente</b>
                                  <span>{item.reason}</span>
                                </div>
                              )}
                            </div>
                          ))}

                          {!visible.length && (
                            <div className={styles.emptyState}>
                              No hay servicios visibles para esta
                              combinación.
                            </div>
                          )}
                        </div>

                        {suggestions.some(
                          (suggestion) => !suggestion.applicable
                        ) && (
                          <div className={styles.suggestionBox}>
                            <strong>
                              Validaciones automáticas pendientes
                            </strong>
                            {suggestions
                              .filter(
                                (suggestion) => !suggestion.applicable
                              )
                              .map((suggestion) => (
                                <div key={suggestion.rule.id}>
                                  <b>!</b>
                                  <span>
                                    <strong>
                                      {suggestion.service?.name ??
                                        suggestion.rule.label}
                                    </strong>{" "}
                                    {suggestion.matrixAllows
                                      ? "corresponde por el tipo de carga, pero no posee valor en la tarifa."
                                      : "fue sugerido por NAVIS/tipo de carga, pero no está habilitado en la matriz corporativa."}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}

                        {eligibleTariffLines.some((line) => {
                          const service = getService(line.serviceId);
                          return (
                            service !== null &&
                            service.storageUnit !== "NONE" &&
                            service.containerSizes.includes(container.size)
                          );
                        }) && (
                          <div className={styles.storageBox}>
                            <NumberField
                              label="Cantidad de almacenaje"
                              value={container.storageQuantity}
                              onChange={(value) =>
                                updateContainer(
                                  container.id,
                                  (current) => ({
                                    ...current,
                                    storageQuantity: Math.max(0, value),
                                  })
                                )
                              }
                            />
                            <span>
                              La unidad m²/m³ proviene del servicio
                              maestro; aquí solo se informa la cantidad
                              de esta operación.
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={styles.subsection}>
                        <SubsectionHeader
                          eyebrow="SOBREESTADÍA"
                          title="Cálculo separado por tipo de sobreestadía"
                          action={
                            <span className={styles.transportBadge}>
                              Terminal ≠ Transporte
                            </span>
                          }
                        />

                        <div className={styles.overstayTypes}>
                          <div className={styles.overstayTypeCard}>
                            <div className={styles.overstayTypeHeader}>
                              <div>
                                <span>TERMINAL</span>
                                <strong>Sobreestadía Terminal</strong>
                              </div>
                              <span className={styles.overstaySizeBadge}>
                                {container.size}&apos;
                              </span>
                            </div>

                            {overstay ? (
                              <div className={styles.overstayGrid}>
                                <Info
                                  label="Fecha emisión"
                                  value={formatDate(emissionDate)}
                                />
                                <Info
                                  label="Fecha retiro / facturación"
                                  value={formatDate(calculationDate)}
                                />
                                <Info
                                  label="Días transcurridos"
                                  value={String(overstay.elapsedDays)}
                                />
                                <Info
                                  label="Días libres"
                                  value={`${overstay.freeDays} días`}
                                />
                                <Info
                                  label="Días facturables"
                                  value={String(overstay.billableDays)}
                                />
                                <Info
                                  label="Tarifa aplicable"
                                  value={
                                    overstay.configured
                                      ? `${formatMoney(
                                          overstay.rate,
                                          "USD"
                                        )} / día`
                                      : "Sin valor configurado"
                                  }
                                />
                                <Info
                                  label="Total terminal"
                                  value={
                                    overstay.configured
                                      ? formatMoney(
                                          overstay.total,
                                          "USD"
                                        )
                                      : "No calculado"
                                  }
                                  accent
                                />
                              </div>
                            ) : (
                              <div className={styles.emptyState}>
                                No existe una tarifa de sobreestadía de
                                terminal compatible con este tamaño y
                                segmento.
                              </div>
                            )}
                          </div>

                          <div
                            className={`${styles.overstayTypeCard} ${styles.overstayTransportCard}`}
                          >
                            <div className={styles.overstayTypeHeader}>
                              <div>
                                <span>TRANSPORTE</span>
                                <strong>Sobreestadía Transporte</strong>
                              </div>
                              <span className={styles.notApplicableBadge}>
                                No aplica
                              </span>
                            </div>

                            <div className={styles.transportNotApplicable}>
                              <strong>No se suma al cálculo</strong>
                              <span>
                                En esta configuración no existe una tarifa
                                de sobreestadía de transporte aplicable.
                                Terminal y Transporte permanecen como
                                conceptos independientes.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <footer className={styles.containerFooter}>
                        <Info
                          label="Subtotal servicios"
                          value={formatMoney(subtotal, "USD")}
                        />
                        <Info
                          label="Sobreestadía terminal"
                          value={formatMoney(
                            overstay?.total ?? 0,
                            "USD"
                          )}
                        />
                        <Info
                          label="Sobreestadía transporte"
                          value="No aplica"
                        />
                        <Info
                          label="Total contenedor"
                          value={formatMoney(
                            subtotal + (overstay?.total ?? 0),
                            "USD"
                          )}
                          accent
                        />
                      </footer>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.panel}>
          <SectionTitle
            index="04"
            eyebrow="CONDICIONES COMERCIALES"
            title="Crédito y excepción operativa"
            description="La condición maestra es de consulta; cualquier excepción exige segunda validación."
          />

          {clientCommercial && (
            <div className={styles.creditArea}>
              <div className={styles.creditMaster}>
                <span>Condición acordada</span>
                <strong>
                  {clientCommercial.creditDays} días ·{" "}
                  {clientCommercial.creditAppliedTo === "BROKER"
                    ? "Despachante"
                    : "Cliente"}
                </strong>
                <small>Datos comerciales de solo lectura</small>
              </div>

              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={creditExceptionEnabled}
                  onChange={(event) => {
                    setCreditExceptionEnabled(event.target.checked);
                    setCreditExceptionValidated(false);
                    if (!event.target.checked) {
                      setOperationCreditDays(
                        clientCommercial.creditDays
                      );
                      setOperationCreditAppliedTo(
                        clientCommercial.creditAppliedTo
                      );
                    }
                  }}
                />
                <span>
                  Aplicar excepción solo para este cálculo
                </span>
              </label>

              {creditExceptionEnabled && (
                <div className={styles.creditException}>
                  <NumberField
                    label="Días de crédito"
                    value={operationCreditDays}
                    onChange={(value) => {
                      setOperationCreditDays(value);
                      setCreditExceptionValidated(false);
                    }}
                  />

                  <label>
                    <span>Crédito aplicado a</span>
                    <select
                      value={operationCreditAppliedTo}
                      onChange={(event) => {
                        setOperationCreditAppliedTo(
                          event.target.value as CreditAppliedTo
                        );
                        setCreditExceptionValidated(false);
                      }}
                    >
                      <option value="CLIENT">Cliente</option>
                      <option value="BROKER">Despachante</option>
                    </select>
                  </label>

                  <div
                    className={`${styles.exceptionState} ${
                      creditExceptionValidated
                        ? styles.exceptionOk
                        : ""
                    }`}
                  >
                    <b>{creditExceptionValidated ? "✓" : "!"}</b>
                    <div>
                      <strong>
                        {creditExceptionValidated
                          ? "Excepción validada"
                          : "Requiere segunda validación"}
                      </strong>
                      <span>
                        No modifica la condición maestra del cliente.
                      </span>
                    </div>
                  </div>

                  {!creditExceptionValidated && creditChanged && (
                    <button
                      type="button"
                      className={styles.outlineButton}
                      onClick={() =>
                        setCreditValidationOpen(true)
                      }
                    >
                      Validar excepción
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <section className={styles.summaryGrid}>
          <article className={styles.validationPanel}>
            <SectionTitleCompact
              eyebrow="VALIDACIÓN DEL CÁLCULO"
              title="Control previo al pedido"
              aside={
                <div className={styles.validationCounts}>
                  <span>{blockingCount} bloqueantes</span>
                  <span>{warningCount} advertencias</span>
                </div>
              }
            />

            <div className={styles.validationList}>
              {validations.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.validationItem} ${
                    item.level === "BLOCKING"
                      ? styles.blocking
                      : item.level === "WARNING"
                        ? styles.warning
                        : styles.info
                  }`}
                >
                  <b>
                    {item.level === "BLOCKING"
                      ? "×"
                      : item.level === "WARNING"
                        ? "!"
                        : "✓"}
                  </b>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.totalPanel}>
            <span className={styles.overline}>
              RESUMEN DEL CÁLCULO
            </span>
            <h2>Total de la operación</h2>

            <div className={styles.summaryStats}>
              <Info label="Contenedores 20'" value={String(loaded20)} />
              <Info label="Contenedores 40'" value={String(loaded40)} />
              <Info
                label="Servicios exonerados"
                value={String(exoneratedCount)}
              />
              <Info
                label="Automáticos"
                value={String(automaticCount)}
              />
            </div>

            <div className={styles.totalLines}>
              <Info
                label="Subtotal servicios"
                value={formatMoney(serviceSubtotal, "USD")}
              />
              <Info
                label="Sobreestadía terminal"
                value={formatMoney(overstayTotal, "USD")}
              />
              <Info
                label="Sobreestadía transporte"
                value="No aplica"
              />
              <Info
                label="TOTAL USD"
                value={formatMoney(totalUSD, "USD")}
                accent
              />
              <Info
                label="TOTAL Gs."
                value={formatMoney(totalPYG, "PYG")}
              />
              <Info
                label="Cotización"
                value={exchangeRate.toLocaleString("es-PY")}
              />
            </div>
          </article>
        </section>

        <section className={styles.panel}>
          <SectionTitle
            index="05"
            eyebrow="OBSERVACIÓN"
            title="Comentario adicional"
            description="Solo para comentarios no normativos; las reglas se aplican mediante parámetros estructurados."
          />
          <textarea
            className={styles.observation}
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            placeholder="Comentario opcional para la operación..."
          />
        </section>

        <section className={styles.actionsPanel}>
          <div>
            <strong>
              {blockingCount === 0
                ? "Cálculo listo para confirmar."
                : `${blockingCount} validación${
                    blockingCount === 1 ? "" : "es"
                  } bloqueante${
                    blockingCount === 1 ? "" : "s"
                  } pendiente${
                    blockingCount === 1 ? "" : "s"
                  }.`}
            </strong>
            <span>
              La proforma es informativa y no tiene valor comercial.
            </span>
          </div>

          <div>
            <button
              type="button"
              className={styles.secondaryAction}
              disabled={
                !selectedClient ||
                !dispatchNumber.trim() ||
                !containers.length
              }
              onClick={() => {
                setProformaIssuedAt(new Date().toISOString());
                setProformaOpen(true);
              }}
            >
              Generar proforma
            </button>
            <button
              type="button"
              className={styles.primaryAction}
              disabled={blockingCount > 0}
              onClick={() => {
                setOrderOpen(true);
                setOrderCreated(false);
              }}
            >
              Confirmar y generar pedido
            </button>
          </div>
        </section>
      </section>

      {autoRemoval && (
        <Modal
          eyebrow="SERVICIO AUTOMÁTICO"
          title="Justificar exclusión"
          description="Los servicios aplicados por regla/NAVIS requieren motivo para ser excluidos."
          onClose={() => setAutoRemoval(null)}
          footer={
            <>
              <button
                className={styles.secondaryAction}
                onClick={() => setAutoRemoval(null)}
              >
                Cancelar
              </button>
              <button
                className={styles.dangerAction}
                disabled={!autoRemovalReason.trim()}
                onClick={excludeAutomatic}
              >
                Excluir servicio
              </button>
            </>
          }
        >
          <label className={styles.modalField}>
            <span>Motivo de exclusión</span>
            <textarea
              value={autoRemovalReason}
              onChange={(event) =>
                setAutoRemovalReason(event.target.value)
              }
              placeholder="Explique por qué no corresponde este adicional..."
            />
          </label>
        </Modal>
      )}

      {creditValidationOpen && clientCommercial && (
        <Modal
          eyebrow="DOBLE VALIDACIÓN"
          title="Confirmar excepción comercial"
          description="La condición del cálculo difiere del acuerdo parametrizado."
          onClose={() => setCreditValidationOpen(false)}
          footer={
            <>
              <button
                className={styles.secondaryAction}
                onClick={() => setCreditValidationOpen(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.primaryAction}
                disabled={!creditValidationReason.trim()}
                onClick={() => {
                  setCreditExceptionValidated(true);
                  setCreditValidationOpen(false);
                }}
              >
                Confirmar segunda validación
              </button>
            </>
          }
        >
          <div className={styles.comparison}>
            <Info
              label="Acuerdo maestro"
              value={`${clientCommercial.creditDays} días · ${
                clientCommercial.creditAppliedTo === "BROKER"
                  ? "Despachante"
                  : "Cliente"
              }`}
            />
            <Info
              label="Este cálculo"
              value={`${operationCreditDays} días · ${
                operationCreditAppliedTo === "BROKER"
                  ? "Despachante"
                  : "Cliente"
              }`}
            />
          </div>

          <label className={styles.modalField}>
            <span>Justificación</span>
            <textarea
              value={creditValidationReason}
              onChange={(event) =>
                setCreditValidationReason(event.target.value)
              }
              placeholder="Indique el motivo..."
            />
          </label>
        </Modal>
      )}

      {proformaOpen && selectedClient && (
        <div className={styles.modalBackdrop}>
          <div className={styles.proformaModal}>
            <header className={styles.proformaHeader}>
              <div>
                <span>TERPORT S.A.</span>
                <h2>Proforma de Cálculo de Tasas</h2>
                <p>Sujeta a modificaciones, sin valor comercial</p>
              </div>
              <button onClick={() => setProformaOpen(false)}>×</button>
            </header>

            <div className={styles.proformaBody}>
              <div className={styles.proformaMeta}>
                <Info label="Cliente" value={selectedClient.name} />
                <Info label="RUC" value={selectedClient.ruc} />
                <Info label="Despacho" value={dispatchNumber} />
                <Info
                  label="Segmento"
                  value={segmentNames[segmentCode]}
                />
                <Info
                  label="Tarifa"
                  value={formatTariffType(tariffType)}
                />
                <Info
                  label="Fecha"
                  value={formatDate(calculationDate)}
                />
                <Info
                  label={direction === "IMPORT" ? "CIF USD" : "FOB USD"}
                  value={formatMoney(commercialBaseUSD, "USD")}
                />
                <Info
                  label="Contenedores"
                  value={`${loaded20} × 20' · ${loaded40} × 40'`}
                />
              </div>

              <div className={styles.proformaContainers}>
                {perContainer.map((entry) => (
                  <article key={entry.container.id}>
                    <header>
                      <strong>
                        {entry.container.number || "Sin número"}
                      </strong>
                      <span>
                        {entry.container.size}&apos; ·{" "}
                        {formatCargoType(entry.container.cargoType)}
                      </span>
                    </header>
                    {entry.services
                      .filter((service) => !service.exonerated)
                      .map((service) => (
                        <div
                          key={`${entry.container.id}-${service.service.id}`}
                        >
                          <span>{service.service.name}</span>
                          <strong>
                            {formatMoney(service.total, "USD")}
                          </strong>
                        </div>
                      ))}
                    {entry.overstay?.configured &&
                      entry.overstay.total > 0 && (
                        <div>
                          <span>
                            {entry.overstay.service.name} ·{" "}
                            {entry.overstay.billableDays} días
                          </span>
                          <strong>
                            {formatMoney(
                              entry.overstay.total,
                              "USD"
                            )}
                          </strong>
                        </div>
                      )}
                  </article>
                ))}
              </div>

              <div className={styles.proformaTotals}>
                <Info
                  label="Total USD"
                  value={formatMoney(totalUSD, "USD")}
                  accent
                />
                <Info
                  label="Total Gs."
                  value={formatMoney(totalPYG, "PYG")}
                  accent
                />
              </div>

              <div className={styles.proformaFoot}>
                <span>Usuario: {demoData.currentUser.name}</span>
                <span>
                  Emisión:{" "}
                  {proformaIssuedAt
                    ? formatDateTime(proformaIssuedAt)
                    : "—"}
                </span>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                className={styles.primaryAction}
                onClick={() => setProformaOpen(false)}
              >
                Cerrar proforma
              </button>
            </footer>
          </div>
        </div>
      )}

      {orderOpen && selectedClient && (
        <Modal
          eyebrow={orderCreated ? "PEDIDO GENERADO" : "CONFIRMAR PEDIDO"}
          title={
            orderCreated
              ? demoData.nextOrderNumber
              : "Enviar cálculo a Waldbott"
          }
          description={
            orderCreated
              ? `Referencia: ${demoData.nextOrderNumber} / ${dispatchNumber}`
              : "Se generará una numeración interna independiente del despacho."
          }
          onClose={() => setOrderOpen(false)}
          footer={
            orderCreated ? (
              <button
                className={styles.primaryAction}
                onClick={() => setOrderOpen(false)}
              >
                Finalizar
              </button>
            ) : (
              <>
                <button
                  className={styles.secondaryAction}
                  onClick={() => setOrderOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className={styles.primaryAction}
                  onClick={() => setOrderCreated(true)}
                >
                  Confirmar pedido
                </button>
              </>
            )
          }
        >
          {orderCreated ? (
            <div className={styles.orderSuccess}>
              <span>✓</span>
              <strong>Pedido creado en estado Pendiente</strong>
              <p>
                En producción se actualizará automáticamente cuando
                Waldbott informe factura o anulación.
              </p>
            </div>
          ) : (
            <div className={styles.orderPreview}>
              <Info
                label="Pedido interno"
                value={demoData.nextOrderNumber}
              />
              <Info label="Despacho" value={dispatchNumber} />
              <Info
                label="Referencia"
                value={`${demoData.nextOrderNumber} / ${dispatchNumber}`}
              />
              <Info label="Estado inicial" value="Pendiente" />
              <Info label="Cliente" value={selectedClient.name} />
              <Info
                label="Total"
                value={formatMoney(totalUSD, "USD")}
                accent
              />
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

function SectionTitle({
  index,
  eyebrow,
  title,
  description,
  aside,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <div className={styles.sectionTitle}>
      <div>
        <span className={styles.sectionIndex}>{index}</span>
        <div>
          <span className={styles.overline}>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {aside}
    </div>
  );
}

function SectionTitleCompact({
  eyebrow,
  title,
  aside,
}: {
  eyebrow: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className={styles.sectionTitleCompact}>
      <div>
        <span className={styles.overline}>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {aside}
    </div>
  );
}

function SubsectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.subsectionHeader}>
      <div>
        <span>{eyebrow}</span>
        <strong>{title}</strong>
      </div>
      {action}
    </div>
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
    <div
      className={`${styles.infoBox} ${
        accent ? styles.infoAccent : ""
      }`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) =>
          onChange(Math.max(0, Number(event.target.value)))
        }
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Result({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className={styles.resultBox}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function VisualLegend() {
  return (
    <div className={styles.visualLegend}>
      <span>
        <i className={styles.legendImport} />
        Importación
      </span>
      <span>
        <i className={styles.legendExport} />
        Exportación
      </span>
      <span>
        <i className={styles.legend20} />
        20&apos;
      </span>
      <span>
        <i className={styles.legend40} />
        40&apos;
      </span>
    </div>
  );
}

function DeclaredCard({
  size,
  declared,
  loaded,
  onChange,
}: {
  size: ContainerSize;
  declared: number;
  loaded: number;
  onChange: (value: number) => void;
}) {
  const complete = declared === loaded;

  return (
    <div
      className={`${styles.declaredCard} ${
        size === "20" ? styles.declared20 : styles.declared40
      }`}
    >
      <div>
        <span>Declarados {size}&apos;</span>
        <strong>{declared}</strong>
      </div>
      <input
        type="number"
        min="0"
        value={declared}
        onChange={(event) =>
          onChange(Math.max(0, Number(event.target.value)))
        }
      />
      <div className={styles.loadedIndicator}>
        <span>
          Cargados {loaded} / {declared}
        </span>
        <strong>{complete ? "✓" : "!"}</strong>
      </div>
    </div>
  );
}

function NavisPanel({
  container,
}: {
  container: ContainerDraft;
}) {
  const attrs = [
    {
      label: "Refrigerado",
      value: container.cargoType === "REEFER" ? "Sí" : "No",
      active: container.cargoType === "REEFER",
    },
    {
      label: "Enchufado",
      value: container.navis.plugged ? "Sí" : "No",
      active: container.navis.plugged,
    },
    {
      label: "Precinto",
      value: container.navis.sealVerified
        ? "Verificado"
        : "Pendiente",
      active: container.navis.sealVerified,
    },
    {
      label: "Apertura",
      value: container.navis.opened ? "Registrada" : "No",
      warning: container.navis.opened,
    },
    {
      label: "Verificación",
      value: container.navis.verification ? "Sí" : "No",
      active: container.navis.verification,
    },
  ];

  return (
    <div className={styles.navisPanel}>
      <div className={styles.navisPanelHead}>
        <div>
          <span>INFORMACIÓN NAVIS</span>
          <strong>
            {container.navisSynced
              ? "Datos operativos sincronizados"
              : "Sin confirmación NAVIS"}
          </strong>
        </div>
        <span
          className={
            container.navisSynced
              ? styles.syncedBadge
              : styles.pendingBadge
          }
        >
          {container.navisSynced ? "Sincronizado" : "Pendiente"}
        </span>
      </div>

      <div className={styles.navisAttrs}>
        {attrs.map((attr) => (
          <div
            key={attr.label}
            className={
              attr.warning
                ? styles.attrWarning
                : attr.active
                  ? styles.attrActive
                  : ""
            }
          >
            <span>{attr.label}</span>
            <strong>{attr.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Modal({
  eyebrow,
  title,
  description,
  children,
  footer,
  onClose,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <div>
            <span className={styles.overline}>{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button onClick={onClose}>×</button>
        </header>
        <div className={styles.modalBody}>{children}</div>
        <footer className={styles.modalFooter}>{footer}</footer>
      </div>
    </div>
  );
}