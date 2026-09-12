import {useCallback, useState} from 'react';
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import {authorize} from 'react-native-app-auth';
import {authApi} from '../api/auth';
import {useAuthStore} from '../store/authStore';
import {API_BASE_URL} from '../api/client';

// ── Google Sign-In ────────────────────────────────────────────────────────────

GoogleSignin.configure({
  // Web Client ID từ Google Cloud Console (cùng project với backend)
  webClientId: '343309611106-fmm83bncet7q27d2cjni8v7k1fvti3oh.apps.googleusercontent.com',
  offlineAccess: true,
});

export function useGoogleSignIn() {
  const loginWithOAuth = useAuthStore(s => s.loginWithOAuth);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const userInfo = await GoogleSignin.signIn();
      const {idToken} = await GoogleSignin.getTokens();

      if (!idToken) throw new Error('Không lấy được idToken từ Google');

      // Gửi idToken lên backend → backend verify với Google, trả JWT của app
      const data = await authApi.loginWithGoogle(idToken);
      loginWithOAuth(data);
      return {success: true};
    } catch (err) {
      if (isErrorWithCode(err)) {
        if (err.code === statusCodes.SIGN_IN_CANCELLED) {
          return {success: false, error: 'Đã hủy đăng nhập Google'};
        }
        if (err.code === statusCodes.IN_PROGRESS) {
          return {success: false, error: 'Đang xử lý...'};
        }
        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          return {success: false, error: 'Google Play Services không khả dụng'};
        }
      }
      return {success: false, error: err instanceof Error ? err.message : 'Google đăng nhập thất bại'};
    } finally {
      setLoading(false);
    }
  }, [loginWithOAuth]);

  return {signIn, loading};
}

// ── Keycloak OIDC (Authorization Code + PKCE) ─────────────────────────────────

// Keycloak config — Authorization Code flow với PKCE (RFC 7636)
// Không cần client_secret trên mobile (public client)
const KEYCLOAK_BASE = 'http://auth.localhost:8080/realms/edu-app';
const REDIRECT_URI = 'com.nihongocli://oauth/callback';

const keycloakConfig = {
  issuer: KEYCLOAK_BASE,
  clientId: 'nihongo-mobile',          // Public client trong Keycloak realm
  redirectUrl: REDIRECT_URI,
  scopes: ['openid', 'profile', 'email'],
  // PKCE được bật tự động bởi react-native-app-auth
  additionalParameters: {},
  serviceConfiguration: {
    authorizationEndpoint: `${KEYCLOAK_BASE}/protocol/openid-connect/auth`,
    tokenEndpoint: `${KEYCLOAK_BASE}/protocol/openid-connect/token`,
    endSessionEndpoint: `${KEYCLOAK_BASE}/protocol/openid-connect/logout`,
  },
};

export function useKeycloakOidc() {
  const loginWithOAuth = useAuthStore(s => s.loginWithOAuth);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      // react-native-app-auth tự sinh code_verifier + code_challenge (PKCE S256)
      // Mở browser → user đăng nhập Keycloak → redirect về app
      const result = await authorize(keycloakConfig);

      // Gửi authorization_code lên backend để exchange lấy JWT của app
      // (backend không cần code_verifier vì PKCE đã được verify bởi Keycloak)
      const data = await authApi.loginWithKeycloak(
        result.authorizationCode ?? '',
        result.codeVerifier ?? '',
        REDIRECT_URI,
      );
      loginWithOAuth(data);
      return {success: true};
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Keycloak đăng nhập thất bại';
      // User cancel thường throw với message chứa "cancel" hoặc "dismiss"
      if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('dismiss')) {
        return {success: false, error: 'Đã hủy đăng nhập'};
      }
      return {success: false, error: msg};
    } finally {
      setLoading(false);
    }
  }, [loginWithOAuth]);

  return {signIn, loading};
}
