import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts';

function meta(name: string): string {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() ?? '';
}

export function keycloakAuthority(): string {
  const base = (meta('keycloak-url') || 'http://auth.localhost:8080').replace(/\/$/, '');
  const realm = meta('keycloak-realm') || 'edu-app';
  return `${base}/realms/${realm}`;
}

export function isKeycloakConfigured(): boolean {
  const raw = meta('keycloak-url');
  // Empty content="" means disabled; missing meta falls back to default host.
  const tag = document.querySelector('meta[name="keycloak-url"]');
  if (tag && raw === '') return false;
  return true;
}

let manager: UserManager | null = null;

export function getKeycloakUserManager(): UserManager {
  if (!manager) {
    const clientId = meta('keycloak-client-id') || 'nihongo-angular';
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
  await getKeycloakUserManager().signinRedirect();
}

export async function completeKeycloakLogin(): Promise<User> {
  return getKeycloakUserManager().signinRedirectCallback();
}

/** @returns true nếu đang redirect tới Keycloak end_session */
export async function signoutKeycloak(): Promise<boolean> {
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
