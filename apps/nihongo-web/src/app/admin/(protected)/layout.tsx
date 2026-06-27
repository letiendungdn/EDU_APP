import AdminGuard from '@/components/AdminGuard';

export const dynamic = 'force-dynamic';

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
