'use client';

import { createContext } from 'react';
import type { AuthUser, UpdateProfileInput } from '../types/api';

export interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginAdmin: (email: string, password: string) => Promise<AuthUser>;
  loginWithGoogle: (credential: string) => Promise<AuthUser>;
  register: (email: string, password: string) => Promise<AuthUser>;
  updateProfile: (data: UpdateProfileInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
