'use client';

import { useState } from 'react';
import ImageUploadComponent from './ImageUploadComponent';

/**
 * עורך גלריית תמונות - מערך של אובייקטים { img: url }.
 * items / onChange כמו state: array of { img: string }
 * subfolder - תת-תיקייה להעלאה (למשל "shows" או "general_photo")
 */
export default function GalleryEditor({ items = [], onChange, subfolder = '', label = 'גלריית תמונות' }) {
  const [urlInput, setUrlInput] = useState('');
  const list = Array.isArray(items) ? items : [];
  const normalized = list.map((item) => (typeof item === 'string' ? { img: item } : { ...item, img: item.img || '' }));

  const addImage = (url) => {
    if (!url?.trim()) return;
    onChange([...normalized, { img: url.trim() }]);
  };

  const removeAt = (index) => {
    const next = normalized.filter((_, i) => i !== index);
    onChange(next);
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (url) {
      addImage(url);
      setUrlInput('');
    }
  };

  return (
    <div className="cms-gallery-editor">
      <label className="cms-label">{label}</label>
      <div className="cms-gallery-list">
        {normalized.map((item, index) => (
          <div key={index} className="cms-gallery-item">
            {item.img ? (
              <img src={item.img} alt="" />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#666' }}>
                ריק
              </div>
            )}
            <button type="button" className="cms-gallery-item-remove" onClick={() => removeAt(index)} aria-label="הסר">
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="cms-gallery-add">
        <ImageUploadComponent subfolder={subfolder} onUpload={addImage} label="" />
        <span style={{ fontSize: '0.85rem', color: '#555', alignSelf: 'center' }}>או קישור:</span>
        <input
          type="url"
          className="cms-input"
          placeholder="הדבק קישור לתמונה"
          style={{ maxWidth: '220px' }}
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addUrl();
            }
          }}
        />
        <button type="button" className="cms-btn cms-btn-secondary" onClick={addUrl}>
          הוסף
        </button>
      </div>
    </div>
  );
}
