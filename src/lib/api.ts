const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const role = path.startsWith("/admin") || path.startsWith("/auth/admin") ? "admin" : "customer";
  const token = getSessionToken(role);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (!response.ok) { const body = await response.json().catch(() => ({ message: "Request failed" })); throw new ApiError(body.message ?? "Request failed", response.status); }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type SessionUser = { id: number; name: string; email?: string; role: "admin" | "customer" };
type SessionRole = SessionUser["role"];
const tokenKey = (role: SessionRole) => `${role}_auth_token`;
const userKey = (role: SessionRole) => `${role}_auth_user`;
export const CART_UPDATED_EVENT = "cart-updated";
export const WISHLIST_UPDATED_EVENT = "wishlist-updated";
export function notifyCartUpdated() { window.dispatchEvent(new Event(CART_UPDATED_EVENT)); }
export function notifyWishlistUpdated() { window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT)); }
export function getSessionToken(role: SessionRole = "customer") {
  const current = localStorage.getItem(tokenKey(role));
  if (current) return current;
  try {
    const legacyUser = JSON.parse(localStorage.getItem("auth_user") ?? "null") as SessionUser | null;
    const legacyToken = localStorage.getItem("auth_token");
    if (legacyUser?.role === role && legacyToken) { saveSession(legacyToken, legacyUser); return legacyToken; }
  } catch { /* Ignore invalid legacy session data. */ }
  return null;
}
export function saveSession(token: string, user?: SessionUser) {
  const role = user?.role ?? "customer";
  localStorage.setItem(tokenKey(role), token);
  if (user) localStorage.setItem(userKey(role), JSON.stringify(user));
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}
export function getSessionUser(role: SessionRole = "customer"): SessionUser | null {
  try {
    const value = localStorage.getItem(userKey(role));
    if (value) return JSON.parse(value) as SessionUser;
    getSessionToken(role);
    const migrated = localStorage.getItem(userKey(role));
    return migrated ? JSON.parse(migrated) as SessionUser : null;
  } catch { return null; }
}
export function clearSession(role: SessionRole = "customer") {
  localStorage.removeItem(tokenKey(role));
  localStorage.removeItem(userKey(role));
  const legacyUser = localStorage.getItem("auth_user");
  try { if ((JSON.parse(legacyUser ?? "null") as SessionUser | null)?.role === role) { localStorage.removeItem("auth_token"); localStorage.removeItem("auth_user"); } } catch { /* Ignore invalid legacy data. */ }
}
