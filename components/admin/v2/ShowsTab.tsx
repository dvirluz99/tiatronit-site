'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Show, Recommendation } from '../../../lib/schema';
import { LABELS } from '../../../lib/schema';
import { listAll } from '../../../lib/firestore-v2';
import ShowForm from './ShowForm';

type Mode = { kind: 'list' } | { kind: 'edit'; id: string } | { kind: 'new' };

const L = LABELS.show;
const C = LABELS.common;

function emptyShow(): Show {
  return {
    id: '',
    title: '',
    category: 'adults',
    priority: 'normal',
    mainImg: '',
    presentationFormats: [],
    gallery: [],
    description: '',
    audience: '',
    creatorName: 'רונית לוז',
    creatorIntro: 'ההצגה מועברת ע"י,',
    creatorCredentials: 'יועצת חינוכית, מטפלת CBT, ויוצרת תיאטרונית – תיאטרון בובות רגשי-חברתי.',
    socialProof: '',
    phone: '0542043429',
    video: { trailers: [], clips: [], customerClips: [] },
    recommendationIds: [],
  };
}

function nextShowId(existing: string[]): string {
  const max = existing
    .filter((id) => /^p\d+$/.test(id))
    .map((id) => parseInt(id.slice(1), 10))
    .reduce((a, b) => Math.max(a, b), 0);
  return `p${max + 1}`;
}

type Props = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

export default function ShowsTab({ showToast }: Props) {
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [shows, setShows] = useState<Array<{ id: string; data: Show }>>([]);
  const [recs, setRecs] = useState<Array<{ id: string; data: Recommendation }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        listAll<Show>('shows_v2'),
        listAll<Recommendation>('recommendations_v2'),
      ]);
      setShows(s.sort((a, b) => a.id.localeCompare(b.id)));
      setRecs(r.sort((a, b) => a.id.localeCompare(b.id)));
    } catch (e) {
      showToast('שגיאה בטעינה: ' + (e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shows;
    return shows.filter(
      (s) => s.id.toLowerCase().includes(q) || (s.data.title || '').toLowerCase().includes(q),
    );
  }, [shows, search]);

  const existingIds = shows.map((s) => s.id);

  if (loading) return <p className="v2-empty">טוען...</p>;

  if (mode.kind === 'new') {
    const initial = emptyShow();
    initial.id = nextShowId(existingIds);
    return (
      <ShowForm
        initial={initial}
        isNew
        existingIds={existingIds}
        recommendations={recs}
        showToast={showToast}
        onSaved={() => {
          load();
          setMode({ kind: 'list' });
        }}
        onCancel={() => setMode({ kind: 'list' })}
        onDeleted={() => setMode({ kind: 'list' })}
      />
    );
  }

  if (mode.kind === 'edit') {
    const current = shows.find((s) => s.id === mode.id);
    if (!current) {
      return <p>ההצגה לא נמצאה</p>;
    }
    return (
      <ShowForm
        initial={current.data}
        isNew={false}
        existingIds={existingIds}
        recommendations={recs}
        showToast={showToast}
        onSaved={() => {
          load();
          setMode({ kind: 'list' });
        }}
        onCancel={() => setMode({ kind: 'list' })}
        onDeleted={() => {
          load();
          setMode({ kind: 'list' });
        }}
      />
    );
  }

  return (
    <div className="v2-list-pane">
      <div className="v2-list-header">
        <h2>{L._entityPlural}</h2>
        <div className="v2-list-actions">
          <input
            type="search"
            className="v2-input v2-search"
            placeholder="חיפוש לפי כותרת או מזהה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="v2-btn v2-btn-primary"
            onClick={() => setMode({ kind: 'new' })}
          >
            + {L._entity} חדשה
          </button>
        </div>
      </div>

      <div className="v2-list-grid">
        {filtered.map(({ id, data }) => (
          <button
            key={id}
            type="button"
            className={`v2-list-card ${data.priority === 'featured' ? 'v2-list-card-featured' : ''}`}
            onClick={() => setMode({ kind: 'edit', id })}
          >
            <div className="v2-list-card-img">
              {data.mainImg || data.presentationFormats?.[0]?.image ? (
                <img src={data.mainImg || data.presentationFormats[0].image} alt="" />
              ) : (
                <div className="v2-list-card-empty">ללא תמונה</div>
              )}
            </div>
            <div className="v2-list-card-meta">
              <div className="v2-list-card-title">{data.title || 'ללא כותרת'}</div>
              <div className="v2-list-card-sub">
                <span>{id}</span>
                <span>{C.categoryOptions[data.category as keyof typeof C.categoryOptions]}</span>
                {data.priority === 'featured' && <span className="v2-badge v2-badge-featured">מומלץ</span>}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="v2-empty">לא נמצאו הצגות</p>}
      </div>
    </div>
  );
}
