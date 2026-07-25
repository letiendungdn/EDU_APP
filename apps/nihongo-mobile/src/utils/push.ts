import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { registerPushToken, unregisterPushToken } from '../data/api';

const TOKEN_STORE_KEY = 'push_device_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupPushNotifications(
  onNavigateSrs?: () => void,
): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return null;

  let token: string | null = null;
  try {
    const device = await Notifications.getDevicePushTokenAsync();
    token = typeof device.data === 'string' ? device.data : String(device.data);
  } catch {
    // Emulator / missing push credentials — still allow local deep-link handling
    token = `local-${Platform.OS}-${Date.now()}`;
  }

  await SecureStore.setItemAsync(TOKEN_STORE_KEY, token);
  try {
    await registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
  } catch {
    // Backend may be offline
  }

  Notifications.addNotificationResponseReceivedListener((response) => {
    const screen = response.notification.request.content.data?.screen;
    if (screen === 'srs') onNavigateSrs?.();
  });

  return token;
}

export async function unregisterPushNotifications(): Promise<void> {
  const token = await SecureStore.getItemAsync(TOKEN_STORE_KEY);
  if (!token) return;
  try {
    await unregisterPushToken(token);
  } catch {
    // ignore
  }
  await SecureStore.deleteItemAsync(TOKEN_STORE_KEY);
}
