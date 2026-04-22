'use client';

type Option = { value: string; label: string };

type Props = {
  label: string;
  selected: string[];
  options: Option[];
  onChange: (next: string[]) => void;
  hint?: string;
  emptyText?: string;
};

export default function MultiSelectField({
  label,
  selected,
  options,
  onChange,
  hint,
  emptyText = 'לא נבחרו פריטים',
}: Props) {
  // Be defensive: legacy docs from Firestore may not have the array field at
  // all (undefined). Treat missing as empty so the component never crashes.
  const current = Array.isArray(selected) ? selected : [];

  const toggle = (value: string) => {
    if (current.includes(value)) {
      onChange(current.filter((v) => v !== value));
    } else {
      onChange([...current, value]);
    }
  };

  return (
    <div className="v2-field">
      <label className="v2-field-label">{label}</label>
      {hint && <p className="v2-field-hint">{hint}</p>}
      <div className="v2-multi-select">
        {options.length === 0 ? (
          <p className="v2-empty">{emptyText}</p>
        ) : (
          options.map((o) => {
            const isOn = current.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                className={`v2-chip ${isOn ? 'v2-chip-on' : ''}`}
                onClick={() => toggle(o.value)}
              >
                {o.label}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
