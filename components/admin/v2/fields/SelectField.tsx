'use client';

import type { ChangeEvent } from 'react';

type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  hint?: string;
  error?: string;
};

export default function SelectField({ label, value, onChange, options, hint, error }: Props) {
  return (
    <div className="v2-field">
      <label className="v2-field-label">{label}</label>
      {hint && <p className="v2-field-hint">{hint}</p>}
      <select
        className={`v2-select ${error ? 'v2-input-error' : ''}`}
        value={value ?? ''}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="v2-field-error">{error}</p>}
    </div>
  );
}
