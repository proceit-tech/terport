export const contactReports = [
  {
    id: "REP-000184",
    date: "20/09/2026",
    client: "GLOBO IMPORT EXPORT S.A.",
    representative: "Salma Doldán",
    reason: "Seguimiento de cotización",
    channel: "Llamada",
    result: "Interesado",
    status: "Completado",
  },
  {
    id: "REP-000183",
    date: "19/09/2026",
    client: "NUEVA AMERICANA S.A.",
    representative: "María López",
    reason: "Negociación de tarifas",
    channel: "Visita",
    result: "En negociación",
    status: "Completado",
  },
  {
    id: "REP-000182",
    date: "18/09/2026",
    client: "IMPORTADORA DEL SUR S.A.",
    representative: "Carlos Vera",
    reason: "Seguimiento",
    channel: "WhatsApp",
    result: "Reagendar",
    status: "Reagendado",
  },
  {
    id: "REP-000181",
    date: "18/09/2026",
    client: "LOGÍSTICA PARAGUAYA S.A.",
    representative: "Salma Doldán",
    reason: "Presentación comercial",
    channel: "Visita",
    result: "Proforma solicitada",
    status: "Completado",
  },
];

export const portfolioRows = [
  {
    client: "GLOBO IMPORT EXPORT S.A.",
    representative: "Salma Doldán",
    startDate: "01/06/2026",
    lastContact: "20/09/2026",
    daysWithoutContact: 0,
    state: "Activo",
  },
  {
    client: "NUEVA AMERICANA S.A.",
    representative: "María López",
    startDate: "15/05/2026",
    lastContact: "19/09/2026",
    daysWithoutContact: 1,
    state: "Activo",
  },
  {
    client: "COMERCIAL DEL ESTE S.A.",
    representative: "Sin asignar",
    startDate: "—",
    lastContact: "05/06/2026",
    daysWithoutContact: 107,
    state: "Sin representante",
  },
  {
    client: "LOGÍSTICA PARAGUAYA S.A.",
    representative: "Carlos Vera",
    startDate: "10/02/2026",
    lastContact: "10/07/2026",
    daysWithoutContact: 72,
    state: "Revisar",
  },
];

export const commercialAlerts = [
  {
    id: "ALT-001",
    type: "Sin contacto",
    client: "COMERCIAL DEL ESTE S.A.",
    detail: "107 días sin contacto comercial registrado.",
    priority: "Alta",
  },
  {
    id: "ALT-002",
    type: "Tarifa por vencer",
    client: "IMPORTADORA DEL SUR S.A.",
    detail: "Tarifa corporativa vence en 8 días.",
    priority: "Media",
  },
  {
    id: "ALT-003",
    type: "Sin representante",
    client: "COMERCIAL DEL ESTE S.A.",
    detail: "Cliente activo sin representante asignado.",
    priority: "Alta",
  },
  {
    id: "ALT-004",
    type: "Seguimiento",
    client: "LOGÍSTICA PARAGUAYA S.A.",
    detail: "Contacto pendiente de reagendamiento.",
    priority: "Media",
  },
];

export const integrations = [
  {
    name: "Waldbott",
    purpose: "Clientes, tipo de cambio, pedidos y estado de facturación",
    status: "Operativo",
    lastSync: "20/09/2026 06:00",
    mode: "Incremental",
  },
  {
    name: "NAVIS",
    purpose: "Atributos físicos y operativos de contenedores",
    status: "Pendiente definición",
    lastSync: "—",
    mode: "A definir",
  },
];
