'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/types/api';

type GoogleSignInButtonProps = {
  mode?: 'login' | 'register';
  onError?: (message: string) => void;
  onSuccess?: (role: string) => void;
};

export default function GoogleSignInButton({
  mode = 'login',
  onError,
  onSuccess,
}: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <p className="auth-google-hint">
        <strong>Đăng ký bằng Gmail</strong> chưa bật. Tạo OAuth Client ID tại{' '}
        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">
          Google Cloud Console
        </a>
        , rồi thêm <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> vào{' '}
        <code>apps/nihongo-web/.env</code> và <code>GOOGLE_CLIENT_ID</code> vào{' '}
        <code>services/.env</code>. Xem <code>docs/google-oauth-setup.md</code>.
      </p>
    );
  }

  const googleText = mode === 'register' ? 'signup_with' : 'continue_with';

  return (
    <div className="auth-google-wrap">
      <GoogleLogin
        onSuccess={async (res) => {
          if (!res.credential) {
            onError?.('Không nhận được token từ Google');
            return;
          }
          try {
            const authUser = await loginWithGoogle(res.credential);
            onSuccess?.(authUser.role);
          } catch (err) {
            onError?.(
              err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Google đăng nhập thất bại',
            );
          }
        }}
        onError={() => onError?.('Google đăng nhập bị hủy hoặc lỗi')}
        text={googleText}
        shape="rectangular"
        theme="outline"
        size="large"
        width="360"
        locale="vi"
      />
    </div>
  );
}
