import type { UserRole } from "@/types/auth";

export type MenuIcon =
  | "dashboard"
  | "calculator"
  | "clients"
  | "tariffs"
  | "services"
  | "matrix"
  | "orders"
  | "proformas"
  | "groups"
  | "brokers"
  | "users"
  | "audit"
  | "settings";

export interface MenuItem {
  label: string;
  href: string;
  icon: MenuIcon;
  roles: UserRole[];
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const ALL_ROLES: UserRole[] = [
  "ADMIN",
  "COMMERCIAL",
  "TARIFF_OPERATOR",
];

const MENU_GROUPS: MenuGroup[] = [
  {
    label: "General",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "dashboard",
        roles: ALL_ROLES,
      },
      {
        label: "Cálculo de Tasas",
        href: "/calculations",
        icon: "calculator",
        roles: ALL_ROLES,
      },
    ],
  },
  {
    label: "Gestión",
    items: [
      {
        label: "Clientes",
        href: "/clients",
        icon: "clients",
        roles: ALL_ROLES,
      },
      {
        label: "Tarifas",
        href: "/tariffs",
        icon: "tariffs",
        roles: ALL_ROLES,
      },
      {
        label: "Servicios y Artículos",
        href: "/services",
        icon: "services",
        roles: ALL_ROLES,
      },
      {
        label: "Matriz de Servicios",
        href: "/service-matrix",
        icon: "matrix",
        roles: ALL_ROLES,
      },
    ],
  },
  {
    label: "Operaciones",
    items: [
      {
        label: "Pedidos",
        href: "/orders",
        icon: "orders",
        roles: ["ADMIN", "TARIFF_OPERATOR"],
      },
      {
        label: "Proformas",
        href: "/proformas",
        icon: "proformas",
        roles: ALL_ROLES,
      },
    ],
  },
  {
    label: "Comercial",
    items: [
      {
        label: "Agenda Comercial",
        href: "/appointments",
        icon: "audit",
        roles: ["ADMIN", "COMMERCIAL"],
      },
      {
        label: "Reportes de Contacto",
        href: "/contact-reports",
        icon: "proformas",
        roles: ["ADMIN", "COMMERCIAL"],
      },
      {
        label: "Cartera Comercial",
        href: "/portfolio",
        icon: "clients",
        roles: ["ADMIN", "COMMERCIAL"],
      },
      {
        label: "Alertas Comerciales",
        href: "/commercial-alerts",
        icon: "audit",
        roles: ["ADMIN", "COMMERCIAL"],
      },
      {
        label: "Grupos Comerciales",
        href: "/commercial-groups",
        icon: "groups",
        roles: ["ADMIN", "COMMERCIAL"],
      },
      {
        label: "Despachantes",
        href: "/brokers",
        icon: "brokers",
        roles: ["ADMIN", "COMMERCIAL"],
      },
    ],
  },
  {
    label: "Reportes",
    items: [
      {
        label: "Gestión Comercial",
        href: "/reports",
        icon: "proformas",
        roles: ["ADMIN", "COMMERCIAL"],
      },
    ],
  },
  {
    label: "Administración",
    items: [
      {
        label: "Usuarios y Perfiles",
        href: "/users",
        icon: "users",
        roles: ["ADMIN"],
      },
      {
        label: "Auditoría",
        href: "/audit",
        icon: "audit",
        roles: ["ADMIN"],
      },
      {
        label: "Integraciones",
        href: "/integrations",
        icon: "settings",
        roles: ["ADMIN"],
      },
      {
        label: "Configuración",
        href: "/settings",
        icon: "settings",
        roles: ["ADMIN"],
      },
    ],
  },
];

export function getMenuForRole(role: UserRole): MenuGroup[] {
  return MENU_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}
