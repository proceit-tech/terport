export type UserRole = "ADMIN" | "COMMERCIAL" | "TARIFF_OPERATOR";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
}

export interface MockUser extends AuthUser {
  password: string;
}
