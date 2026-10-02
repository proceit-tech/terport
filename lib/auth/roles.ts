import type { UserRole } from "@/types/auth";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  COMMERCIAL: "Comercial",
  TARIFF_OPERATOR: "Operador de Tarifas",
};

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role];
}
