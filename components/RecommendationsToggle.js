'use client';

import { useState } from 'react';
import { plainTextToHtml } from '../lib/recommendationContent';
import styles from './ShowRecommendations.module.css';

/**
 * Renders a collapsible grid of recommendation cards.
 * Default: `defaultCount` visible, "ראו עוד" / "סגור" toggle for the rest.
 * Consumes the same CSS module as ShowRecommendations to stay visually
 * identical to the existing cards.
 */
export default function RecommendationsToggle({ recommendations, defaultCount = 3 }) {
  const [expanded, setExpanded] = useState(false);

  const safe = Array.isArray(recommendations) ? recommendations.filter(Boolean) : [];
  if (safe.length === 0) return null;

  const visible = expanded ? safe : safe.slice(0, defaultCount);
  const hasMore = safe.length > defaultCount;

  return (
    <>
      <div className={styles.grid}>
        {visible.map((rec) => (
          <div key={rec.id} className={styles.card}>
            <div className="quote-icon">❝</div>
            <div
              className={styles.testiText}
              dangerouslySetInnerHTML={{ __html: plainTextToHtml(rec.content) }}
            />
            <div>
              <span className="testi-author">{rec.recommenderName}</span>
              <br />
              <span style={{ fontSize: '0.85rem', color: '#666' }}>{rec.recommenderRole}</span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className={styles.toggleWrap}>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
          >
            {expanded ? 'סגור' : 'ראו עוד'}
          </button>
        </div>
      )}
    </>
  );
}
