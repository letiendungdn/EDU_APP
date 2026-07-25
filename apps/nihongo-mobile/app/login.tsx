import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { login, loginWithOidc } from '../src/data/api';
import { loginWithKeycloak } from '../src/data/keycloakAuth';
import { setupPushNotifications } from '../src/utils/push';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [kcLoading, setKcLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = loading || kcLoading;

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      await setupPushNotifications(() => router.push('/srs'));
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onKeycloak = async () => {
    setKcLoading(true);
    setError(null);
    try {
      const tokens = await loginWithKeycloak();
      await loginWithOidc(tokens.accessToken, tokens.idToken);
      await setupPushNotifications(() => router.push('/srs'));
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Keycloak thất bại');
    } finally {
      setKcLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.btn, styles.kcBtn, busy && styles.btnDisabled]}
        onPress={onKeycloak}
        disabled={busy}
      >
        {kcLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Đăng nhập Keycloak</Text>
        )}
      </Pressable>

      <Text style={styles.devLabel}>Dev login (email / mật khẩu)</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable
        style={[styles.btn, busy && styles.btnDisabled]}
        onPress={onSubmit}
        disabled={busy}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Đăng nhập</Text>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f9fafb' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  kcBtn: { backgroundColor: '#0f766e', marginBottom: 20 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '600' },
  devLabel: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 12,
    fontSize: 13,
  },
  error: { color: '#dc2626', marginTop: 12 },
});
