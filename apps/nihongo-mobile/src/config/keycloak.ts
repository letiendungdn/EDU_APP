import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';

type Extra = {
  keycloakUrl?: string;
  keycloakRealm?: string;
  keycloakClientId?: string;
};

const extra = Constants.expoConfig?.extra as Extra | undefined;

export const KEYCLOAK_URL = (
  extra?.keycloakUrl ?? 'http://10.0.2.2:8080'
).replace(/\/$/, '');

export const KEYCLOAK_REALM = extra?.keycloakRealm ?? 'edu-app';

export const KEYCLOAK_CLIENT_ID = extra?.keycloakClientId ?? 'nihongo-mobile';

export const KEYCLOAK_AUTHORITY = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;

export const keycloakDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: `${KEYCLOAK_AUTHORITY}/protocol/openid-connect/auth`,
  tokenEndpoint: `${KEYCLOAK_AUTHORITY}/protocol/openid-connect/token`,
  revocationEndpoint: `${KEYCLOAK_AUTHORITY}/protocol/openid-connect/logout`,
};

/** Matches realm redirect `nihongo://auth/callback` */
export function keycloakRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: 'nihongo',
    path: 'auth/callback',
  });
}
