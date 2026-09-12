import {api} from './client';
import type {User, AuthTokens} from '../types';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<AuthTokens & {user: User}>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  // Google Sign-In: gửi idToken lên backend → backend verify + trả JWT
  loginWithGoogle: async (idToken: string) => {
    const res = await api.post<AuthTokens & {user: User}>('/auth/google', {idToken});
    return res.data;
  },

  // Keycloak OIDC: gửi authorization_code + code_verifier (PKCE) lên backend
  loginWithKeycloak: async (code: string, codeVerifier: string, redirectUri: string) => {
    const res = await api.post<AuthTokens & {user: User}>('/auth/keycloak/callback', {
      code,
      codeVerifier,
      redirectUri,
    });
    return res.data;
  },

  refresh: async (refreshToken: string) => {
    const res = await api.post<AuthTokens>('/auth/refresh', {refreshToken});
    return res.data;
  },

  me: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};
