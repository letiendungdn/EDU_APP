'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  login as apiLogin,
  loginWithGoogle as apiGoogleLogin,
  logoutAuth,
  register as apiRegister,
  updateProfile as apiUpdateProfile,
} from '../api';
import { getStoredToken, setStoredToken } from '../lib/api-client';
import { queryKeys, useAuthMeQuery } from '../hooks/queries';
import type { AuthUser, LoginResponse, UpdateProfileInput } from '../types/api';
import { AuthContext } from './auth-context';

function applySession(
  res: LoginResponse,
  setToken: (t: string) => void,
  setUser: (u: AuthUser) => void,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  setStoredToken(res.access_token);
  setToken(res.access_token);
  setUser(res.user);
  queryClient.setQueryData(queryKeys.authMe, res.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const { data: me } = useAuthMeQuery(!!token);

  useEffect(() => {
    setToken(getStoredToken());
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (me) setUser(me);
    if (!token) setUser(null);
  }, [me, token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      applySession(res, setToken, setUser, queryClient);
      return res.user;
    },
    [queryClient],
  );

  const loginAdmin = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      if (res.user.role !== 'ADMIN') {
        throw new Error('Tài khoản không có quyền admin');
      }
      applySession(res, setToken, setUser, queryClient);
      return res.user;
    },
    [queryClient],
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const res = await apiGoogleLogin(credential);
      applySession(res, setToken, setUser, queryClient);
      return res.user;
    },
    [queryClient],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const res = await apiRegister(email, password);
      applySession(res, setToken, setUser, queryClient);
      return res.user;
    },
    [queryClient],
  );

  const updateProfile = useCallback(
    async (data: UpdateProfileInput) => {
      const current = getStoredToken();
      if (!current) throw new Error('Chưa đăng nhập');
      const updated = await apiUpdateProfile(current, data);
      setUser(updated);
      queryClient.setQueryData(queryKeys.authMe, updated);
      return updated;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    const current = getStoredToken();
    if (current) {
      try {
        await logoutAuth(current);
      } catch {
        // vẫn xóa session local nếu API lỗi
      }
    }
    setStoredToken(null);
    setToken(null);
    setUser(null);
    queryClient.removeQueries({ queryKey: queryKeys.authMe });
    queryClient.removeQueries({ queryKey: queryKeys.adminStats });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      authReady,
      isAdmin: user?.role === 'ADMIN',
      login,
      loginAdmin,
      loginWithGoogle,
      register,
      updateProfile,
      logout,
    }),
    [token, user, authReady, login, loginAdmin, loginWithGoogle, register, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
