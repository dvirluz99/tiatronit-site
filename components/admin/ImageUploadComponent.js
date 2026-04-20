'use client';

import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

/**
 * @typedef {object} ImageUploadComponentProps
 * @property {string} [subfolder]
 * @property {(url: string) => void} onUpload
 * @property {string} [currentImageUrl]
 * @property {string} [label]
 */

/** @param {ImageUploadComponentProps} props */
export default function ImageUploadComponent({ subfolder = '', onUpload, currentImageUrl = '', label = 'תמונה' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('נא לבחור קובץ תמונה.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const normalized = (subfolder || '').replace(/^AllDir\/?/, '').replace(/^\/+|\/+$/g, '').trim();
      const path = normalized ? `AllDir/${normalized}/${Date.now()}_${file.name}` : `AllDir/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onUpload(url);
    } catch (err) {
      setError(err.message || 'שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="cms-image-upload">
      {label && <label className="cms-label">{label}</label>}
      <div className="cms-image-upload-box">
        {currentImageUrl && (
          <div className="cms-image-preview">
            <img src={currentImageUrl} alt="תצוגה מקדימה" />
          </div>
        )}
        <div className="cms-image-upload-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="cms-file-input"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="cms-upload-btn"
          >
            {uploading ? 'מעלה...' : 'העלה תמונה'}
          </button>
        </div>
      </div>
      {error && <p className="cms-field-error">{error}</p>}
    </div>
  );
}
