export type PrototypeMenuItem = {
  label: string;
  href: string;
  description?: string;
};

export type PrototypeMenuGroup = {
  group: string;
  items: PrototypeMenuItem[];
};

export const prototypeMenuAdditions: PrototypeMenuGroup[] = [
  {
    group: "COMERCIAL",
    items: [
      {
        label: "Reportes de contacto",
        href: "/contact-reports",
        description: "Historial, seguimiento y reportes CRM",
      },
      {
        label: "Cartera comercial",
        href: "/portfolio",
        description: "Asignación e historial de representantes",
      },
      {
        label: "Alertas comerciales",
        href: "/commercial-alerts",
        description: "Clientes sin contacto y vencimientos",
      },
    ],
  },
  {
    group: "ADMINISTRACIÓN",
    items: [
      {
        label: "Integraciones",
        href: "/integrations",
        description: "Estado de Waldbott y NAVIS",
      },
    ],
  },
];
