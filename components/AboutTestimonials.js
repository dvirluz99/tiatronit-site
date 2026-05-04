'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import styles from './AboutTestimonials.module.css';

export default function AboutTestimonials({ testimonials, defaultCount = 5 }) {
  const [expanded, setExpanded] = useState(false);

  const safe = Array.isArray(testimonials) ? testimonials.filter(Boolean) : [];
  if (safe.length === 0) return null;

  const visible = expanded ? safe : safe.slice(0, defaultCount);
  const hasMore = safe.length > defaultCount;
  const remaining = safe.length - defaultCount;

  return (
    <>
      <div className="testimonials-grid">
        {visible.map((item, index) => (
          <ScrollReveal
            key={`${item.recommendationId || ''}-${index}`}
            as="div"
            className="testimonial-mini-card"
            delay={Math.min((index % defaultCount) * 70, 420)}
          >
            <div className="quote-icon">❝</div>
            <p className="testi-text">{item.text}</p>
            <span className="testi-author">— {item.author}</span>

            {item.fromShowTitle && item.showId && (
              <Link href={`/show/${item.showId}`}>
                <span className="testi-from-Pres">{item.fromShowTitle}</span>
              </Link>
            )}

            {item.recommendationId && (
              <Link
                href={`/recommendation/${item.recommendationId}`}
                style={{ color: 'var(--c-accent-600)', fontWeight: 600, fontSize: 'var(--fs-sm)' }}
              >
                קראו את ההמלצה המלאה ←
              </Link>
            )}
          </ScrollReveal>
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
            {expanded ? 'סגור' : `ראו עוד (${remaining} נוספות)`}
          </button>
        </div>
      )}
    </>
  );
}
