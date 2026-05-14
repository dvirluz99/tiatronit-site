'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  aggregateImages,
  entityBadge,
  type LibraryImage,
} from '../../../../lib/imageLibrary';
import { listAll } from '../../../../lib/firestore-v2';
import type { Show, Category } from '../../../../lib/schema';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
  // Optional preloaded image library — passed by parent if it already has the data.
  preloaded?: LibraryImage[];
  // URL(s) currently selected in the field — shown as "✓ already used".
  currentValue?: string | string[];
  title?: string;
};

export default function ImagePickerModal({
  isOpen,
  onClose,
  onPick,
  preloaded,
  currentValue,
  title = 'בחירת תמונה קיימת',
}: Props) {
  const [images, setImages] = useState<LibraryImage[] | null>(preloaded ?? null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'shows' | 'categories'>('all');

  useEffect(() => {
    if (!isOpen) return;
    if (preloaded) {
      setImages(preloaded);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [shows, categories] = await Promise.all([
          listAll<Show>('shows_v2'),
          listAll<Category>('categories_v2').catch(() => []),
        ]);
        if (!cancelled) setImages(aggregateImages(shows, categories));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, preloaded]);

  const currentSet = useMemo(() => {
    const set = new Set<string>();
    if (typeof currentValue === 'string' && currentValue) set.add(currentValue);
    if (Array.isArray(currentValue)) currentValue.forEach((v) => v && set.add(v));
    return set;
  }, [currentValue]);

  const filtered = useMemo(() => {
    if (!images) return [];
    const q = search.trim().toLowerCase();
    return images.filter((img) => {
      if (filter === 'shows' && !img.usages.some((u) => u.entityKind === 'show')) return false;
      if (filter === 'categories' && !img.usages.some((u) => u.entityKind === 'category'))
        return false;
      if (!q) return true;
      return img.usages.some((u) => u.entityTitle.toLowerCase().includes(q));
    });
  }, [images, search, filter]);

  if (!isOpen) return null;

  return (
    <div className="v2-modal-backdrop" onClick={onClose}>
      <div
        className="v2-modal v2-image-picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="v2-image-picker-header">
          <h3>{title}</h3>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={onClose}>
            סגור
          </button>
        </div>

        <div className="v2-image-picker-controls">
          <input
            type="search"
            className="v2-input v2-search"
            placeholder="חיפוש לפי שם הצגה / קטגוריה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="v2-image-picker-filters">
            <button
              type="button"
              className={`v2-chip ${filter === 'all' ? 'v2-chip-on' : ''}`}
              onClick={() => setFilter('all')}
            >
              הכל ({images?.length || 0})
            </button>
            <button
              type="button"
              className={`v2-chip ${filter === 'shows' ? 'v2-chip-on' : ''}`}
              onClick={() => setFilter('shows')}
            >
              הצגות / סדנאות
            </button>
            <button
              type="button"
              className={`v2-chip ${filter === 'categories' ? 'v2-chip-on' : ''}`}
              onClick={() => setFilter('categories')}
            >
              קטגוריות
            </button>
          </div>
        </div>

        <div className="v2-image-picker-body">
          {loading && <p className="v2-empty">טוען תמונות...</p>}
          {!loading && filtered.length === 0 && (
            <p className="v2-empty">לא נמצאו תמונות</p>
          )}
          {!loading && filtered.length > 0 && (
            <div className="v2-image-picker-grid">
              {filtered.map((img) => {
                const isCurrent = currentSet.has(img.url);
                return (
                  <button
                    key={img.url}
                    type="button"
                    className={`v2-image-picker-card ${isCurrent ? 'is-current' : ''}`}
                    onClick={() => {
                      onPick(img.url);
                      onClose();
                    }}
                  >
                    <div className="v2-image-picker-thumb">
                      <img src={img.url} alt="" loading="lazy" />
                      {isCurrent && <span className="v2-image-picker-current">✓ בשימוש</span>}
                    </div>
                    <div className="v2-image-picker-meta">
                      <div className="v2-image-picker-count">
                        {img.usages.length === 1
                          ? 'במקום אחד'
                          : `ב־${img.usages.length} מקומות`}
                      </div>
                      <div className="v2-image-picker-usages">
                        {img.usages.slice(0, 3).map((u, i) => (
                          <span key={i} className="v2-image-picker-usage">
                            {entityBadge(u)} {u.entityTitle}
                          </span>
                        ))}
                        {img.usages.length > 3 && (
                          <span className="v2-image-picker-usage v2-image-picker-usage-more">
                            +{img.usages.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
