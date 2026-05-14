'use client';

import { useState } from 'react';
import ImageUploadComponent from '../../ImageUploadComponent';
import ImagePickerModal from './ImagePickerModal';
import type { LibraryImage } from '../../../../lib/imageLibrary';

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  subfolder?: string;
  hint?: string;
  error?: string;
  // If provided, the picker uses this pre-aggregated list instead of fetching.
  imageLibrary?: LibraryImage[];
};

export default function ImageField({
  label,
  value,
  onChange,
  subfolder = 'general_photo',
  hint,
  error,
  imageLibrary,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="v2-field">
      <label className="v2-field-label">{label}</label>
      {hint && <p className="v2-field-hint">{hint}</p>}

      <div className="v2-image-field">
        {value && (
          <div className="v2-image-preview">
            <img src={value} alt="" />
            <button type="button" className="v2-image-remove" onClick={() => onChange('')} aria-label="הסר">
              ×
            </button>
          </div>
        )}
        <div className="v2-image-actions">
          <ImageUploadComponent
            subfolder={subfolder}
            onUpload={(url: string) => onChange(url)}
            label=""
          />
          <button
            type="button"
            className="v2-btn v2-btn-secondary"
            onClick={() => setPickerOpen(true)}
          >
            בחרי מתמונות קיימות
          </button>
          <div className="v2-image-or">או הדבק קישור:</div>
          <input
            type="url"
            dir="ltr"
            className="v2-input v2-image-url-input"
            placeholder="https://..."
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="v2-field-error">{error}</p>}

      <ImagePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={onChange}
        preloaded={imageLibrary}
        currentValue={value}
        title={`${label} — בחרי תמונה קיימת`}
      />
    </div>
  );
}
