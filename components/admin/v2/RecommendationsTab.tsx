'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LABELS,
  RecommendationSchema,
  type Recommendation,
  type Show,
  type Collection,
  type Category,
} from '../../../lib/schema';
import { listAll, saveValidated, removeDoc } from '../../../lib/firestore-v2';
import {
  formatRecommendationForClipboard,
  copyToClipboard,
} from '../../../lib/recommendationClipboard';
import TextField from './fields/TextField';
import TextareaField from './fields/TextareaField';
import SelectField from './fields/SelectField';
import ImageField from './fields/ImageField';

type Mode = { kind: 'list' } | { kind: 'edit'; id: string } | { kind: 'new' };

const L = LABELS.recommendation;
const C = LABELS.common;

function emptyRec(): Recommendation {
  return {
    id: '',
    recommenderName: '',
    recommenderRole: '',
    recommenderImage: '',
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
  const [categories, setCategories] = useState<Array<{ id: string; data: Category }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Filter format:
  //   ''                   → all
  //   'general'            → no linkedTarget
  //   'show:<id>'          → linked to that show
  //   'collection:<id>'    → linked to that category/collection
  //   'kind:show'          → all show-linked
  //   'kind:collection'    → all category-linked
  const [linkFilter, setLinkFilter] = useState<string>('');

  async function load() {
    setLoading(true);
    try {
      const [r, s, c, cat] = await Promise.all([
        listAll<Recommendation>('recommendations_v2'),
        listAll<Show>('shows_v2'),
        listAll<Collection>('collections_v2').catch(
          () => [] as Array<{ id: string; data: Collection }>,
        ),
        listAll<Category>('categories_v2').catch(
          () => [] as Array<{ id: string; data: Category }>,
        ),
      ]);
      setRecs(r.sort((a, b) => a.id.localeCompare(b.id)));
      setShows(s.sort((a, b) => a.id.localeCompare(b.id)));
      setCards(c.sort((a, b) => a.id.localeCompare(b.id)));
      setCategories(cat.sort((a, b) => a.id.localeCompare(b.id)));
    } catch (e) {
      showToast('שגיאה בטעינה: ' + (e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Hooks must run on every render — keep all of them above any early return.
  const showsById = useMemo(
    () => Object.fromEntries(shows.map((s) => [s.id, s.data])),
    [shows],
  );
  // Legacy recommendations stored linkedTarget.kind = 'collection' pointing at
  // the old collections_v2 ids. After the category refactor those same ids
  // live in categories_v2. We look up new first, fall back to legacy.
  const targetsById = useMemo(() => {
    const map: Record<string, { title: string }> = {};
    for (const c of cards) map[c.id] = { title: c.data.title };
    for (const c of categories) map[c.id] = { title: c.data.title }; // wins
    return map;
  }, [cards, categories]);

  function matchesLinkFilter(rec: Recommendation): boolean {
    if (!linkFilter) return true;
    const t = rec.linkedTarget;
    if (linkFilter === 'general') return !t;
    if (linkFilter === 'kind:show') return t?.kind === 'show';
    if (linkFilter === 'kind:collection') return t?.kind === 'collection';
    if (linkFilter.startsWith('show:')) return t?.kind === 'show' && t.id === linkFilter.slice(5);
    if (linkFilter.startsWith('collection:'))
      return t?.kind === 'collection' && t.id === linkFilter.slice(11);
    return true;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recs.filter((r) => {
      if (!matchesLinkFilter(r.data)) return false;
      if (!q) return true;
      const d = r.data;
      const target = d.linkedTarget;
      const targetTitle =
        target?.kind === 'show'
          ? showsById[target.id]?.title || ''
          : target?.kind === 'collection'
            ? targetsById[target.id]?.title || ''
            : '';
      return (
        r.id.toLowerCase().includes(q) ||
        (d.recommenderName || '').toLowerCase().includes(q) ||
        (d.recommenderRole || '').toLowerCase().includes(q) ||
        (d.content || '').toLowerCase().includes(q) ||
        targetTitle.toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recs, search, showsById, targetsById, linkFilter]);

  // Counts per linked target — drives the badges in the filter dropdown so the
  // user knows at a glance how many recommendations each show/category has.
  const counts = useMemo(() => {
    const byShow: Record<string, number> = {};
    const byCollection: Record<string, number> = {};
    let general = 0;
    for (const r of recs) {
      const t = r.data.linkedTarget;
      if (!t) general++;
      else if (t.kind === 'show') byShow[t.id] = (byShow[t.id] || 0) + 1;
      else if (t.kind === 'collection') byCollection[t.id] = (byCollection[t.id] || 0) + 1;
    }
    return { byShow, byCollection, general, total: recs.length };
  }, [recs]);

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

  function describeLink(rec: Recommendation): { label: string; muted: boolean } {
    if (!rec.linkedTarget) return { label: 'כללי', muted: true };
    if (rec.linkedTarget.kind === 'show') {
      const t = showsById[rec.linkedTarget.id];
      return { label: '📺 ' + (t?.title || `הצגה לא נמצאה (${rec.linkedTarget.id})`), muted: false };
    }
    if (rec.linkedTarget.kind === 'collection') {
      const t = targetsById[rec.linkedTarget.id];
      return { label: '🗂️ ' + (t?.title || `קטגוריה לא נמצאה (${rec.linkedTarget.id})`), muted: false };
    }
    return { label: 'כללי', muted: true };
  }

  function linkedTitleForCopy(rec: Recommendation): string {
    const t = rec.linkedTarget;
    if (!t) return '';
    if (t.kind === 'show') return showsById[t.id]?.title || '';
    if (t.kind === 'collection') return targetsById[t.id]?.title || '';
    return '';
  }

  async function copyRecToClipboard(rec: Recommendation) {
    const linkedTitle = linkedTitleForCopy(rec);
    const permalink =
      typeof window !== 'undefined' ? `${window.location.origin}/recommendation/${rec.id}` : '';
    const ok = await copyToClipboard(
      formatRecommendationForClipboard(rec, { linkedTitle, permalink }),
    );
    showToast(
      ok ? 'הועתק ללוח 📋' : 'לא ניתן להעתיק אוטומטית — פתחי את הדף והעתיקי ידנית',
      ok ? 'success' : 'error',
    );
  }

  // Build the filter dropdown options. Sorted by count desc inside each group.
  const showFilterOptions = shows
    .map((s) => ({
      id: s.id,
      title: s.data.title || s.id,
      kind: s.data.kind,
      count: counts.byShow[s.id] || 0,
    }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, 'he'));

  const categoryFilterOptions = categories
    .map((c) => ({
      id: c.id,
      title: c.data.title || c.id,
      count: counts.byCollection[c.id] || 0,
    }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, 'he'));

  // Legacy collections that still hold linked recommendations but don't
  // currently exist in categories_v2 — surface them too so the user can find
  // those recommendations.
  const legacyCollectionIds = Object.keys(counts.byCollection).filter(
    (id) => !categoryFilterOptions.some((o) => o.id === id),
  );

  return (
    <div className="v2-list-pane">
      <div className="v2-list-header">
        <h2>{L._entityPlural}</h2>
        <div className="v2-list-actions">
          <select
            className="v2-input"
            value={linkFilter}
            onChange={(e) => setLinkFilter(e.target.value)}
            aria-label="סינון לפי שיוך"
            title="סינון לפי שיוך"
          >
            <option value="">כל ההמלצות ({counts.total})</option>
            <option value="general">כלליות — ללא קישור ({counts.general})</option>
            {showFilterOptions.length > 0 && (
              <>
                <option disabled value="kind:show">
                  ── מקושרות להצגות ({Object.values(counts.byShow).reduce((a, b) => a + b, 0)}) ──
                </option>
                {showFilterOptions.map((o) => (
                  <option key={`show:${o.id}`} value={`show:${o.id}`}>
                    {o.kind === 'workshop' ? '🎭' : '📺'} {o.title} ({o.count})
                  </option>
                ))}
              </>
            )}
            {(categoryFilterOptions.length > 0 || legacyCollectionIds.length > 0) && (
              <>
                <option disabled value="kind:collection">
                  ── מקושרות לקטגוריות ({Object.values(counts.byCollection).reduce((a, b) => a + b, 0)}) ──
                </option>
                {categoryFilterOptions.map((o) => (
                  <option key={`collection:${o.id}`} value={`collection:${o.id}`}>
                    🗂️ {o.title} ({o.count})
                  </option>
                ))}
                {legacyCollectionIds.map((id) => (
                  <option key={`collection:${id}`} value={`collection:${id}`}>
                    🗂️ (מזהה ישן: {id}) ({counts.byCollection[id]})
                  </option>
                ))}
              </>
            )}
          </select>
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
            <div
              key={id}
              role="button"
              tabIndex={0}
              className="v2-rec-card v2-rec-card--clickable"
              onClick={() => setMode({ kind: 'edit', id })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setMode({ kind: 'edit', id });
                }
              }}
            >
              <div className="v2-rec-link-row">
                <span className={`v2-badge ${link.muted ? 'v2-badge-muted' : 'v2-badge-link'}`}>
                  {link.label}
                </span>
                {data.date && <span className="v2-rec-date">{data.date}</span>}
              </div>
              <div className="v2-rec-top">
                <strong>{data.recommenderName || 'ללא שם'}</strong>
                <span className="v2-rec-id">{id}</span>
              </div>
              <div className="v2-rec-role">{data.recommenderRole}</div>
              <div className="v2-rec-snippet">
                {(data.content || '').replace(/<[^>]+>/g, '').slice(0, 120)}
                {(data.content || '').length > 120 ? '...' : ''}
              </div>
              <button
                type="button"
                className="v2-rec-copy-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  copyRecToClipboard(data);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                title="העתק את ההמלצה המלאה ללוח (מוכן לוואטסאפ)"
                aria-label="העתק את ההמלצה המלאה ללוח"
              >
                📋 העתק
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="v2-empty">
            {linkFilter || search
              ? 'אין המלצות שתואמות את הסינון'
              : 'לא נמצאו המלצות'}
          </p>
        )}
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

  async function copyToClipboardFromEditor() {
    const t = rec.linkedTarget;
    let linkedTitle = '';
    if (t?.kind === 'show') {
      linkedTitle = shows.find((s) => s.id === t.id)?.data.title || '';
    } else if (t?.kind === 'collection') {
      linkedTitle = cards.find((c) => c.id === t.id)?.data.title || '';
    }
    const permalink =
      typeof window !== 'undefined' && rec.id
        ? `${window.location.origin}/recommendation/${rec.id}`
        : '';
    const ok = await copyToClipboard(
      formatRecommendationForClipboard(rec, { linkedTitle, permalink }),
    );
    showToast(
      ok ? 'הועתק ללוח 📋' : 'לא ניתן להעתיק אוטומטית — פתחי את הדף והעתיקי ידנית',
      ok ? 'success' : 'error',
    );
  }

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
            {!isNew && (
              <button
                type="button"
                className="v2-btn v2-btn-secondary"
                onClick={copyToClipboardFromEditor}
                title="העתק את ההמלצה המלאה ללוח (מוכן לשליחה בוואטסאפ / מייל)"
              >
                📋 העתק
              </button>
            )}
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
          <ImageField
            label={L.recommenderImage}
            value={rec.recommenderImage || ''}
            onChange={(v) => set('recommenderImage', v)}
            subfolder={`recommendations/${rec.id || 'draft'}`}
            hint="תופיע בעיגול ליד שם הממליץ/ה בדף ההמלצה ובכרטיסי ההצגה. אופציונלי."
            error={errors.recommenderImage}
          />
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
