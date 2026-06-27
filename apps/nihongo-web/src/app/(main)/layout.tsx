import AppLayout from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

export default function MainGroupLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
