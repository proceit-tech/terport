import type { MockUser } from "@/types/auth";

export const MOCK_USERS: MockUser[] = [
  {
    id: "USR-001",
    username: "admin",
    password: "!14583679QW",
    displayName: "Administrador TERPORT",
    role: "ADMIN",
  },
  {
    id: "USR-002",
    username: "comercial",
    password: "!14583679QW",
    displayName: "Usuario Comercial",
    role: "COMMERCIAL",
  },
  {
    id: "USR-003",
    username: "operador",
    password: "!14583679QW",
    displayName: "Operador de Tarifas",
    role: "TARIFF_OPERATOR",
  },
];
