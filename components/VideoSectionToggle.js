'use client';

import { useState } from 'react';
import styles from './VideoSectionToggle.module.css';

export default function VideoSectionToggle({
  videos,
  title,
  defaultCount = 2,
}) {
  const [expanded, setExpanded] = useState(false);

  const safe = Array.isArray(videos)
    ? videos.filter((v) => v && typeof v.youtubeId === 'string' && v.youtubeId.length > 0)
    : [];

  if (safe.length === 0) return null;

  const visible = expanded ? safe : safe.slice(0, defaultCount);
  const hasMore = safe.length > defaultCount;

  return (
    <section className={styles.section}>
      {title && <h3 className={styles.title}>{title}</h3>}

      <div className={`${styles.grid} ${expanded ? styles.gridExpanded : styles.gridCollapsed}`}>
        {visible.map((v, i) => (
          <div key={`${v.youtubeId}-${i}`} className={styles.card}>
            <div className={styles.videoWrap}>
              <iframe
                src={`https://www.youtube.com/embed/${v.youtubeId}`}
                title={v.caption || title || 'סרטון'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
            {v.caption && <p className={styles.caption}>{v.caption}</p>}
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
    </section>
  );
}
