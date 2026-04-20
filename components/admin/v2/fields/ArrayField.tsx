'use client';

import type { ReactNode } from 'react';

type Props<T> = {
  label: string;
  items: T[];
  renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
  addLabel?: string;
  emptyItem: () => T;
  onChange: (next: T[]) => void;
  hint?: string;
};

export default function ArrayField<T>({
  label,
  items,
  renderItem,
  addLabel = 'הוסף',
  emptyItem,
  onChange,
  hint,
}: Props<T>) {
  const update = (idx: number, next: T) => {
    const copy = [...items];
    copy[idx] = next;
    onChange(copy);
  };

  const add = () => onChange([...items, emptyItem()]);

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  const move = (idx: number, delta: number) => {
    const next = [...items];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="v2-field">
      <label className="v2-field-label">{label}</label>
      {hint && <p className="v2-field-hint">{hint}</p>}

      <div className="v2-array-list">
        {items.map((item, idx) => (
          <div key={idx} className="v2-array-item">
            <div className="v2-array-item-body">
              {renderItem(item, idx, (next) => update(idx, next))}
            </div>
            <div className="v2-array-item-actions">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="למעלה">↑</button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === items.length - 1} aria-label="למטה">↓</button>
              <button type="button" onClick={() => remove(idx)} aria-label="הסר">×</button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="v2-btn v2-btn-secondary" onClick={add}>
        + {addLabel}
      </button>
    </div>
  );
}
