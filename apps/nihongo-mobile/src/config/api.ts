import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;

/** Emulator Android → host qua nginx. Máy thật: đổi trong app.json extra.apiBaseUrl */
export const API_BASE_URL =
  extra?.apiBaseUrl?.replace(/\/$/, '') ?? 'http://10.0.2.2:3000/api';
