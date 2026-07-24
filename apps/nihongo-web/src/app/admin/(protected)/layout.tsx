import AdminGuard from '@/components/AdminGuard';
import AdminShell from '@/components/AdminShell';

export const dynamic = 'force-dynamic';

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
