'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LABELS,
  RecommendationSchema,
  type Recommendation,
  type Show,
  type Collection,
} from '../../../lib/schema';
import { listAll, saveValidated, removeDoc } from '../../../lib/firestore-v2';
import TextField from './fields/TextField';
import TextareaField from './fields/TextareaField';
import SelectField from './fields/SelectField';

type Mode = { kind: 'list' } | { kind: 'edit'; id: string } | { kind: 'new' };

const L = LABELS.recommendation;
const C = LABELS.common;

function emptyRec(): Recommendation {
  return {
    id: '',
    recommenderName: '',
    recommenderRole: '',
    contactInfo: '',
    date: '',
    content: '',
    linkedTarget: null,
  };
}

function nextRecId(existing: string[]): string {
  const max = existing
    .filter((id) => /^rec\d+$/.test(id))
    .map((id) => parseInt(id.slice(3), 10))
    .reduce((a, b) => Math.max(a, b), 0);
  return `rec${max + 1}`;
}

type Props = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

export default function RecommendationsTab({ showToast }: Props) {
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [recs, setRecs] = useState<Array<{ id: string; data: Recommendation }>>([]);
  const [shows, setShows] = useState<Array<{ id: string; data: Show }>>([]);
  const [cards, setCards] = useState<Array<{ id: string; data: Collection }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [r, s, c] = await Promise.all([
        listAll<Recommendation>('recommendations_v2'),
        listAll<Show>('shows_v2'),
        listAll<Collection>('collections_v2'),
      ]);
      setRecs(r.sort((a, b) => a.id.localeCompare(b.id)));
      setShows(s.sort((a, b) => a.id.localeCompare(b.id)));
      setCards(c.sort((a, b) => a.id.localeCompare(b.id)));
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
      ? { ...emptyRec(), id: nextRecId(recs.map((r) => r.id)) }
      : recs.find((r) => r.id === mode.id)?.data || emptyRec();
    return (
      <RecommendationEditor
        initial={initial}
        isNew={mode.kind === 'new'}
        existingIds={recs.map((r) => r.id)}
        shows={shows}
        cards={cards}
        showToast={showToast}
        onSaved={() => { load(); setMode({ kind: 'list' }); }}
        onCancel={() => setMode({ kind: 'list' })}
        onDeleted={() => { load(); setMode({ kind: 'list' }); }}
      />
    );
  }

  const showsById = Object.fromEntries(shows.map((s) => [s.id, s.data]));
  const cardsById = Object.fromEntries(cards.map((c) => [c.id, c.data]));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recs;
    return recs.filter((r) => {
      const d = r.data;
      const target = d.linkedTarget;
      const targetTitle =
        target?.kind === 'show'
          ? showsById[target.id]?.title || ''
          : target?.kind === 'collection'
            ? cardsById[target.id]?.title || ''
            : '';
      return (
        r.id.toLowerCase().includes(q) ||
        (d.recommenderName || '').toLowerCase().includes(q) ||
        (d.recommenderRole || '').toLowerCase().includes(q) ||
        (d.content || '').toLowerCase().includes(q) ||
        targetTitle.toLowerCase().includes(q)
      );
    });
  }, [recs, search, showsById, cardsById]);

  function describeLink(rec: Recommendation): { label: string; muted: boolean } {
    if (!rec.linkedTarget) return { label: 'כללי', muted: true };
    if (rec.linkedTarget.kind === 'show') {
      const t = showsById[rec.linkedTarget.id];
      return { label: '📺 ' + (t?.title || `הצגה לא נמצאה (${rec.linkedTarget.id})`), muted: false };
    }
    if (rec.linkedTarget.kind === 'collection') {
      const t = cardsById[rec.linkedTarget.id];
      return { label: '🗂️ ' + (t?.title || `אוסף לא נמצא (${rec.linkedTarget.id})`), muted: false };
    }
    return { label: 'כללי', muted: true };
  }

  return (
    <div className="v2-list-pane">
      <div className="v2-list-header">
        <h2>{L._entityPlural}</h2>
        <div className="v2-list-actions">
          <input
            type="search"
            className="v2-input v2-search"
            placeholder="חיפוש לפי שם / תפקיד / תוכן / הצגה משויכת..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="v2-btn v2-btn-primary" onClick={() => setMode({ kind: 'new' })}>
            + {L._entity} חדשה
          </button>
        </div>
      </div>

      <div className="v2-rec-list">
        {filtered.map(({ id, data }) => {
          const link = describeLink(data);
          return (
            <button
              key={id}
              type="button"
              className="v2-rec-card"
              onClick={() => setMode({ kind: 'edit', id })}
            >
              <div className="v2-rec-top">
                <strong>{data.recommenderName || 'ללא שם'}</strong>
                <span className="v2-rec-id">{id}</span>
              </div>
              <div className="v2-rec-role">{data.recommenderRole}</div>
              <div className="v2-rec-snippet">
                {(data.content || '').replace(/<[^>]+>/g, '').slice(0, 120)}
                {(data.content || '').length > 120 ? '...' : ''}
              </div>
              <div className="v2-rec-bottom">
                <span className={`v2-badge ${link.muted ? 'v2-badge-muted' : 'v2-badge-link'}`}>
                  {link.label}
                </span>
                {data.date && <span className="v2-rec-date">{data.date}</span>}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="v2-empty">לא נמצאו המלצות</p>}
      </div>
    </div>
  );
}

function RecommendationEditor({
  initial,
  isNew,
  existingIds,
  shows,
  cards,
  showToast,
  onSaved,
  onCancel,
  onDeleted,
}: {
  initial: Recommendation;
  isNew: boolean;
  existingIds: string[];
  shows: Array<{ id: string; data: Show }>;
  cards: Array<{ id: string; data: Collection }>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [rec, setRec] = useState<Recommendation>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function set<K extends keyof Recommendation>(key: K, value: Recommendation[K]) {
    setRec((prev) => ({ ...prev, [key]: value }));
  }

  const idError = useMemo(() => {
    if (!rec.id.trim()) return 'שדה חובה';
    if (!/^[a-z0-9_-]+$/i.test(rec.id)) return 'מזהה יכול להכיל אותיות/מספרים/מקף';
    if (isNew && existingIds.includes(rec.id)) return 'מזהה קיים כבר';
    return errors.id;
  }, [rec.id, isNew, existingIds, errors.id]);

  async function save() {
    if (idError) {
      setErrors((prev) => ({ ...prev, id: idError }));
      showToast('יש שגיאה במזהה', 'error');
      return;
    }
    setSaving(true);
    try {
      const result = await saveValidated('recommendations_v2', rec.id, rec, RecommendationSchema);
      if (!result.ok) {
        setErrors(result.errors);
        showToast('יש שגיאות בטופס', 'error');
        return;
      }
      showToast(isNew ? 'ההמלצה נוספה' : 'ההמלצה נשמרה');
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
      await removeDoc('recommendations_v2', rec.id);
      showToast('ההמלצה נמחקה');
      onDeleted();
    } catch (e) {
      showToast('שגיאה במחיקה: ' + (e as Error).message, 'error');
    }
  }

  const kind = rec.linkedTarget?.kind ?? '';
  const targetId = rec.linkedTarget?.id ?? '';

  const targetOptions = kind === 'show'
    ? shows.map((s) => ({ value: s.id, label: s.data.title || s.id }))
    : kind === 'collection'
      ? cards.map((c) => ({ value: c.id, label: c.data.title || c.id }))
      : [];

  return (
    <div className="v2-editor v2-editor-single">
      <div className="v2-editor-form">
        <div className="v2-editor-header">
          <h2>{isNew ? 'המלצה חדשה' : `עריכת ${rec.recommenderName || rec.id}`}</h2>
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
          <h3 className="v2-section-title">פרטי הממליץ/ה</h3>
          <TextField label={L.id} value={rec.id} onChange={(v) => set('id', v.trim())} dir="ltr"
            hint={isNew ? 'ברירת מחדל: rec + מספר' : 'קבוע'} error={idError} />
          <TextField label={L.recommenderName} value={rec.recommenderName} onChange={(v) => set('recommenderName', v)} error={errors.recommenderName} />
          <TextField label={L.recommenderRole} value={rec.recommenderRole} onChange={(v) => set('recommenderRole', v)} />
          <TextField label={L.contactInfo} value={rec.contactInfo} onChange={(v) => set('contactInfo', v)} dir="ltr" />
          <TextField label={L.date} value={rec.date} onChange={(v) => set('date', v)} placeholder="17.12.2024" dir="ltr" />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">תוכן ההמלצה</h3>
          <TextareaField
            label={L.content}
            value={rec.content}
            onChange={(v) => set('content', v)}
            rows={10}
            hint="טקסט רגיל. שורה ריקה = פסקה חדשה. אין צורך ב-HTML."
            error={errors.content}
          />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">{L.linkedTarget._section}</h3>
          <SelectField
            label={L.linkedTarget.kind}
            value={kind}
            onChange={(v) => {
              if (!v) set('linkedTarget', null);
              else set('linkedTarget', { kind: v as 'show' | 'collection', id: targetId });
            }}
            options={[
              { value: '', label: L.linkedTarget.none },
              { value: 'show', label: L.linkedTarget.kindOptions.show },
              { value: 'collection', label: L.linkedTarget.kindOptions.collection },
            ]}
          />
          {kind && (
            <SelectField
              label={L.linkedTarget.id}
              value={targetId}
              onChange={(v) => {
                if (!v) set('linkedTarget', null);
                else set('linkedTarget', { kind: kind as 'show' | 'collection', id: v });
              }}
              options={[{ value: '', label: 'בחר/י...' }, ...targetOptions]}
            />
          )}
        </section>

        {confirmDelete && (
          <div className="v2-modal-backdrop" onClick={() => setConfirmDelete(false)}>
            <div className="v2-modal" onClick={(e) => e.stopPropagation()}>
              <h3>למחוק את ההמלצה?</h3>
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
