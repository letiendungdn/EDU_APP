'use client';

import { Elements } from '@stripe/react-stripe-js';
import SubscriptionPaymentForm from '@/components/SubscriptionPaymentForm';
import type { SubscriptionPlan } from '@/types/api';
import { isStripeConfigured, buildStripeElementsOptions, stripePromise } from '@/lib/stripe-client';
import '@/views/CheckoutView.css';

type SubscriptionCheckoutPanelProps = {
  plan: SubscriptionPlan;
  clientSecret: string;
  token: string;
  onSuccess: () => void;
  onCancel?: () => void;
  title?: string;
};

export default function SubscriptionCheckoutPanel({
  plan,
  clientSecret,
  token,
  onSuccess,
  onCancel,
  title = 'Hoàn tất thanh toán',
}: SubscriptionCheckoutPanelProps) {
  if (!isStripeConfigured()) {
    return (
      <div className="checkout-error-panel glass-panel">
        <h2>Stripe chưa cấu hình</h2>
        <p>Thêm NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY vào apps/nihongo-web/.env</p>
      </div>
    );
  }

  return (
    <div className="checkout-panel">
      <h2 className="checkout-title">{title}</h2>
      <Elements stripe={stripePromise} options={buildStripeElementsOptions(clientSecret)}>
        <SubscriptionPaymentForm
          plan={plan}
          clientSecret={clientSecret}
          token={token}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
}
