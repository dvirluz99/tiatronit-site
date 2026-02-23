'use client';

import { useEffect } from 'react';

/**
 * הודעת Toast - הצלחה (success) או שגיאה (error).
 * נעלמת אוטומטית אחרי duration ms.
 */
export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div
      className={`cms-toast cms-toast--${type}`}
      role="alert"
      aria-live="polite"
    >
      <span className="cms-toast-icon">
        {type === 'success' ? '✓' : '!'}
      </span>
      <span className="cms-toast-message">{message}</span>
      <button
        type="button"
        className="cms-toast-close"
        onClick={onClose}
        aria-label="סגור"
      >
        ×
      </button>
    </div>
  );
}
