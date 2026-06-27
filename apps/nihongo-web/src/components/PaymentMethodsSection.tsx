'use client';

import { useCallback, useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import {
  createPaymentMethodSetup,
  deletePaymentMethod,
  fetchPaymentMethods,
  setDefaultPaymentMethod,
} from '@/api';
import AddCardForm from '@/components/AddCardForm';
import { isStripeConfigured, buildStripeElementsOptions, stripePromise } from '@/lib/stripe-client';
import type { SavedCard } from '@/types/api';
import { ApiError } from '@/types/api';

type PaymentMethodsSectionProps = {
  token: string;
};

function brandLabel(brand: string): string {
  const map: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'Amex',
    jcb: 'JCB',
    discover: 'Discover',
    unionpay: 'UnionPay',
  };
  return map[brand.toLowerCase()] ?? brand.toUpperCase();
}

export default function PaymentMethodsSection({ token }: PaymentMethodsSectionProps) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPaymentMethods(token);
      setCards(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không tải được thẻ');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  async function openAddForm() {
    setShowAddForm(true);
    setSetupLoading(true);
    setError('');
    setClientSecret(null);
    try {
      const res = await createPaymentMethodSetup(token);
      setClientSecret(res.clientSecret);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không mở được form thẻ');
      setShowAddForm(false);
    } finally {
      setSetupLoading(false);
    }
  }

  function closeAddForm() {
    setShowAddForm(false);
    setClientSecret(null);
  }

  async function handleCardAdded() {
    setSuccess('Đã thêm thẻ thành công');
    closeAddForm();
    const data = await fetchPaymentMethods(token);
    if (data.length === 1 && !data[0].isDefault) {
      await setDefaultPaymentMethod(token, data[0].id);
    }
    await loadCards();
  }

  async function handleSetDefault(cardId: string) {
    setActionId(cardId);
    setError('');
    setSuccess('');
    try {
      const res = await setDefaultPaymentMethod(token, cardId);
      setSuccess(res.message);
      await loadCards();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cập nhật thất bại');
    } finally {
      setActionId(null);
    }
  }

  async function handleRemove(cardId: string) {
    if (!window.confirm('Xóa thẻ này khỏi tài khoản?')) return;
    setActionId(cardId);
    setError('');
    setSuccess('');
    try {
      await deletePaymentMethod(token, cardId);
      setSuccess('Đã xóa thẻ');
      await loadCards();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xóa thẻ thất bại');
    } finally {
      setActionId(null);
    }
  }

  if (!isStripeConfigured()) {
    return (
      <section className="profile-card glass-panel payment-methods">
        <h2>Thẻ thanh toán</h2>
        <p className="profile-meta">Stripe chưa được cấu hình trên frontend.</p>
      </section>
    );
  }

  return (
    <section className="profile-card glass-panel payment-methods">
      <div className="payment-methods-header">
        <div>
          <h2>Thẻ thanh toán</h2>
          <p className="profile-meta">Quản lý thẻ dùng cho subscription và coaching</p>
        </div>
        {!showAddForm && (
          <button type="button" className="btn btn-primary" onClick={() => void openAddForm()}>
            + Thêm thẻ
          </button>
        )}
      </div>

      {error && <p className="auth-error">{error}</p>}
      {success && <p className="auth-success">{success}</p>}

      {loading ? (
        <p className="profile-meta">Đang tải thẻ...</p>
      ) : cards.length === 0 && !showAddForm ? (
        <div className="payment-methods-empty">
          <p>Chưa có thẻ nào được lưu.</p>
          <button type="button" className="btn btn-outline" onClick={() => void openAddForm()}>
            Thêm thẻ đầu tiên
          </button>
        </div>
      ) : (
        <ul className="payment-methods-list">
          {cards.map((card) => (
            <li key={card.id} className="payment-method-item">
              <div className="payment-method-info">
                <span className="payment-method-brand">{brandLabel(card.brand)}</span>
                <span className="payment-method-number">•••• {card.last4}</span>
                <span className="payment-method-exp">
                  {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                </span>
                {card.isDefault && (
                  <span className="profile-badge payment-method-default">Mặc định</span>
                )}
              </div>
              <div className="payment-method-actions">
                {!card.isDefault && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={actionId === card.id}
                    onClick={() => void handleSetDefault(card.id)}
                  >
                    Đặt mặc định
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={actionId === card.id}
                  onClick={() => void handleRemove(card.id)}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showAddForm && (
        <div className="add-card-panel">
          <h3>Thêm thẻ mới</h3>
          {setupLoading && <p className="profile-meta">Đang mở form bảo mật...</p>}
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={buildStripeElementsOptions(clientSecret)}
            >
              <AddCardForm
                clientSecret={clientSecret}
                onSuccess={() => void handleCardAdded()}
                onCancel={closeAddForm}
              />
            </Elements>
          )}
        </div>
      )}

      <p className="payment-methods-note">🔒 Thông tin thẻ được mã hóa và xử lý bởi Stripe</p>
    </section>
  );
}
