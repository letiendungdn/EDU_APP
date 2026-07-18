import { Role } from "@prisma/client";

export type KeycloakIdentityPayload = {
  sub?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: { roles?: string[] };
  /** Protocol mapper `edu-app-roles` → flat claim */
  app_roles?: string | string[];
};

/** Prefer custom `app_roles` mapper; fallback to built-in `realm_access.roles`. */
export function extractKeycloakRoles(
  payload: KeycloakIdentityPayload,
): string[] {
  const flat = payload.app_roles;
  if (Array.isArray(flat)) {
    return flat.map((r) => String(r).toLowerCase());
  }
  if (typeof flat === "string" && flat.trim()) {
    return [flat.toLowerCase()];
  }
  return (payload.realm_access?.roles ?? []).map((r) => r.toLowerCase());
}

/** admin > teacher > user → Prisma Role */
export function mapKeycloakRolesToAppRole(roles: string[]): Role {
  const set = new Set(roles.map((r) => r.toLowerCase()));
  if (set.has("admin")) return Role.ADMIN;
  if (set.has("teacher")) return Role.TEACHER;
  return Role.USER;
}
