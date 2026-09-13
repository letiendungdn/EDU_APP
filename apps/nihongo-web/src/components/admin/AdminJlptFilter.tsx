'use client';

import './AdminComponents.css';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type JlptLevelFilter = (typeof LEVELS)[number] | '';

interface AdminJlptFilterProps {
  value: JlptLevelFilter;
  onChange: (value: JlptLevelFilter) => void;
}

export function AdminJlptFilter({ value, onChange }: AdminJlptFilterProps) {
  return (
    <div className="admin-jlpt-filter">
      <button
        type="button"
        className={`admin-jlpt-filter__btn ${value === '' ? 'active' : ''}`}
        onClick={() => onChange('')}
      >
        Mọi cấp
      </button>
      {LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          className={`admin-jlpt-filter__btn ${value === level ? 'active' : ''}`}
          onClick={() => onChange(level)}
        >
          {level}
        </button>
      ))}
    </div>
  );
}
