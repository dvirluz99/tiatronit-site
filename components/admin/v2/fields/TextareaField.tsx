'use client';

import type { ChangeEvent } from 'react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  error?: string;
};

export default function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
  error,
}: Props) {
  return (
    <div className="v2-field">
      <label className="v2-field-label">{label}</label>
      {hint && <p className="v2-field-hint">{hint}</p>}
      <textarea
        className={`v2-textarea ${error ? 'v2-input-error' : ''}`}
        value={value ?? ''}
        placeholder={placeholder}
        rows={rows}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      />
      {error && <p className="v2-field-error">{error}</p>}
    </div>
  );
}
