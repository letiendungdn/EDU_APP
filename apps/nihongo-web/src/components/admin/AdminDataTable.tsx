'use client';

import type { ReactNode } from 'react';
import './AdminComponents.css';

export interface AdminColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

interface AdminDataTableProps<T> {
  columns: AdminColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyText?: string;
  actions?: (row: T) => ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onToggleSelect?: (id: string | number) => void;
  onToggleSelectAll?: () => void;
}

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyText = 'Chưa có dữ liệu.',
  actions,
  selectable,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: AdminDataTableProps<T>) {
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selectedIds?.has(rowKey(r)));

  return (
    <div className="admin-dt-wrap">
      <table className="admin-dt">
        <thead>
          <tr>
            {selectable && (
              <th className="admin-dt__checkbox-col">
                <input
                  type="checkbox"
                  checked={!!allSelected}
                  onChange={() => onToggleSelectAll?.()}
                  aria-label="Chọn tất cả"
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
            {actions && <th className="admin-dt__actions-col">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="admin-dt__loading" colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
                Đang tải...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className="admin-dt__empty" colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const id = rowKey(row);
              return (
                <tr key={id}>
                  {selectable && (
                    <td>
                      <input
                        type="checkbox"
                        checked={!!selectedIds?.has(id)}
                        onChange={() => onToggleSelect?.(id)}
                        aria-label="Chọn dòng"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>{col.render(row)}</td>
                  ))}
                  {actions && (
                    <td className="admin-dt__actions-col">
                      <div className="admin-dt__actions">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
