'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cancelSubscription, requestSubscriptionRefund } from '@/api';
import { isSubscriptionEntitled } from '@/lib/subscription-utils';
import type { PaymentRecord, Subscription, SubscriptionPlanConfig } from '@/types/api';
import { ApiError } from '@/types/api';

const REFUND_DAYS = 7;

const STATUS_LABELS: Record<Subscription['status'], string> = {
  ACTIVE: 'Đang hoạt động',
  TRIALING: 'Dùng thử',
  PAST_DUE: 'Chờ thanh toán',
  CANCELED: 'Đã hủy',
  PAUSED: 'Tạm dừng',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function canRefundSubscription(payments: PaymentRecord[]): boolean {
  const latest = payments.find((p) => p.subscription && p.status === 'SUCCEEDED');
  if (!latest) return false;
  const days = (Date.now() - new Date(latest.createdAt).getTime()) / (24 * 3_600_000);
  return days <= REFUND_DAYS;
}

type CurrentSubscriptionCardProps = {
  subscription: Subscription;
  planConfig?: SubscriptionPlanConfig;
  payments: PaymentRecord[];
  token: string;
  syncing?: boolean;
  onUpdated: () => void | Promise<void>;
};

export default function CurrentSubscriptionCard({
  subscription,
  planConfig,
  payments,
  token,
  syncing = false,
  onUpdated,
}: CurrentSubscriptionCardProps) {
  const [loading, setLoading] = useState<'refund' | 'cancel' | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isSubscriptionEntitled(subscription) || subscription.plan === 'FREE') {
    return null;
  }

  const displayName = planConfig?.displayName ?? subscription.plan;
  const canRefund = canRefundSubscription(payments);
  const latestPayment = payments.find((p) => p.subscription && p.status === 'SUCCEEDED');
  const alreadyRefunded = payments.some(
    (p) => p.subscription && (p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED'),
  );

  async function handleRefund() {
    const ok = window.confirm(
      `Trả hàng / hoàn tiền gói ${displayName} (trong ${REFUND_DAYS} ngày) và hủy gói ngay?`,
    );
    if (!ok) return;
    const reason = window.prompt('Lý do trả hàng (tuỳ chọn):') ?? undefined;
    setLoading('refund');
    setError('');
    setMessage('');
    try {
      const result = await requestSubscriptionRefund(token, reason);
      setMessage(result.message);
      await onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Trả hàng thất bại');
    } finally {
      setLoading(null);
    }
  }

  async function handleCancelAtPeriodEnd() {
    const ok = window.confirm('Hủy gói vào cuối kỳ hiện tại? (không hoàn tiền)');
    if (!ok) return;
    setLoading('cancel');
    setError('');
    setMessage('');
    try {
      const res = await cancelSubscription(token);
      setMessage(res.message);
      await onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Hủy gói thất bại');
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className={`pricing-my-plan glass-panel${syncing ? ' pricing-my-plan--syncing' : ''}`}>
      <div className="pricing-my-plan-header">
        <div>
          <p className="pricing-my-plan-label">Gói đã mua</p>
          <h2 className="pricing-my-plan-name">{displayName}</h2>
        </div>
        <span className={`pricing-my-plan-status pricing-my-plan-status--${subscription.status.toLowerCase()}`}>
          {syncing ? 'Đang kích hoạt...' : STATUS_LABELS[subscription.status]}
        </span>
      </div>

      <dl className="pricing-my-plan-details">
        <div>
          <dt>Mã gói</dt>
          <dd>{subscription.plan}</dd>
        </div>
        <div>
          <dt>Kỳ hiện tại</dt>
          <dd>
            {formatDate(subscription.currentPeriodStart)} → {formatDate(subscription.currentPeriodEnd)}
          </dd>
        </div>
        {latestPayment && (
          <div>
            <dt>Thanh toán gần nhất</dt>
            <dd>{formatDate(latestPayment.createdAt)}</dd>
          </div>
        )}
        {subscription.cancelAtPeriodEnd && (
          <div>
            <dt>Ghi chú</dt>
            <dd>Sẽ hủy vào cuối kỳ</dd>
          </div>
        )}
      </dl>

      {error && <p className="pricing-my-plan-error">{error}</p>}
      {message && <p className="pricing-my-plan-success">{message}</p>}

      <div className="pricing-my-plan-actions">
        {canRefund && !alreadyRefunded && !syncing && (
          <button
            type="button"
            className="btn btn-outline pricing-refund-btn"
            disabled={loading !== null}
            onClick={() => void handleRefund()}
          >
            {loading === 'refund' ? 'Đang xử lý...' : 'Trả hàng & hoàn tiền'}
          </button>
        )}
        {!subscription.cancelAtPeriodEnd && !syncing && (
          <button
            type="button"
            className="btn btn-outline"
            disabled={loading !== null}
            onClick={() => void handleCancelAtPeriodEnd()}
          >
            {loading === 'cancel' ? 'Đang xử lý...' : 'Hủy cuối kỳ'}
          </button>
        )}
        <Link href="/payments" className="btn btn-outline">
          Lịch sử thanh toán
        </Link>
      </div>

      <p className="pricing-my-plan-policy">
        Trả hàng trong {REFUND_DAYS} ngày kể từ thanh toán — hoàn tiền toàn bộ và hủy gói ngay.
      </p>
    </section>
  );
}
