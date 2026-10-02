export const appointments = [
  {
    id: "AGE-000128",
    date: "20/09/2026",
    time: "09:00",
    client: "GLOBO IMPORT EXPORT S.A.",
    representative: "Salma Doldán",
    type: "Llamada",
    reason: "Seguimiento de cotización",
    nextAction: "Preparar presupuesto / proforma",
    status: "Completado",
  },
  {
    id: "AGE-000129",
    date: "20/09/2026",
    time: "10:30",
    client: "NUEVA AMERICANA S.A.",
    representative: "María López",
    type: "Visita",
    reason: "Negociación de tarifas",
    nextAction: "Solicitar descuento / condición especial",
    status: "Programado",
  },
  {
    id: "AGE-000130",
    date: "20/09/2026",
    time: "14:00",
    client: "LOGÍSTICA PARAGUAYA S.A.",
    representative: "Carlos Vera",
    type: "Llamada",
    reason: "Seguimiento comercial",
    nextAction: "Seguimiento de propuesta",
    status: "Pendiente",
  },
  {
    id: "AGE-000131",
    date: "22/09/2026",
    time: "11:00",
    client: "COMERCIAL DEL ESTE S.A.",
    representative: "María López",
    type: "Llamada",
    reason: "Recuperación de cliente",
    nextAction: "Agendar reunión",
    status: "Reagendado",
  },
];

export const contactReports = [
  {
    id: "REP-000184",
    date: "20/09/2026",
    client: "GLOBO IMPORT EXPORT S.A.",
    representative: "Salma Doldán",
    reason: "Seguimiento de cotización",
    opportunityStatus: "En negociación",
    nextAction: "Preparar presupuesto / proforma",
    commitmentDate: "23/09/2026",
    actionStatus: "Pendiente",
  },
  {
    id: "REP-000183",
    date: "19/09/2026",
    client: "NUEVA AMERICANA S.A.",
    representative: "María López",
    reason: "Negociación de tarifas",
    opportunityStatus: "Propuesta solicitada",
    nextAction: "Solicitar descuento / condición especial",
    commitmentDate: "21/09/2026",
    actionStatus: "En proceso",
  },
  {
    id: "REP-000182",
    date: "18/09/2026",
    client: "IMPORTADORA DEL SUR S.A.",
    representative: "Carlos Vera",
    reason: "Seguimiento",
    opportunityStatus: "En análisis",
    nextAction: "Agendar llamada",
    commitmentDate: "22/09/2026",
    actionStatus: "Reagendada",
  },
];

export const portfolio = [
  {
    client: "GLOBO IMPORT EXPORT S.A.",
    representative: "Salma Doldán",
    assignedFrom: "01/06/2026",
    previousRepresentative: "María López",
    lastContact: "20/09/2026",
    daysWithoutContact: 0,
    status: "Activo",
  },
  {
    client: "NUEVA AMERICANA S.A.",
    representative: "María López",
    assignedFrom: "15/05/2026",
    previousRepresentative: "—",
    lastContact: "19/09/2026",
    daysWithoutContact: 1,
    status: "Activo",
  },
  {
    client: "COMERCIAL DEL ESTE S.A.",
    representative: "Sin asignar",
    assignedFrom: "—",
    previousRepresentative: "Carlos Vera",
    lastContact: "05/06/2026",
    daysWithoutContact: 107,
    status: "Sin representante",
  },
];

export const commercialAlerts = [
  {
    id: "ALT-001",
    type: "Sin contacto",
    client: "COMERCIAL DEL ESTE S.A.",
    detail: "107 días sin contacto comercial registrado.",
    priority: "Alta",
    suggestedAction: "Agendar contacto",
  },
  {
    id: "ALT-002",
    type: "Tarifa por vencer",
    client: "IMPORTADORA DEL SUR S.A.",
    detail: "Tarifa corporativa vence en 8 días.",
    priority: "Media",
    suggestedAction: "Revisar negociación",
  },
  {
    id: "ALT-003",
    type: "Sin representante",
    client: "COMERCIAL DEL ESTE S.A.",
    detail: "Cliente activo sin representante asignado.",
    priority: "Alta",
    suggestedAction: "Asignar representante",
  },
];

export const commercialGroups = [
  {
    code: "GRP-001",
    name: "Grupo Globo",
    members: 4,
    representative: "Salma Doldán",
    tariffType: "De grupo",
    status: "Activo",
  },
  {
    code: "GRP-002",
    name: "Grupo LP",
    members: 3,
    representative: "Carlos Vera",
    tariffType: "De grupo",
    status: "Activo",
  },
];

export const brokers = [
  {
    code: "DES-001",
    name: "Despachante Central S.A.",
    ruc: "80012345-6",
    clients: 18,
    creditType: "Crédito vía despachante",
    creditDays: "30 días",
    status: "Activo",
  },
  {
    code: "DES-002",
    name: "Servicios Aduaneros PY",
    ruc: "80054321-9",
    clients: 11,
    creditType: "Crédito del cliente",
    creditDays: "15 días",
    status: "Activo",
  },
];

export const users = [
  {
    name: "Administrador TERPORT",
    profile: "Administrador",
    scope: "Global",
    team: "Administración",
    origin: "Sistema Tarifario",
    status: "Activo",
  },
  {
    name: "Salma Doldán",
    profile: "Representante",
    scope: "Equipo Comercial",
    team: "Ventas",
    origin: "Pendiente confirmar",
    status: "Activo",
  },
  {
    name: "Supervisor Comercial",
    profile: "Supervisor",
    scope: "Equipo Comercial",
    team: "Ventas",
    origin: "Sistema Tarifario",
    status: "Activo",
  },
  {
    name: "Director Comercial",
    profile: "Director",
    scope: "Global Comercial",
    team: "Dirección",
    origin: "Sistema Tarifario",
    status: "Activo",
  },
];

export const auditRows = [
  {
    date: "20/09/2026 08:14",
    user: "Administrador TERPORT",
    module: "Tarifas",
    action: "Modificación",
    reference: "TAR-2026-087",
    previousValue: "USD 140",
    newValue: "USD 145",
  },
  {
    date: "20/09/2026 07:55",
    user: "Salma Doldán",
    module: "CRM",
    action: "Alta",
    reference: "REP-000184",
    previousValue: "—",
    newValue: "Reporte creado",
  },
  {
    date: "19/09/2026 17:22",
    user: "Operador Tarifas",
    module: "Pedidos",
    action: "Anulación",
    reference: "PED-000126",
    previousValue: "Pendiente",
    newValue: "Anulado",
  },
];

export const integrations = [
  {
    name: "Waldbott",
    purpose: "Clientes, tipo de cambio, pedidos y estado de facturación",
    mode: "Sincronización incremental",
    lastSync: "20/09/2026 06:00",
    status: "Operativo",
    pending: "0",
  },
  {
    name: "NAVIS",
    purpose: "Atributos físicos y operativos de contenedores",
    mode: "Cruce / validación operativa",
    lastSync: "—",
    status: "Pendiente definición técnica",
    pending: "Definir interfaz",
  },
];
