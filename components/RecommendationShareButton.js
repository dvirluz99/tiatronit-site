'use client';

import { useState } from 'react';

/**
 * Copy-current-URL button. Sits on the single-recommendation page so the
 * admin (or anyone) can grab the permalink and paste it into chat / email.
 */
export default function RecommendationShareButton({ className = '' }) {
  const [feedback, setFeedback] = useState(null);

  async function copy() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {
      // fall through to fallback
    }
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    setFeedback(ok ? 'הועתק!' : 'לא ניתן להעתיק');
    setTimeout(() => setFeedback(null), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`rec-share-btn ${className}`}
      aria-label="העתק קישור להמלצה"
    >
      📋 {feedback || 'העתק קישור'}
    </button>
  );
}
