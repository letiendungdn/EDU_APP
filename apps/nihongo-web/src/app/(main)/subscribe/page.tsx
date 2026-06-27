import { Suspense } from 'react';
import CheckoutView from '@/views/CheckoutView';

export const metadata = { title: 'Checkout — Nihongo Learn' };

export default function Page() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <CheckoutView />
    </Suspense>
  );
}
