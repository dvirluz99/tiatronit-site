'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LABELS,
  ClipSchema,
  CustomerClipSchema,
  type Clip,
  type CustomerClip,
  type ClipLinkedTarget,
  type Show,
  type Category,
} from '../../../lib/schema';
import { listAll, saveValidated, removeDoc } from '../../../lib/firestore-v2';
import TextField from './fields/TextField';
import YouTubeIdField from './fields/YouTubeIdField';
import SelectField from './fields/SelectField';

const C = LABELS.common;

type Kind = 'clips' | 'customerClips';

const KIND_CONFIG = {
  clips: {
    collection: 'clips_v2',
    labels: LABELS.clip,
    schema: ClipSchema,
    idPrefix: 'clip',
    placeholderCaption: 'למשל: סצנת המסע של חוהלה',
  },
  customerClips: {
    collection: 'customer_clips_v2',
    labels: LABELS.customerClip,
    schema: CustomerClipSchema,
    idPrefix: 'cust',
    placeholderCaption: 'למשל: דבורה כהן – חט"ב חפץ חיים',
  },
} as const;

type Props = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

export default function ClipsLibraryTab({ showToast }: Props) {
  const [active, setActive] = useState<Kind>('clips');

  return (
    <div className="v2-pages-tab">
      <nav className="v2-subtabs">
        <button
          className={`v2-subtab ${active === 'clips' ? 'active' : ''}`}
          onClick={() => setActive('clips')}
        >
          {LABELS.clip._entityPlural}
        </button>
        <button
          className={`v2-subtab ${active === 'customerClips' ? 'active' : ''}`}
          onClick={() => setActive('customerClips')}
        >
          {LABELS.customerClip._entityPlural}
        </button>
      </nav>

      {active === 'clips' && <LibraryEditor key="clips" kind="clips" showToast={showToast} />}
      {active === 'customerClips' && (
        <LibraryEditor key="customerClips" kind="customerClips" showToast={showToast} />
      )}
    </div>
  );
}

type Mode = { kind: 'list' } | { kind: 'edit'; id: string } | { kind: 'new' };

type AnyClip = Clip | CustomerClip;

function emptyItem(): AnyClip {
  return { id: '', youtubeId: '', caption: '', linkedTarget: null };
}

// Encode/decode the linkedTarget for a single SelectField value of the form
// "show:p1" / "category:kids" / "" (general).
function encodeTarget(t: ClipLinkedTarget | null | undefined): string {
  if (!t) return '';
  return `${t.kind}:${t.id}`;
}
function decodeTarget(value: string): ClipLinkedTarget | null {
  if (!value) return null;
  const i = value.indexOf(':');
  if (i < 1) return null;
  const kind = value.slice(0, i);
  const id = value.slice(i + 1);
  if ((kind !== 'show' && kind !== 'category') || !id) return null;
  return { kind, id };
}

function nextId(existing: string[], prefix: string): string {
  const re = new RegExp(`^${prefix}(\\d+)$`);
  const max = existing
    .map((id) => {
      const m = id.match(re);
      return m ? parseInt(m[1], 10) : 0;
    })
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${max + 1}`;
}

function LibraryEditor({ kind, showToast }: { kind: Kind; showToast: Props['showToast'] }) {
  const cfg = KIND_CONFIG[kind];
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [items, setItems] = useState<Array<{ id: string; data: AnyClip }>>([]);
  const [shows, setShows] = useState<Array<{ id: string; data: Show }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; data: Category }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [list, showList, catList] = await Promise.all([
        listAll<AnyClip>(cfg.collection),
        listAll<Show>('shows_v2'),
        listAll<Category>('categories_v2').catch(() => [] as Array<{ id: string; data: Category }>),
      ]);
      setItems(list.sort((a, b) => a.id.localeCompare(b.id)));
      setShows(showList.sort((a, b) => a.id.localeCompare(b.id)));
      setCategories(catList.sort((a, b) => a.id.localeCompare(b.id)));
    } catch (e) {
      showToast('שגיאה בטעינה: ' + (e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [kind]);

  const showsById = useMemo(() => {
    const map: Record<string, Show> = {};
    for (const s of shows) map[s.id] = s.data;
    return map;
  }, [shows]);
  const categoriesById = useMemo(() => {
    const map: Record<string, Category> = {};
    for (const c of categories) map[c.id] = c.data;
    return map;
  }, [categories]);

  function describeTarget(t: ClipLinkedTarget | null | undefined): string | null {
    if (!t) return null;
    if (t.kind === 'show') {
      const title = showsById[t.id]?.title;
      const k = showsById[t.id]?.kind;
      const prefix = k === 'workshop' ? '🎭 ' : '📺 ';
      return prefix + (title || `הצגה לא נמצאה (${t.id})`);
    }
    if (t.kind === 'category') {
      return '🗂️ ' + (categoriesById[t.id]?.title || `קטגוריה לא נמצאה (${t.id})`);
    }
    return null;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        (i.data.caption || '').toLowerCase().includes(q) ||
        i.data.youtubeId.toLowerCase().includes(q),
    );
  }, [items, search]);

  const existingIds = items.map((i) => i.id);

  if (loading) return <p className="v2-empty">טוען...</p>;

  if (mode.kind === 'new' || mode.kind === 'edit') {
    const initial =
      mode.kind === 'new'
        ? { ...emptyItem(), id: nextId(existingIds, cfg.idPrefix) }
        : items.find((i) => i.id === mode.id)?.data || emptyItem();

    return (
      <ItemEditor
        cfg={cfg}
        initial={initial}
        isNew={mode.kind === 'new'}
        existingIds={existingIds}
        shows={shows}
        categories={categories}
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
        <h2>{cfg.labels._entityPlural}</h2>
        <div className="v2-list-actions">
          <input
            type="search"
            className="v2-input v2-search"
            placeholder="חיפוש לפי כותרת / מזהה / YouTube ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="v2-btn v2-btn-primary"
            onClick={() => setMode({ kind: 'new' })}
          >
            + {cfg.labels._entity}
          </button>
        </div>
      </div>

      <div className="v2-list-grid">
        {filtered.map(({ id, data }) => {
          const targetLabel = describeTarget(data.linkedTarget);
          return (
            <button
              key={id}
              type="button"
              className="v2-list-card"
              onClick={() => setMode({ kind: 'edit', id })}
            >
              <div className="v2-list-card-img">
                {data.youtubeId ? (
                  <img
                    src={`https://img.youtube.com/vi/${data.youtubeId}/mqdefault.jpg`}
                    alt=""
                  />
                ) : (
                  <div className="v2-list-card-empty">ללא תצוגה</div>
                )}
              </div>
              <div className="v2-list-card-meta">
                <div className="v2-list-card-title">{data.caption || 'ללא כותרת'}</div>
                <div className="v2-list-card-sub">
                  <span>{id}</span>
                  <span dir="ltr">{data.youtubeId || '—'}</span>
                </div>
                <div className="v2-list-card-sub">
                  {targetLabel ? (
                    <span className="v2-badge v2-badge-link">{targetLabel}</span>
                  ) : (
                    <span className="v2-badge v2-badge-muted">כללי</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="v2-empty">לא נמצאו פריטים</p>}
      </div>
    </div>
  );
}

function ItemEditor({
  cfg,
  initial,
  isNew,
  existingIds,
  shows,
  categories,
  showToast,
  onSaved,
  onCancel,
  onDeleted,
}: {
  cfg: (typeof KIND_CONFIG)[Kind];
  initial: AnyClip;
  isNew: boolean;
  existingIds: string[];
  shows: Array<{ id: string; data: Show }>;
  categories: Array<{ id: string; data: Category }>;
  showToast: Props['showToast'];
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [item, setItem] = useState<AnyClip>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const idError = useMemo(() => {
    if (!item.id.trim()) return 'שדה חובה';
    if (!/^[a-z0-9_-]+$/i.test(item.id))
      return 'מזהה יכול להכיל אותיות, מספרים, מקף או קו תחתון';
    if (isNew && existingIds.includes(item.id)) return 'מזהה קיים כבר';
    return errors.id;
  }, [item.id, isNew, existingIds, errors.id]);

  function set<K extends keyof AnyClip>(key: K, value: AnyClip[K]) {
    setItem((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  }

  async function save() {
    if (idError) {
      setErrors((prev) => ({ ...prev, id: idError }));
      showToast('יש שגיאה במזהה', 'error');
      return;
    }
    setSaving(true);
    try {
      const result = await saveValidated(cfg.collection, item.id, item, cfg.schema);
      if (!result.ok) {
        setErrors(result.errors);
        showToast('יש שגיאות בטופס', 'error');
        return;
      }
      showToast(isNew ? 'נוסף לספרייה' : 'נשמר');
      onSaved();
    } catch (e) {
      console.error('Save failed', e);
      showToast('שגיאה בשמירה: ' + ((e as Error)?.message || 'בעיה לא ידועה'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    setConfirmDelete(false);
    try {
      await removeDoc(cfg.collection, item.id);
      showToast('נמחק');
      onDeleted();
    } catch (e) {
      showToast('שגיאה במחיקה: ' + (e as Error).message, 'error');
    }
  }

  return (
    <div className="v2-editor v2-editor-single">
      <div className="v2-editor-form">
        <div className="v2-editor-header">
          <h2>{isNew ? `${cfg.labels._entity} חדש/ה` : `עריכת ${item.caption || item.id}`}</h2>
          <div className="v2-editor-actions">
            <button type="button" className="v2-btn v2-btn-secondary" onClick={onCancel}>
              {C.actions.cancel}
            </button>
            {!isNew && (
              <button
                type="button"
                className="v2-btn v2-btn-danger"
                onClick={() => setConfirmDelete(true)}
              >
                {C.actions.delete}
              </button>
            )}
            <button
              type="button"
              className="v2-btn v2-btn-primary"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'שומר...' : C.actions.save}
            </button>
          </div>
        </div>

        <section className="v2-section">
          <TextField
            label={cfg.labels.id}
            value={item.id}
            onChange={(v) => set('id', v.trim())}
            dir="ltr"
            hint={isNew ? `מזהה קצר באנגלית — ברירת מחדל: ${cfg.idPrefix} + מספר` : 'המזהה קבוע'}
            error={idError}
          />

          <YouTubeIdField
            label={cfg.labels.youtubeId}
            value={item.youtubeId}
            onChange={(v) => set('youtubeId', v)}
            error={errors.youtubeId}
            hint="הדביקי קישור מלא מ-YouTube — נחלץ אוטומטית את המזהה"
          />

          <TextField
            label={cfg.labels.caption}
            value={item.caption}
            onChange={(v) => set('caption', v)}
            placeholder={cfg.placeholderCaption}
            error={errors.caption}
          />

          <SelectField
            label={cfg.labels.linkedTarget}
            value={encodeTarget(item.linkedTarget)}
            onChange={(v) => set('linkedTarget', decodeTarget(v))}
            options={[
              { value: '', label: '— כללי —' },
              ...shows.map((s) => ({
                value: `show:${s.id}`,
                label: `${s.data.kind === 'workshop' ? '🎭' : '📺'} ${s.data.title || s.id}`,
              })),
              ...categories.map((c) => ({
                value: `category:${c.id}`,
                label: `🗂️ ${c.data.title || c.id}`,
              })),
            ]}
            error={errors.linkedTarget}
          />
        </section>

        {confirmDelete && (
          <div className="v2-modal-backdrop" onClick={() => setConfirmDelete(false)}>
            <div className="v2-modal" onClick={(e) => e.stopPropagation()}>
              <h3>למחוק "{item.caption || item.id}"?</h3>
              <p>
                הסרטון יוסר מהספרייה. אם הוא משויך כרגע להצגות הוא יוסר מהן בלי
                להציג שגיאה — אבל ההצגות עצמן לא ייפגעו.
              </p>
              <div className="v2-modal-actions">
                <button
                  className="v2-btn v2-btn-secondary"
                  onClick={() => setConfirmDelete(false)}
                >
                  {C.actions.cancel}
                </button>
                <button className="v2-btn v2-btn-danger" onClick={doDelete}>
                  {C.actions.delete}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
