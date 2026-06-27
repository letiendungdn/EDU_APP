'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSubscription, fetchSubscriptionStatus } from '@/api';
import SubscriptionCheckoutPanel from '@/components/SubscriptionCheckoutPanel';
import { useAuth } from '@/hooks/useAuth';
import { isSubscriptionEntitled } from '@/lib/subscription-utils';
import type { SubscriptionPlan } from '@/types/api';
import './CheckoutView.css';

export default function CheckoutView() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = (searchParams?.get('plan') ?? 'PRO') as SubscriptionPlan;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace(`/login?redirect=/subscribe?plan=${plan}`);
      return;
    }

    async function initCheckout() {
      try {
        const res = await createSubscription(token!, plan);
        setClientSecret(res.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể khởi tạo thanh toán');
      } finally {
        setLoading(false);
      }
    }

    void initCheckout();
  }, [isAuthenticated, token, plan, router]);

  const handleSuccess = useCallback(async () => {
    if (!token) {
      router.push('/pricing');
      return;
    }
    const sub = await fetchSubscriptionStatus(token);
    if (isSubscriptionEntitled(sub)) {
      router.push('/pricing?success=1');
    } else {
      router.push('/pricing');
    }
  }, [router, token]);

  if (loading) {
    return <div className="page-loading">Đang khởi tạo thanh toán...</div>;
  }

  if (error) {
    return (
      <div className="container checkout-page">
        <div className="checkout-error-panel glass-panel">
          <h2>Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button type="button" className="btn btn-outline" onClick={() => router.push('/pricing')}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <div className="container checkout-page">
      <button type="button" className="checkout-back btn btn-outline btn-sm" onClick={() => router.back()}>
        ← Quay lại
      </button>
      <SubscriptionCheckoutPanel
        plan={plan}
        clientSecret={clientSecret}
        token={token!}
        onSuccess={handleSuccess}
        onCancel={() => router.push('/pricing')}
      />
    </div>
  );
}
