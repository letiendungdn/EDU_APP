import { Suspense } from 'react';
import PricingView from '@/views/PricingView';

export const metadata = { title: 'Pricing — Nihongo Learn' };

export default function Page() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <PricingView />
    </Suspense>
  );
}
