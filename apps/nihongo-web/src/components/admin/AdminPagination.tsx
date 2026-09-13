'use client';

import './AdminComponents.css';

interface AdminPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({ page, limit, total, onPageChange }: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="admin-dt-pagination">
      <span>
        {from}–{to} / {total}
      </span>
      <div className="admin-dt-pagination__pages">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Trước
        </button>
        <span>
          Trang {page}/{totalPages}
        </span>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
