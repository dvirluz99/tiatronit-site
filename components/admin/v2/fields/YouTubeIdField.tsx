'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { extractYoutubeId } from '../../../../lib/schema';

type Props = {
  label: string;
  value: string;
  onChange: (normalized: string) => void;
  hint?: string;
  error?: string;
};

// Accepts a YouTube URL, embed URL, or raw ID. Stores the raw 11-char ID.
export default function YouTubeIdField({ label, value, onChange, hint, error }: Props) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function handleBlur() {
    const id = extractYoutubeId(draft.trim());
    if (id && id !== value) onChange(id);
    else if (!id && draft.trim() === '') onChange('');
  }

  const thumb = value ? `https://img.youtube.com/vi/${value}/mqdefault.jpg` : null;

  return (
    <div className="v2-field">
      <label className="v2-field-label">{label}</label>
      {hint && <p className="v2-field-hint">{hint}</p>}
      <div className="v2-youtube-row">
        <input
          className={`v2-input ${error ? 'v2-input-error' : ''}`}
          value={draft ?? ''}
          placeholder="מזהה או קישור YouTube"
          dir="ltr"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
          onBlur={handleBlur}
        />
        {thumb && (
          <a
            className="v2-youtube-thumb"
            href={`https://youtu.be/${value}`}
            target="_blank"
            rel="noreferrer"
          >
            <img src={thumb} alt="תצוגה" />
          </a>
        )}
      </div>
      {error && <p className="v2-field-error">{error}</p>}
    </div>
  );
}
