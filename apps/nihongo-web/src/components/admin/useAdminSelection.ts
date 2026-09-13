import { useCallback, useState } from 'react';

export function useAdminSelection<T extends string | number>() {
  const [selected, setSelected] = useState<Set<T>>(new Set());

  const toggle = useCallback((id: T) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: T[]) => {
    setSelected((prev) => (prev.size === ids.length && ids.every((id) => prev.has(id)) ? new Set() : new Set(ids)));
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, toggle, toggleAll, clear };
}
