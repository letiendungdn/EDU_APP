import React from 'react';
import {View, Text, Pressable, ActivityIndicator, StyleSheet} from 'react-native';
import {useGoogleSignIn, useKeycloakOidc} from '../hooks/useOAuth';

type Props = {
  onSuccess: () => void;
  onError: (msg: string) => void;
};

export default function SocialLoginButtons({onSuccess, onError}: Props) {
  const {signIn: googleSignIn, loading: googleLoading} = useGoogleSignIn();
  const {signIn: keycloakSignIn, loading: kcLoading} = useKeycloakOidc();

  const handleGoogle = async () => {
    const result = await googleSignIn();
    if (result.success) {
      onSuccess();
    } else if (result.error) {
      onError(result.error);
    }
  };

  const handleKeycloak = async () => {
    const result = await keycloakSignIn();
    if (result.success) {
      onSuccess();
    } else if (result.error) {
      onError(result.error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Google Sign-In */}
      <Pressable
        style={[styles.btn, styles.googleBtn, googleLoading && styles.disabled]}
        onPress={handleGoogle}
        disabled={googleLoading || kcLoading}>
        {googleLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Đăng nhập bằng Google</Text>
          </>
        )}
      </Pressable>

      {/* Keycloak OIDC */}
      <Pressable
        style={[styles.btn, styles.kcBtn, kcLoading && styles.disabled]}
        onPress={handleKeycloak}
        disabled={googleLoading || kcLoading}>
        {kcLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.kcIcon}>🔑</Text>
            <Text style={styles.kcText}>Đăng nhập qua Keycloak (OIDC)</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  disabled: {
    opacity: 0.6,
  },
  // Google
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
    fontFamily: 'Georgia',
  },
  googleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  // Keycloak
  kcBtn: {
    backgroundColor: '#0b7fe8',
  },
  kcIcon: {
    fontSize: 16,
  },
  kcText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
