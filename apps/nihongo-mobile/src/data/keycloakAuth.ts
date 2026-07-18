import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import {
  KEYCLOAK_CLIENT_ID,
  keycloakDiscovery,
  keycloakRedirectUri,
} from '../config/keycloak';

WebBrowser.maybeCompleteAuthSession();

export type KeycloakTokens = {
  accessToken: string;
  idToken?: string;
};

export async function loginWithKeycloak(): Promise<KeycloakTokens> {
  const redirectUri = keycloakRedirectUri();

  const request = new AuthSession.AuthRequest({
    clientId: KEYCLOAK_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    usePKCE: true,
    prompt: AuthSession.Prompt.Login,
  });

  await request.makeAuthUrlAsync(keycloakDiscovery);

  const result = await request.promptAsync(keycloakDiscovery);

  if (result.type !== 'success') {
    throw new Error(
      result.type === 'cancel' || result.type === 'dismiss'
        ? 'Đã hủy đăng nhập Keycloak'
        : 'Keycloak auth thất bại',
    );
  }

  const code = result.params.code;
  if (!code) throw new Error('Keycloak không trả authorization code');

  const tokenResult = await AuthSession.exchangeCodeAsync(
    {
      clientId: KEYCLOAK_CLIENT_ID,
      code,
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier ?? '',
      },
    },
    keycloakDiscovery,
  );

  const accessToken = tokenResult.accessToken;
  if (!accessToken) throw new Error('Keycloak không trả access_token');

  return {
    accessToken,
    idToken: tokenResult.idToken,
  };
}
