'use client';

import { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { cardPaymentElementOptions } from '@/lib/stripe-client';

type AddCardFormProps = {
  clientSecret: string;
  onSuccess: () => void;
  onCancel?: () => void;
};

export default function AddCardForm({
  clientSecret,
  onSuccess,
  onCancel,
}: AddCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const returnUrl = `${window.location.origin}/profile?card=added`;

    const result = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message ?? 'Không thể lưu thẻ');
      setProcessing(false);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="add-card-form">
      <PaymentElement options={cardPaymentElementOptions} />

      {error && <p className="auth-error">{error}</p>}

      <div className="add-card-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={processing}
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!stripe || processing}
        >
          {processing ? 'Đang lưu...' : 'Lưu thẻ'}
        </button>
      </div>
    </form>
  );
}
