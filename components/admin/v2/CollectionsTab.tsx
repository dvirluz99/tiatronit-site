'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LABELS,
  CollectionSchema,
  type Collection,
  type Show,
  type Recommendation,
} from '../../../lib/schema';
import { listAll, saveValidated, removeDoc } from '../../../lib/firestore-v2';
import TextField from './fields/TextField';
import TextareaField from './fields/TextareaField';
import SelectField from './fields/SelectField';
import ImageField from './fields/ImageField';
import GalleryField from './fields/GalleryField';
import YouTubeIdField from './fields/YouTubeIdField';
import ArrayField from './fields/ArrayField';
import MultiSelectField from './fields/MultiSelectField';

type Mode = { kind: 'list' } | { kind: 'edit'; id: string } | { kind: 'new' };

const L = LABELS.collection;
const C = LABELS.common;

function emptyCollection(): Collection {
  return {
    id: '',
    title: '',
    description: '',
    extendedHtml: '',
    mainImg: '',
    priority: 'normal',
    gallery: [],
    videos: [],
    recommendationIds: [],
    type: 'single',
    linkedShowId: '',
  } as Collection;
}

function nextCardId(existing: string[]): string {
  const max = existing
    .filter((id) => /^card_\d+$/.test(id))
    .map((id) => parseInt(id.slice(5), 10))
    .reduce((a, b) => Math.max(a, b), 0);
  return `card_${max + 1}`;
}

type Props = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

export default function CollectionsTab({ showToast }: Props) {
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [cards, setCards] = useState<Array<{ id: string; data: Collection }>>([]);
  const [shows, setShows] = useState<Array<{ id: string; data: Show }>>([]);
  const [recs, setRecs] = useState<Array<{ id: string; data: Recommendation }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        (c.data.title || '').toLowerCase().includes(q) ||
        (c.data.description || '').toLowerCase().includes(q),
    );
  }, [cards, search]);

  async function load() {
    setLoading(true);
    try {
      const [c, s, r] = await Promise.all([
        listAll<Collection>('collections_v2'),
        listAll<Show>('shows_v2'),
        listAll<Recommendation>('recommendations_v2'),
      ]);
      setCards(c.sort((a, b) => a.id.localeCompare(b.id)));
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

  if (loading) return <p className="v2-empty">טוען...</p>;

  if (mode.kind === 'new' || mode.kind === 'edit') {
    const initial = mode.kind === 'new'
      ? { ...emptyCollection(), id: nextCardId(cards.map((c) => c.id)) }
      : cards.find((c) => c.id === mode.id)?.data || emptyCollection();

    return (
      <CollectionEditor
        initial={initial}
        isNew={mode.kind === 'new'}
        existingIds={cards.map((c) => c.id)}
        shows={shows}
        recs={recs}
        showToast={showToast}
        onSaved={() => { load(); setMode({ kind: 'list' }); }}
        onCancel={() => setMode({ kind: 'list' })}
        onDeleted={() => { load(); setMode({ kind: 'list' }); }}
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
          <button type="button" className="v2-btn v2-btn-primary" onClick={() => setMode({ kind: 'new' })}>
            + {L._entity} חדש
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
              {data.mainImg ? <img src={data.mainImg} alt="" /> : <div className="v2-list-card-empty">ללא תמונה</div>}
            </div>
            <div className="v2-list-card-meta">
              <div className="v2-list-card-title">{data.title || 'ללא כותרת'}</div>
              <div className="v2-list-card-sub">
                <span>{id}</span>
                <span>{data.type === 'single' ? L.typeOptions.single : L.typeOptions.collection}</span>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="v2-empty">לא נמצאו אוספים</p>}
      </div>
    </div>
  );
}

function CollectionEditor({
  initial,
  isNew,
  existingIds,
  shows,
  recs,
  showToast,
  onSaved,
  onCancel,
  onDeleted,
}: {
  initial: Collection;
  isNew: boolean;
  existingIds: string[];
  shows: Array<{ id: string; data: Show }>;
  recs: Array<{ id: string; data: Recommendation }>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [card, setCard] = useState<Collection>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const storageFolder = `collections/${card.id || 'draft'}`;

  function set(key: string, value: unknown) {
    setCard((prev) => ({ ...prev, [key]: value } as Collection));
  }

  const idError = useMemo(() => {
    if (!card.id.trim()) return 'שדה חובה';
    if (!/^[a-z0-9_-]+$/i.test(card.id)) return 'מזהה יכול להכיל אותיות, מספרים, מקף או קו תחתון';
    if (isNew && existingIds.includes(card.id)) return 'מזהה קיים כבר';
    return errors.id;
  }, [card.id, isNew, existingIds, errors.id]);

  async function save() {
    if (idError) {
      setErrors((prev) => ({ ...prev, id: idError }));
      showToast('יש שגיאה במזהה', 'error');
      return;
    }
    setSaving(true);
    try {
      const result = await saveValidated('collections_v2', card.id, card, CollectionSchema);
      if (!result.ok) {
        setErrors(result.errors);
        showToast('יש שגיאות בטופס', 'error');
        return;
      }
      showToast(isNew ? 'האוסף נוסף' : 'האוסף נשמר');
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
      await removeDoc('collections_v2', card.id);
      showToast('האוסף נמחק');
      onDeleted();
    } catch (e) {
      showToast('שגיאה במחיקה: ' + (e as Error).message, 'error');
    }
  }

  const showOptions = shows.map((s) => ({ value: s.id, label: `${s.data.title || s.id}` }));
  const recOptions = recs.map((r) => ({
    value: r.id,
    label: `${r.data.recommenderName} — ${r.data.recommenderRole || r.id}`,
  }));

  function onTypeChange(newType: 'single' | 'collection') {
    if (newType === card.type) return;
    if (newType === 'single') {
      setCard({
        ...card,
        type: 'single',
        linkedShowId: (card as Collection & { linkedShowId?: string }).linkedShowId || '',
      } as Collection);
    } else {
      setCard({
        ...card,
        type: 'collection',
        showIds: (card as Collection & { showIds?: string[] }).showIds || [],
      } as Collection);
    }
  }

  return (
    <div className="v2-editor v2-editor-single">
      <div className="v2-editor-form">
        <div className="v2-editor-header">
          <h2>{isNew ? 'אוסף חדש' : `עריכת ${card.title || card.id}`}</h2>
          <div className="v2-editor-actions">
            <button type="button" className="v2-btn v2-btn-secondary" onClick={onCancel}>{C.actions.cancel}</button>
            {!isNew && (
              <button type="button" className="v2-btn v2-btn-danger" onClick={() => setConfirmDelete(true)}>{C.actions.delete}</button>
            )}
            <button type="button" className="v2-btn v2-btn-primary" onClick={save} disabled={saving}>
              {saving ? 'שומר...' : C.actions.save}
            </button>
          </div>
        </div>

        <section className="v2-section">
          <h3 className="v2-section-title">פרטים כלליים</h3>
          <TextField label={L.id} value={card.id} onChange={(v) => set('id', v.trim())} dir="ltr"
            hint={isNew ? 'יוצרים מזהה קצר באנגלית (למשל: card_new)' : 'המזהה קבוע'} error={idError} />
          <TextField label={L.title} value={card.title} onChange={(v) => set('title', v)} error={errors.title} />
          <TextareaField label={L.description} value={card.description} onChange={(v) => set('description', v)} rows={3} />
          <SelectField label={L.priority} value={card.priority} onChange={(v) => set('priority', v as Collection['priority'])}
            options={[
              { value: 'normal', label: C.priorityOptions.normal },
              { value: 'featured', label: C.priorityOptions.featured },
            ]} />
          <ImageField label={L.mainImg} value={card.mainImg} onChange={(v) => set('mainImg', v)} subfolder={storageFolder} />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">סוג</h3>
          <SelectField label={L.type} value={card.type} onChange={(v) => onTypeChange(v as 'single' | 'collection')}
            options={[
              { value: 'single', label: L.typeOptions.single },
              { value: 'collection', label: L.typeOptions.collection },
            ]} />

          {card.type === 'single' ? (
            <SelectField
              label={L.linkedShowId}
              value={card.linkedShowId}
              onChange={(v) => set('linkedShowId', v)}
              options={[{ value: '', label: 'בחר/י הצגה...' }, ...showOptions]}
              error={errors.linkedShowId}
            />
          ) : (
            <MultiSelectField
              label={L.showIds}
              selected={card.showIds}
              options={showOptions}
              onChange={(next) => set('showIds', next)}
              emptyText="לא נמצאו הצגות"
            />
          )}
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">תוכן נוסף</h3>
          <TextareaField label={L.extendedHtml} value={card.extendedHtml} onChange={(v) => set('extendedHtml', v)} rows={6}
            hint="HTML עשיר שמופיע ליד הסרטונים באוסף" />
          <GalleryField label={L.gallery} images={card.gallery} onChange={(next) => set('gallery', next)} subfolder={storageFolder} />
          <ArrayField
            label={L.videos}
            items={card.videos}
            emptyItem={() => ''}
            addLabel="סרטון"
            onChange={(next) => set('videos', next)}
            renderItem={(item, idx, update) => (
              <YouTubeIdField label={`סרטון ${idx + 1}`} value={item} onChange={update} />
            )}
          />
          <MultiSelectField
            label={L.recommendationIds}
            selected={card.recommendationIds}
            options={recOptions}
            onChange={(next) => set('recommendationIds', next)}
            emptyText="אין המלצות במערכת"
          />
        </section>

        {confirmDelete && (
          <div className="v2-modal-backdrop" onClick={() => setConfirmDelete(false)}>
            <div className="v2-modal" onClick={(e) => e.stopPropagation()}>
              <h3>למחוק את האוסף "{card.title}"?</h3>
              <div className="v2-modal-actions">
                <button className="v2-btn v2-btn-secondary" onClick={() => setConfirmDelete(false)}>{C.actions.cancel}</button>
                <button className="v2-btn v2-btn-danger" onClick={doDelete}>{C.actions.delete}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
