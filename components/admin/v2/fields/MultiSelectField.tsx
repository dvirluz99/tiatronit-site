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
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
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
            const isOn = selected.includes(o.value);
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
