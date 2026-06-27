'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { loginAdmin } from '../api';
import { getStoredToken, setStoredToken } from '../lib/api-client';
import { queryKeys, useAuthMeQuery } from '../hooks/queries';
import type { AuthUser } from '../types/api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const { data: me } = useAuthMeQuery(!!token);

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  useEffect(() => {
    if (me) setUser(me);
    if (!token) setUser(null);
  }, [me, token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginAdmin(email, password);
      if (res.user.role !== 'ADMIN') {
        throw new Error('Tài khoản không có quyền admin');
      }
      setStoredToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      queryClient.setQueryData(queryKeys.authMe, res.user);
    },
    [queryClient],
  );

  const logout = useCallback(() => {
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
      isAdmin: user?.role === 'ADMIN',
      login,
      logout,
    }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
