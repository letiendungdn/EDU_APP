'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { adminRefundPayment } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys, useAdminPaymentsQuery, useAdminUsersQuery } from '@/hooks/queries';
import type { AdminPaymentRecord, PaymentStatus } from '@/types/api';
import { ApiError } from '@/types/api';
import './AdminPages.css';

const STATUS_OPTIONS: Array<{ value: '' | PaymentStatus; label: string }> = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'SUCCEEDED', label: 'Đã thanh toán' },
  { value: 'PENDING', label: 'Đang chờ' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
  { value: 'PARTIALLY_REFUNDED', label: 'Hoàn một phần' },
];

function formatMoney(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2);
  return currency === 'USD' ? `$${amount}` : `${amount} ${currency}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function statusLabel(status: PaymentStatus): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

function paymentDescription(p: AdminPaymentRecord): string {
  if (p.session) {
    const coach = p.session.coach?.user?.name ?? 'Coach';
    return `Coaching — ${coach}`;
  }
  if (p.subscription) {
    return `Gói ${p.subscription.plan}`;
  }
  return `Giao dịch #${p.id}`;
}

export default function AdminPaymentsPage() {
  const { token, logout } = useAuth();
  const queryClient = useQueryClient();

  const [userId, setUserId] = useState<number | ''>('');
  const [status, setStatus] = useState<'' | PaymentStatus>('');
  const [page, setPage] = useState(1);
  const [refundingId, setRefundingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const filters = {
    userId: userId === '' ? undefined : userId,
    status: status === '' ? undefined : status,
    page,
    limit: 30,
  };

  const { data: users } = useAdminUsersQuery();
  const { data, isLoading, isError, refetch, isFetching } = useAdminPaymentsQuery(filters);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  async function handleRefund(payment: AdminPaymentRecord) {
    if (!token) return;
    const ok = window.confirm(
      `Hoàn tiền giao dịch #${payment.id} (${formatMoney(payment.amountCents, payment.currency)}) cho ${payment.user.email}?`,
    );
    if (!ok) return;
    const reason = window.prompt('Lý do hoàn tiền (tuỳ chọn):') ?? undefined;
    const partial = window.prompt('Hoàn một phần (cent, để trống = toàn bộ):');
    const amountCents = partial?.trim() ? Number(partial) : undefined;

    setRefundingId(payment.id);
    setError('');
    setMessage('');
    try {
      const result = await adminRefundPayment(token, payment.id, {
        reason,
        amountCents: amountCents && amountCents > 0 ? amountCents : undefined,
      });
      setMessage(result.message);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      await refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Hoàn tiền thất bại');
    } finally {
      setRefundingId(null);
    }
  }

  return (
    <div className="admin-dashboard admin-dashboard--wide">
      <header className="admin-topbar glass-panel">
        <div>
          <h1>Thanh toán & hoàn tiền</h1>
          <p>
            <Link href="/admin">← Dashboard</Link> · Xem lịch sử theo user, trạng thái refund
          </p>
        </div>
        <div className="admin-topbar-actions">
          <Link href="/admin/messages" className="btn btn-outline">
            Tin nhắn
          </Link>
          <button type="button" className="btn btn-outline" onClick={() => void refetch()}>
            {isFetching ? 'Đang tải...' : 'Làm mới'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              void logout();
            }}
          >
            Đăng xuất
          </button>
          <Link href="/" className="btn btn-primary">
            App học
          </Link>
        </div>
      </header>

      <section className="glass-panel admin-filters">
        <label>
          User
          <select
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value ? Number(e.target.value) : '');
              setPage(1);
            }}
          >
            <option value="">Tất cả users</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ? `${u.name} · ` : ''}
                {u.email}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as '' | PaymentStatus);
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-filters-meta">
          {data ? `${data.total} giao dịch` : '—'}
        </div>
      </section>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {message && <div className="admin-alert admin-alert--success">{message}</div>}

      {isLoading ? (
        <div className="empty-state glass-panel">
          <p>Đang tải lịch sử thanh toán...</p>
        </div>
      ) : isError ? (
        <div className="empty-state glass-panel">
          <p>Không tải được dữ liệu. Kiểm tra quyền admin.</p>
        </div>
      ) : (
        <section className="glass-panel admin-recent">
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--payments">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Mô tả</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Hoàn tiền</th>
                  <th>Ngày</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="admin-table-empty">
                      Chưa có giao dịch phù hợp bộ lọc.
                    </td>
                  </tr>
                )}
                {data?.items.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>
                      <div className="admin-user-cell">
                        <strong>{p.user.name ?? '—'}</strong>
                        <span>{p.user.email}</span>
                      </div>
                    </td>
                    <td>{paymentDescription(p)}</td>
                    <td>{formatMoney(p.amountCents, p.currency)}</td>
                    <td>
                      <span className={`admin-status admin-status--${p.status.toLowerCase()}`}>
                        {statusLabel(p.status)}
                      </span>
                    </td>
                    <td>
                      {p.refundAmountCents != null ? (
                        <div className="admin-refund-cell">
                          <span>{formatMoney(p.refundAmountCents, p.currency)}</span>
                          {p.refundedAt && <span>{formatDate(p.refundedAt)}</span>}
                          {p.refundReason && <span className="admin-refund-reason">{p.refundReason}</span>}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>
                      {p.status === 'SUCCEEDED' && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          disabled={refundingId === p.id}
                          onClick={() => void handleRefund(p)}
                        >
                          {refundingId === p.id ? '...' : 'Hoàn tiền'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                type="button"
                className="btn btn-outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span>
                Trang {page} / {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau →
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
