import type { AuthUser } from "@/types/auth";
import { MOCK_USERS } from "./mockUsers";

const LOCAL_SESSION_KEY = "terport.auth.session";
const TEMP_SESSION_KEY = "terport.auth.session.temp";

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  message?: string;
}

export function authenticateMockUser(
  username: string,
  password: string
): LoginResult {
  const normalizedUsername = username.trim().toLowerCase();

  const mockUser = MOCK_USERS.find(
    (user) =>
      user.username.toLowerCase() === normalizedUsername &&
      user.password === password
  );

  if (!mockUser) {
    return {
      success: false,
      message: "Usuario o contraseña incorrectos.",
    };
  }

  const user: AuthUser = {
    id: mockUser.id,
    username: mockUser.username,
    displayName: mockUser.displayName,
    role: mockUser.role,
  };

  return {
    success: true,
    user,
  };
}

export function saveSession(user: AuthUser, rememberMe = false): void {
  if (typeof window === "undefined") return;

  clearSession();

  const serializedUser = JSON.stringify(user);

  if (rememberMe) {
    localStorage.setItem(LOCAL_SESSION_KEY, serializedUser);
  } else {
    sessionStorage.setItem(TEMP_SESSION_KEY, serializedUser);
  }
}

export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const rawSession =
    sessionStorage.getItem(TEMP_SESSION_KEY) ??
    localStorage.getItem(LOCAL_SESSION_KEY);

  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as AuthUser;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(TEMP_SESSION_KEY);
  localStorage.removeItem(LOCAL_SESSION_KEY);
}

export function hasSession(): boolean {
  return getSession() !== null;
}