/** Sau đăng nhập: ưu tiên redirect tường minh, admin mặc định vào /admin */
export function resolvePostAuthRedirect(
  role: string,
  explicitRedirect?: string | null,
): string {
  const redirect = explicitRedirect?.trim();
  if (redirect && redirect.startsWith('/') && redirect !== '/') {
    return redirect;
  }
  if (role === 'ADMIN') {
    return '/admin';
  }
  return '/';
}
