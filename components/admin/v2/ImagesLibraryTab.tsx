'use client';

import { useEffect, useMemo, useState } from 'react';
import { listAll } from '../../../lib/firestore-v2';
import type { Show, Category } from '../../../lib/schema';
import {
  aggregateImages,
  describeUsage,
  entityBadge,
  type LibraryImage,
} from '../../../lib/imageLibrary';

type Filter = 'all' | 'shows' | 'categories' | 'shared';

type Props = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

export default function ImagesLibraryTab({ showToast }: Props) {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [detail, setDetail] = useState<LibraryImage | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [shows, categories] = await Promise.all([
        listAll<Show>('shows_v2'),
        listAll<Category>('categories_v2').catch(() => []),
      ]);
      setImages(aggregateImages(shows, categories));
    } catch (e) {
      showToast('שגיאה בטעינת התמונות: ' + (e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const shows = images.filter((i) => i.usages.some((u) => u.entityKind === 'show')).length;
    const cats = images.filter((i) => i.usages.some((u) => u.entityKind === 'category')).length;
    const shared = images.filter((i) => i.usages.length >= 2).length;
    return { all: images.length, shows, cats, shared };
  }, [images]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return images.filter((img) => {
      if (filter === 'shows' && !img.usages.some((u) => u.entityKind === 'show')) return false;
      if (filter === 'categories' && !img.usages.some((u) => u.entityKind === 'category'))
        return false;
      if (filter === 'shared' && img.usages.length < 2) return false;
      if (!q) return true;
      return img.usages.some((u) => u.entityTitle.toLowerCase().includes(q));
    });
  }, [images, search, filter]);

  if (loading) return <p className="v2-empty">טוען...</p>;

  return (
    <div className="v2-list-pane">
      <div className="v2-list-header">
        <h2>ספריית תמונות</h2>
        <div className="v2-list-actions">
          <input
            type="search"
            className="v2-input v2-search"
            placeholder="חיפוש לפי שם הצגה / קטגוריה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="v2-btn v2-btn-secondary" onClick={load}>
            רענון
          </button>
        </div>
      </div>

      <div className="v2-images-filters">
        <button
          type="button"
          className={`v2-chip ${filter === 'all' ? 'v2-chip-on' : ''}`}
          onClick={() => setFilter('all')}
        >
          הכל ({counts.all})
        </button>
        <button
          type="button"
          className={`v2-chip ${filter === 'shows' ? 'v2-chip-on' : ''}`}
          onClick={() => setFilter('shows')}
        >
          בהצגות / סדנאות ({counts.shows})
        </button>
        <button
          type="button"
          className={`v2-chip ${filter === 'categories' ? 'v2-chip-on' : ''}`}
          onClick={() => setFilter('categories')}
        >
          בקטגוריות ({counts.cats})
        </button>
        <button
          type="button"
          className={`v2-chip ${filter === 'shared' ? 'v2-chip-on' : ''}`}
          onClick={() => setFilter('shared')}
        >
          בכמה מקומות ({counts.shared})
        </button>
      </div>

      <p className="v2-field-hint" style={{ marginInline: 'var(--sp-4, 1rem)' }}>
        {filtered.length} תמונות מוצגות. סך הכל {images.length} תמונות ייחודיות במסד הנתונים.
      </p>

      {filtered.length === 0 ? (
        <p className="v2-empty">לא נמצאו תמונות</p>
      ) : (
        <div className="v2-list-grid">
          {filtered.map((img) => (
            <button
              key={img.url}
              type="button"
              className="v2-list-card v2-image-library-card"
              onClick={() => setDetail(img)}
            >
              <div className="v2-list-card-img">
                <img src={img.url} alt="" loading="lazy" />
              </div>
              <div className="v2-list-card-meta">
                <div className="v2-list-card-title">
                  {img.usages.length === 1
                    ? img.usages[0].entityTitle
                    : `${img.usages.length} שימושים`}
                </div>
                <div className="v2-list-card-sub">
                  {img.usages.slice(0, 2).map((u, i) => (
                    <span key={i} className="v2-badge v2-badge-link">
                      {entityBadge(u)} {u.entityTitle}
                    </span>
                  ))}
                  {img.usages.length > 2 && (
                    <span className="v2-badge v2-badge-muted">+{img.usages.length - 2}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {detail && (
        <div className="v2-modal-backdrop" onClick={() => setDetail(null)}>
          <div
            className="v2-modal v2-image-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="v2-image-detail-header">
              <h3>פרטי התמונה</h3>
              <button
                type="button"
                className="v2-btn v2-btn-secondary"
                onClick={() => setDetail(null)}
              >
                סגור
              </button>
            </div>

            <div className="v2-image-detail-body">
              <div className="v2-image-detail-preview">
                <img src={detail.url} alt="" />
              </div>
              <div className="v2-image-detail-info">
                <p className="v2-field-hint">
                  בשימוש ב־{detail.usages.length} מקומות
                </p>
                <ul className="v2-image-detail-list">
                  {detail.usages.map((u, i) => (
                    <li key={i} className="v2-image-detail-usage">
                      <span className="v2-image-detail-usage-badge">{entityBadge(u)}</span>
                      <span className="v2-image-detail-usage-title">{u.entityTitle}</span>
                      <span className="v2-image-detail-usage-field">{describeUsage(u)}</span>
                      <code className="v2-image-detail-usage-id">{u.entityId}</code>
                    </li>
                  ))}
                </ul>
                <p className="v2-field-hint" style={{ marginTop: 'var(--sp-4, 1rem)' }}>
                  קישור:
                </p>
                <input
                  type="text"
                  dir="ltr"
                  className="v2-input"
                  value={detail.url}
                  readOnly
                  onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
