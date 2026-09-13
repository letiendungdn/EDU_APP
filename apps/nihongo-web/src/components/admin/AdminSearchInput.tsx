'use client';

import { useEffect, useRef, useState } from 'react';
import './AdminComponents.css';

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  debounceMs = 350,
}: AdminSearchInputProps) {
  const [draft, setDraft] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setDraft(value), [value]);

  function handleChange(next: string) {
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), debounceMs);
  }

  return (
    <input
      type="search"
      className="admin-search-input"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
