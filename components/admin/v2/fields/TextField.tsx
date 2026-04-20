'use client';

import type { ChangeEvent } from 'react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  dir?: 'rtl' | 'ltr';
  type?: 'text' | 'tel' | 'email' | 'url';
};

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  dir,
  type = 'text',
}: Props) {
  return (
    <div className="v2-field">
      <label className="v2-field-label">{label}</label>
      {hint && <p className="v2-field-hint">{hint}</p>}
      <input
        type={type}
        className={`v2-input ${error ? 'v2-input-error' : ''}`}
        value={value ?? ''}
        placeholder={placeholder}
        dir={dir}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      {error && <p className="v2-field-error">{error}</p>}
    </div>
  );
}
