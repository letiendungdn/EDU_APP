import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuthStore} from '../store/authStore';
import SocialLoginButtons from '../components/SocialLoginButtons';

export default function LoginScreen() {
  const nav = useNavigation();
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      nav.goBack();
    } catch {
      setError('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSuccess = () => {
    nav.goBack();
  };

  const handleOAuthError = (msg: string) => {
    setError(msg);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>🇯🇵 Đăng nhập</Text>
          <Text style={styles.sub}>Sync tiến độ học tiếng Nhật</Text>

          {/* OAuth 2.0 / OIDC buttons */}
          <SocialLoginButtons
            onSuccess={handleOAuthSuccess}
            onError={handleOAuthError}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc dùng email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email / password form */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={t => { setEmail(t); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={t => { setPassword(t); setError(''); }}
            secureTextEntry
          />

          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Đăng nhập</Text>
            )}
          </Pressable>

          <Pressable onPress={() => nav.goBack()}>
            <Text style={styles.skipText}>Bỏ qua, học offline</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ef',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  title: {fontSize: 22, fontWeight: '800', color: '#111827'},
  sub: {fontSize: 13, color: '#6b7280'},
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dividerLine: {flex: 1, height: 1, backgroundColor: '#e5e7eb'},
  dividerText: {fontSize: 12, color: '#9ca3af'},
  error: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#111827',
  },
  btn: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  btnDisabled: {opacity: 0.6},
  btnText: {color: '#fff', fontWeight: '700', fontSize: 16},
  skipText: {textAlign: 'center', color: '#6b7280', fontSize: 14},
});
