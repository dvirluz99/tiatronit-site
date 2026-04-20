'use client';

import { useState } from 'react';
import ImageUploadComponent from '../../ImageUploadComponent';

type Props = {
  label: string;
  images: string[];
  onChange: (next: string[]) => void;
  subfolder?: string;
  hint?: string;
};

export default function GalleryField({ label, images, onChange, subfolder = 'general_photo', hint }: Props) {
  const [url, setUrl] = useState('');

  const add = (value: string) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrl('');
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const move = (idx: number, delta: number) => {
    const next = [...images];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="v2-field">
      <label className="v2-field-label">{label}</label>
      {hint && <p className="v2-field-hint">{hint}</p>}

      <div className="v2-gallery-grid">
        {images.map((src, idx) => (
          <div key={`${src}-${idx}`} className="v2-gallery-item">
            <img src={src} alt={`תמונה ${idx + 1}`} />
            <div className="v2-gallery-item-actions">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="הזז ימינה">→</button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === images.length - 1} aria-label="הזז שמאלה">←</button>
              <button type="button" onClick={() => remove(idx)} aria-label="הסר">×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="v2-gallery-add">
        <ImageUploadComponent subfolder={subfolder} onUpload={(u: string) => add(u)} label="העלאת תמונה" />
        <span className="v2-image-or">או קישור:</span>
        <input
          type="url"
          dir="ltr"
          className="v2-input v2-image-url-input"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="button" className="v2-btn v2-btn-secondary" onClick={() => add(url)}>
          הוסף
        </button>
      </div>
    </div>
  );
}
