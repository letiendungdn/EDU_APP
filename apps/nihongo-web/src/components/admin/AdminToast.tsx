'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import './AdminComponents.css';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastCtx {
  show: (message: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx>({ show: () => {} });

let nextId = 1;

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="admin-toast-stack">
        {items.map((t) => (
          <div key={t.id} className={`admin-toast admin-toast--${t.kind}`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useAdminToast() {
  return useContext(Ctx);
}
