'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LABELS,
  CategorySchema,
  type Category,
  type Show,
  type Clip,
  type CustomerClip,
  type Recommendation,
} from '../../../lib/schema';
import { listAll, saveValidated, removeDoc } from '../../../lib/firestore-v2';
import TextField from './fields/TextField';
import TextareaField from './fields/TextareaField';
import ImageField from './fields/ImageField';
import GalleryField from './fields/GalleryField';
import YouTubeIdField from './fields/YouTubeIdField';
import ArrayField from './fields/ArrayField';
import MultiSelectField from './fields/MultiSelectField';

type Mode = { kind: 'list' } | { kind: 'edit'; id: string } | { kind: 'new' };

const L = LABELS.category;
const C = LABELS.common;

function emptyCategory(): Category {
  return {
    id: '',
    title: '',
    description: '',
    mainImg: '',
    itemIds: [],
    trailers: [],
    clipIds: [],
    customerClipIds: [],
    recommendationIds: [],
    gallery: [],
    extendedHtml: '',
  };
}

function nextId(existing: string[]): string {
  const re = /^cat_(\d+)$/;
  const max = existing
    .map((id) => {
      const m = id.match(re);
      return m ? parseInt(m[1], 10) : 0;
    })
    .reduce((a, b) => Math.max(a, b), 0);
  return `cat_${max + 1}`;
}

type Props = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

export default function CategoriesTab({ showToast }: Props) {
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [cats, setCats] = useState<Array<{ id: string; data: Category }>>([]);
  const [shows, setShows] = useState<Array<{ id: string; data: Show }>>([]);
  const [clips, setClips] = useState<Array<{ id: string; data: Clip }>>([]);
  const [customerClips, setCustomerClips] = useState<Array<{ id: string; data: CustomerClip }>>([]);
  const [recs, setRecs] = useState<Array<{ id: string; data: Recommendation }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [c, s, cl, cc, r] = await Promise.all([
        listAll<Category>('categories_v2').catch(() => [] as Array<{ id: string; data: Category }>),
        listAll<Show>('shows_v2'),
        listAll<Clip>('clips_v2'),
        listAll<CustomerClip>('customer_clips_v2'),
        listAll<Recommendation>('recommendations_v2'),
      ]);
      setCats(c.sort((a, b) => a.id.localeCompare(b.id)));
      setShows(s.sort((a, b) => a.id.localeCompare(b.id)));
      setClips(cl.sort((a, b) => a.id.localeCompare(b.id)));
      setCustomerClips(cc.sort((a, b) => a.id.localeCompare(b.id)));
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
    if (!q) return cats;
    return cats.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        (c.data.title || '').toLowerCase().includes(q) ||
        (c.data.description || '').toLowerCase().includes(q),
    );
  }, [cats, search]);

  const existingIds = cats.map((c) => c.id);

  if (loading) return <p className="v2-empty">טוען...</p>;

  if (mode.kind === 'new' || mode.kind === 'edit') {
    const initial =
      mode.kind === 'new'
        ? { ...emptyCategory(), id: nextId(existingIds) }
        : cats.find((c) => c.id === mode.id)?.data || emptyCategory();

    return (
      <CategoryEditor
        initial={initial}
        isNew={mode.kind === 'new'}
        existingIds={existingIds}
        shows={shows}
        clips={clips}
        customerClips={customerClips}
        recs={recs}
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
            placeholder="חיפוש לפי כותרת / תיאור / מזהה..."
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
            className="v2-list-card"
            onClick={() => setMode({ kind: 'edit', id })}
          >
            <div className="v2-list-card-img">
              {data.mainImg ? (
                <img src={data.mainImg} alt="" />
              ) : (
                <div className="v2-list-card-empty">ללא תמונה</div>
              )}
            </div>
            <div className="v2-list-card-meta">
              <div className="v2-list-card-title">{data.title || 'ללא כותרת'}</div>
              <div className="v2-list-card-sub">
                <span>{id}</span>
                <span>{(data.itemIds || []).length} הצגות</span>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="v2-empty">לא נמצאו קטגוריות</p>}
      </div>
    </div>
  );
}

function CategoryEditor({
  initial,
  isNew,
  existingIds,
  shows,
  clips,
  customerClips,
  recs,
  showToast,
  onSaved,
  onCancel,
  onDeleted,
}: {
  initial: Category;
  isNew: boolean;
  existingIds: string[];
  shows: Array<{ id: string; data: Show }>;
  clips: Array<{ id: string; data: Clip }>;
  customerClips: Array<{ id: string; data: CustomerClip }>;
  recs: Array<{ id: string; data: Recommendation }>;
  showToast: Props['showToast'];
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [cat, setCat] = useState<Category>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const idError = useMemo(() => {
    if (!cat.id.trim()) return 'שדה חובה';
    if (!/^[a-z0-9_-]+$/i.test(cat.id))
      return 'מזהה יכול להכיל אותיות, מספרים, מקף או קו תחתון';
    if (isNew && existingIds.includes(cat.id)) return 'מזהה קיים כבר';
    return errors.id;
  }, [cat.id, isNew, existingIds, errors.id]);

  function set<K extends keyof Category>(key: K, value: Category[K]) {
    setCat((prev) => ({ ...prev, [key]: value }));
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
      const result = await saveValidated('categories_v2', cat.id, cat, CategorySchema);
      if (!result.ok) {
        setErrors(result.errors);
        showToast('יש שגיאות בטופס', 'error');
        return;
      }
      showToast(isNew ? 'הקטגוריה נוספה' : 'הקטגוריה נשמרה');
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
      await removeDoc('categories_v2', cat.id);
      showToast('הקטגוריה נמחקה');
      onDeleted();
    } catch (e) {
      showToast('שגיאה במחיקה: ' + (e as Error).message, 'error');
    }
  }

  const showOptions = shows.map((s) => ({
    value: s.id,
    label: `${s.data.kind === 'workshop' ? '🎭' : '📺'} ${s.data.title || s.id}`,
  }));
  const clipOptions = clips.map((c) => ({
    value: c.id,
    label: c.data.caption ? `${c.data.caption} (${c.id})` : c.id,
  }));
  const customerClipOptions = customerClips.map((c) => ({
    value: c.id,
    label: c.data.caption ? `${c.data.caption} (${c.id})` : c.id,
  }));
  const recOptions = recs.map((r) => ({
    value: r.id,
    label: `${r.data.recommenderName} — ${r.data.recommenderRole || r.id}`,
  }));

  return (
    <div className="v2-editor v2-editor-single">
      <div className="v2-editor-form">
        <div className="v2-editor-header">
          <h2>{isNew ? 'קטגוריה חדשה' : `עריכת ${cat.title || cat.id}`}</h2>
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
          <h3 className="v2-section-title">פרטים כלליים</h3>
          <TextField
            label={L.id}
            value={cat.id}
            onChange={(v) => set('id', v.trim())}
            dir="ltr"
            hint={isNew ? 'ברירת מחדל: cat_ + מספר' : 'המזהה קבוע'}
            error={idError}
          />
          <TextField
            label={L.title}
            value={cat.title}
            onChange={(v) => set('title', v)}
            error={errors.title}
          />
          <TextareaField
            label={L.description}
            value={cat.description}
            onChange={(v) => set('description', v)}
            rows={3}
          />
          <ImageField
            label={L.mainImg}
            value={cat.mainImg}
            onChange={(v) => set('mainImg', v)}
          />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">הצגות בקטגוריה</h3>
          <MultiSelectField
            label={L.itemIds}
            selected={cat.itemIds}
            options={showOptions}
            onChange={(next) => set('itemIds', next)}
            hint="הצגות וסדנאות שיופיעו ככרטיסיות בעמוד הקטגוריה. סדר הבחירה = סדר התצוגה."
            emptyText="אין הצגות במערכת"
          />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">סרטונים</h3>
          <ArrayField
            label={L.trailers}
            items={cat.trailers}
            emptyItem={() => ''}
            addLabel="טריילר"
            onChange={(next) => set('trailers', next)}
            renderItem={(item, idx, update) => (
              <YouTubeIdField label={`טריילר ${idx + 1}`} value={item} onChange={update} />
            )}
          />
          <MultiSelectField
            label={L.clipIds}
            selected={cat.clipIds}
            options={clipOptions}
            onChange={(next) => set('clipIds', next)}
            emptyText="ספריית הטעימות ריקה"
          />
          <MultiSelectField
            label={L.customerClipIds}
            selected={cat.customerClipIds}
            options={customerClipOptions}
            onChange={(next) => set('customerClipIds', next)}
            emptyText="ספריית אנשים מדברים ריקה"
          />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">המלצות וגלריה</h3>
          <MultiSelectField
            label={L.recommendationIds}
            selected={cat.recommendationIds}
            options={recOptions}
            onChange={(next) => set('recommendationIds', next)}
            emptyText="אין המלצות במערכת"
          />
          <GalleryField
            label={L.gallery}
            images={cat.gallery}
            onChange={(next) => set('gallery', next)}
          />
        </section>

        <section className="v2-section">
          <TextareaField
            label={L.extendedHtml}
            value={cat.extendedHtml}
            onChange={(v) => set('extendedHtml', v)}
            rows={6}
            hint="HTML עשיר שמופיע בעמוד הקטגוריה"
          />
        </section>

        {confirmDelete && (
          <div className="v2-modal-backdrop" onClick={() => setConfirmDelete(false)}>
            <div className="v2-modal" onClick={(e) => e.stopPropagation()}>
              <h3>למחוק את הקטגוריה "{cat.title}"?</h3>
              <p>
                הקטגוריה תוסר מהאתר. אם היא כרגע ברשימת דף הבית — העדכון ייכנס לתוקף
                אחרי השמירה הבאה של דף הבית.
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
