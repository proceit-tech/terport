export type ContactHistoryItem = {
  id: string;
  date: string;
  time: string;
  client: string;
  representative: string;
  actionType: string;
  reason: string;
  result: string;
  nextAction: string;
  commitmentDate: string;
  actionStatus: "Pendiente" | "Completada" | "Reagendada";
  source: string;
};

export type PortfolioAssignment = {
  id: string;
  client: string;
  representative: string;
  startDate: string;
  endDate: string | null;
  previousRepresentative: string | null;
  reason: string;
  changedBy: string;
  changedAt: string;
  status: "Actual" | "Histórico";
};

export const contactHistory: ContactHistoryItem[] = [
  {
    id: "HIS-000341",
    date: "20/09/2026",
    time: "09:30",
    client: "GLOBO IMPORT EXPORT S.A.",
    representative: "Salma Doldán",
    actionType: "Llamada",
    reason: "Seguimiento de cotización",
    result: "En negociación",
    nextAction: "Preparar presupuesto / proforma",
    commitmentDate: "23/09/2026",
    actionStatus: "Pendiente",
    source: "Reporte de contacto",
  },
  {
    id: "HIS-000332",
    date: "15/09/2026",
    time: "11:10",
    client: "GLOBO IMPORT EXPORT S.A.",
    representative: "Salma Doldán",
    actionType: "Visita",
    reason: "Negociación de tarifas",
    result: "Propuesta solicitada",
    nextAction: "Solicitar descuento / condición especial",
    commitmentDate: "17/09/2026",
    actionStatus: "Completada",
    source: "Reporte de contacto",
  },
  {
    id: "HIS-000298",
    date: "02/09/2026",
    time: "15:20",
    client: "GLOBO IMPORT EXPORT S.A.",
    representative: "María López",
    actionType: "Llamada",
    reason: "Presentación comercial",
    result: "En análisis",
    nextAction: "Agendar reunión",
    commitmentDate: "05/09/2026",
    actionStatus: "Completada",
    source: "Agenda comercial",
  },
  {
    id: "HIS-000285",
    date: "28/08/2026",
    time: "10:00",
    client: "NUEVA AMERICANA S.A.",
    representative: "María López",
    actionType: "Reunión",
    reason: "Renovación de acuerdo",
    result: "En negociación",
    nextAction: "Enviar propuesta tarifaria",
    commitmentDate: "31/08/2026",
    actionStatus: "Completada",
    source: "Reporte de contacto",
  },
  {
    id: "HIS-000271",
    date: "20/08/2026",
    time: "08:45",
    client: "LOGÍSTICA PARAGUAYA S.A.",
    representative: "Carlos Vera",
    actionType: "WhatsApp",
    reason: "Seguimiento",
    result: "Sin respuesta",
    nextAction: "Agendar llamada",
    commitmentDate: "22/08/2026",
    actionStatus: "Reagendada",
    source: "Reporte de contacto",
  },
];

export const portfolioAssignments: PortfolioAssignment[] = [
  {
    id: "ASG-000081",
    client: "GLOBO IMPORT EXPORT S.A.",
    representative: "Salma Doldán",
    startDate: "01/09/2026",
    endDate: null,
    previousRepresentative: "María López",
    reason: "Redistribución de cartera",
    changedBy: "Supervisor Comercial",
    changedAt: "01/09/2026 08:10",
    status: "Actual",
  },
  {
    id: "ASG-000054",
    client: "GLOBO IMPORT EXPORT S.A.",
    representative: "María López",
    startDate: "15/05/2026",
    endDate: "31/08/2026",
    previousRepresentative: null,
    reason: "Asignación inicial",
    changedBy: "Administrador TERPORT",
    changedAt: "15/05/2026 09:00",
    status: "Histórico",
  },
  {
    id: "ASG-000076",
    client: "COMERCIAL DEL ESTE S.A.",
    representative: "Carlos Vera",
    startDate: "10/02/2026",
    endDate: "31/08/2026",
    previousRepresentative: null,
    reason: "Cambio de cartera",
    changedBy: "Supervisor Comercial",
    changedAt: "31/08/2026 17:20",
    status: "Histórico",
  },
  {
    id: "ASG-000080",
    client: "COMERCIAL DEL ESTE S.A.",
    representative: "Sin asignar",
    startDate: "01/09/2026",
    endDate: null,
    previousRepresentative: "Carlos Vera",
    reason: "Representante reasignado a otro equipo",
    changedBy: "Supervisor Comercial",
    changedAt: "01/09/2026 08:00",
    status: "Actual",
  },
];

export const representativeSummary = [
  {
    representative: "Salma Doldán",
    activeClients: 62,
    contactsThisWeek: 25,
    completedActions: 19,
    pendingActions: 6,
    overdueActions: 2,
    reassignedClientsThisMonth: 3,
  },
  {
    representative: "María López",
    activeClients: 58,
    contactsThisWeek: 23,
    completedActions: 17,
    pendingActions: 8,
    overdueActions: 3,
    reassignedClientsThisMonth: 4,
  },
  {
    representative: "Carlos Vera",
    activeClients: 59,
    contactsThisWeek: 21,
    completedActions: 15,
    pendingActions: 7,
    overdueActions: 1,
    reassignedClientsThisMonth: 5,
  },
];
