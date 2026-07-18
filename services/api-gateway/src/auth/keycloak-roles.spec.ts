import { Role } from "@prisma/client";
import {
  extractKeycloakRoles,
  mapKeycloakRolesToAppRole,
} from "./keycloak-roles";

describe("keycloak-roles", () => {
  it("maps admin > teacher > user", () => {
    expect(mapKeycloakRolesToAppRole(["admin", "user"])).toBe(Role.ADMIN);
    expect(mapKeycloakRolesToAppRole(["teacher", "user"])).toBe(Role.TEACHER);
    expect(mapKeycloakRolesToAppRole(["user"])).toBe(Role.USER);
    expect(mapKeycloakRolesToAppRole([])).toBe(Role.USER);
  });

  it("prefers app_roles mapper claim", () => {
    expect(
      extractKeycloakRoles({
        app_roles: ["Teacher", "user"],
        realm_access: { roles: ["admin"] },
      }),
    ).toEqual(["teacher", "user"]);
  });

  it("falls back to realm_access.roles", () => {
    expect(
      extractKeycloakRoles({
        realm_access: { roles: ["Admin"] },
      }),
    ).toEqual(["admin"]);
  });
});
