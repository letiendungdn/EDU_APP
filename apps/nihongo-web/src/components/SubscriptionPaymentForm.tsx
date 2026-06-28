'use client';

import { useEffect, useState } from 'react';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { fetchPaymentMethods } from '@/api';
import type { SavedCard, SubscriptionPlan } from '@/types/api';
import { cardPaymentElementOptions } from '@/lib/stripe-client';
import { isPaidSubscriptionIntent } from '@/lib/subscription-utils';

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FREE: 'Miễn phí',
  BASIC: 'BASIC — $9.99/tháng',
  PRO: 'PRO — $19.99/tháng',
  PRO_ANNUAL: 'PRO ANNUAL — $99/năm',
};

function brandLabel(brand: string): string {
  const map: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'Amex',
    jcb: 'JCB',
  };
  return map[brand.toLowerCase()] ?? brand.toUpperCase();
}

type SubscriptionPaymentFormProps = {
  plan: SubscriptionPlan;
  clientSecret: string;
  token: string;
  onSuccess: () => void;
  onCancel?: () => void;
};

export default function SubscriptionPaymentForm({
  plan,
  clientSecret,
  token,
  onSuccess,
  onCancel,
}: SubscriptionPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [useNewCard, setUseNewCard] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCardsLoading(true);
    void fetchPaymentMethods(token)
      .then((cards) => {
        if (cancelled) return;
        setSavedCards(cards);
        if (cards.length > 0) {
          const def = cards.find((c) => c.isDefault) ?? cards[0];
          setSelectedCardId(def.id);
          setUseNewCard(false);
        } else {
          setUseNewCard(true);
        }
      })
      .catch(() => {
        if (!cancelled) setUseNewCard(true);
      })
      .finally(() => {
        if (!cancelled) setCardsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function confirmWithSavedCard() {
    if (!stripe || !selectedCardId) return;

    const returnUrl = `${window.location.origin}/pricing?success=1`;
    const isSetupIntent = clientSecret.startsWith('seti_');

    const result = isSetupIntent
      ? await stripe.confirmCardSetup(clientSecret, {
          payment_method: selectedCardId,
          return_url: returnUrl,
        })
      : await stripe.confirmCardPayment(clientSecret, {
          payment_method: selectedCardId,
          return_url: returnUrl,
        });

    if (result.error) {
      setError(result.error.message ?? 'Thanh toán thất bại');
      setProcessing(false);
      return;
    }

    const paid = isPaidSubscriptionIntent(
      clientSecret,
      'setupIntent' in result ? result.setupIntent : null,
      'paymentIntent' in result ? result.paymentIntent : null,
    );

    if (paid) {
      onSuccess();
    } else {
      setError('Thanh toán chưa hoàn tất. Vui lòng thử lại.');
      setProcessing(false);
    }
  }

  async function confirmWithNewCard() {
    if (!stripe || !elements) return;

    const returnUrl = `${window.location.origin}/pricing?success=1`;
    const isSetupIntent = clientSecret.startsWith('seti_');

    const result = isSetupIntent
      ? await stripe.confirmSetup({
          elements,
          confirmParams: { return_url: returnUrl },
          redirect: 'if_required',
        })
      : await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: returnUrl },
          redirect: 'if_required',
        });

    if (result.error) {
      setError(result.error.message ?? 'Thanh toán thất bại');
      setProcessing(false);
      return;
    }

    const setupIntent = 'setupIntent' in result ? result.setupIntent : undefined;
    const paymentIntent = 'paymentIntent' in result ? result.paymentIntent : undefined;
    const paid = isPaidSubscriptionIntent(clientSecret, setupIntent, paymentIntent);

    if (paid) {
      onSuccess();
    } else {
      setError('Thanh toán chưa hoàn tất. Vui lòng kiểm tra thẻ và thử lại.');
      setProcessing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe) return;

    setProcessing(true);
    setError('');

    if (!useNewCard && selectedCardId) {
      await confirmWithSavedCard();
      return;
    }

    await confirmWithNewCard();
  }

  const canSubmit =
    !processing &&
    !!stripe &&
    (useNewCard ? !!elements : !!selectedCardId);

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-summary glass-panel">
        <h2>Thẻ thanh toán</h2>
        <p className="checkout-plan-label">{PLAN_LABELS[plan]}</p>
        <p className="checkout-card-hint">
          Chọn thẻ đã lưu hoặc nhập thẻ Visa, Mastercard, JCB mới
        </p>
      </div>

      <div className="checkout-payment glass-panel">
        <h3>Phương thức thanh toán</h3>

        {cardsLoading ? (
          <p className="checkout-card-hint">Đang tải thẻ đã lưu...</p>
        ) : (
          savedCards.length > 0 && (
            <div className="checkout-saved-cards">
              <p className="checkout-saved-label">Thẻ đã lưu</p>
              <ul className="checkout-saved-list">
                {savedCards.map((card) => (
                  <li key={card.id}>
                    <label className="checkout-saved-option">
                      <input
                        type="radio"
                        name="saved-card"
                        checked={!useNewCard && selectedCardId === card.id}
                        onChange={() => {
                          setUseNewCard(false);
                          setSelectedCardId(card.id);
                          setError('');
                        }}
                      />
                      <span>
                        {brandLabel(card.brand)} •••• {card.last4}
                        <span className="checkout-saved-exp">
                          {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                        </span>
                        {card.isDefault && (
                          <span className="checkout-saved-default">Mặc định</span>
                        )}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <label className="checkout-saved-option checkout-saved-option--new">
                <input
                  type="radio"
                  name="saved-card"
                  checked={useNewCard}
                  onChange={() => {
                    setUseNewCard(true);
                    setError('');
                  }}
                />
                <span>+ Dùng thẻ mới</span>
              </label>
            </div>
          )
        )}

        {useNewCard && (
          <div className="checkout-new-card">
            <PaymentElement options={cardPaymentElementOptions} />
          </div>
        )}

        {error && <p className="checkout-error">{error}</p>}

        <div className="checkout-actions">
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
            className="btn btn-primary checkout-submit"
            disabled={!canSubmit}
          >
            {processing ? 'Đang xử lý...' : 'Xác nhận & thanh toán'}
          </button>
        </div>

        <p className="checkout-notice">
          🔒 Bảo mật qua Stripe · Hủy subscription bất kỳ lúc nào
        </p>
      </div>
    </form>
  );
}

export { PLAN_LABELS };
