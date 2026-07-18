import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts';

function keycloakAuthority(): string {
  const base = (process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'http://auth.localhost:8080').replace(
    /\/$/,
    '',
  );
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? 'edu-app';
  return `${base}/realms/${realm}`;
}

export function isKeycloakConfigured(): boolean {
  // Default local Docker host; empty string can disable via NEXT_PUBLIC_KEYCLOAK_URL=
  const raw = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  if (raw === '') return false;
  return true;
}

let manager: UserManager | null = null;

export function getKeycloakUserManager(): UserManager {
  if (typeof window === 'undefined') {
    throw new Error('Keycloak UserManager chỉ dùng trên browser');
  }
  if (!manager) {
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'nihongo-web';
    manager = new UserManager({
      authority: keycloakAuthority(),
      client_id: clientId,
      redirect_uri: `${window.location.origin}/auth/callback`,
      post_logout_redirect_uri: `${window.location.origin}/`,
      response_type: 'code',
      scope: 'openid profile email',
      automaticSilentRenew: false,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    });
  }
  return manager;
}

export async function startKeycloakLogin(): Promise<void> {
  const um = getKeycloakUserManager();
  await um.signinRedirect();
}

export async function completeKeycloakLogin(): Promise<User> {
  const um = getKeycloakUserManager();
  return um.signinRedirectCallback();
}

/**
 * Front-channel logout tại Keycloak (end_session) nếu còn OIDC session.
 * @returns true nếu browser đang redirect sang Keycloak (không navigate thêm).
 */
export async function signoutKeycloak(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const um = getKeycloakUserManager();
    const user = await um.getUser();
    if (!user) {
      await um.removeUser().catch(() => undefined);
      return false;
    }
    await um.signoutRedirect({ id_token_hint: user.id_token });
    return true;
  } catch {
    try {
      await getKeycloakUserManager().removeUser();
    } catch {
      /* ignore */
    }
    return false;
  }
}
