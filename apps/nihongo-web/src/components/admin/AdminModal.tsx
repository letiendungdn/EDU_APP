'use client';

import { useEffect, type ReactNode } from 'react';
import './AdminComponents.css';

interface AdminModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function AdminModal({ open, title, onClose, children, footer }: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal glass-panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="admin-modal__header">
          <span className="admin-modal__title">{title}</span>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="admin-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

interface AdminConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdminConfirmDialog({
  open,
  title = 'Xác nhận',
  message,
  confirmLabel = 'Xoá',
  danger = true,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Huỷ
          </button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{message}</p>
    </AdminModal>
  );
}
