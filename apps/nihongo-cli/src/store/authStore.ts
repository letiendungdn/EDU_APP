import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';
import {authApi} from '../api/auth';
import type {User, AuthTokens} from '../types';

const storage = new MMKV({id: 'auth-store'});

const mmkvStorage = createJSONStorage(() => ({
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}));

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (tokens: AuthTokens & {user: User}) => void;
  refresh: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoggedIn: false,

      login: async (email, password) => {
        const data = await authApi.login(email, password);
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          isLoggedIn: true,
        });
      },

      loginWithOAuth: ({accessToken, refreshToken, user}) => {
        set({accessToken, refreshToken, user, isLoggedIn: true});
      },

      refresh: async () => {
        const {refreshToken} = get();
        if (!refreshToken) throw new Error('No refresh token');
        const data = await authApi.refresh(refreshToken);
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      },

      logout: () => {
        set({accessToken: null, refreshToken: null, user: null, isLoggedIn: false});
      },
    }),
    {
      name: 'auth',
      storage: mmkvStorage,
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);
