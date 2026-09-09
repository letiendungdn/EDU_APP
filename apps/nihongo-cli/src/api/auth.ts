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
