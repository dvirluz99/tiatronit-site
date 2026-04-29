'use client';

import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  LABELS,
  HomeTestimonialsSchema,
  type HomeTestimonials,
  type HomeTestimonialItem,
  type Recommendation,
  type Show,
  type Category,
  type AboutPage,
} from '../../../lib/schema';
import { listAll, saveValidated } from '../../../lib/firestore-v2';
import {
  formatRecommendationForClipboard,
  copyToClipboard,
} from '../../../lib/recommendationClipboard';
import TextField from './fields/TextField';
import TextareaField from './fields/TextareaField';

type LegacyTestimonial = {
  author?: string;
  text?: string;
  fromShowTitle?: string;
  showId?: string;
  recommendationId?: string;
};

const L = LABELS.homeTestimonials;
const C = LABELS.common;

type Props = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

function snippet(content: string, max = 200): string {
  const stripped = (content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= max) return stripped;
  const cut = stripped.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut) + '…';
}

export default function HomeTestimonialsTab({ showToast }: Props) {
  const [data, setData] = useState<HomeTestimonials | null>(null);
  const [recs, setRecs] = useState<Array<{ id: string; data: Recommendation }>>([]);
  const [shows, setShows] = useState<Array<{ id: string; data: Show }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; data: Category }>>([]);
  const [saving, setSaving] = useState(false);
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState<string>(''); // '' | 'general' | 'show:<id>' | 'collection:<id>'

  useEffect(() => {
    (async () => {
      const [snap, r, s, c, aboutSnap] = await Promise.all([
        getDoc(doc(db, 'settings_v2', 'homeTestimonials')),
        listAll<Recommendation>('recommendations_v2'),
        listAll<Show>('shows_v2'),
        listAll<Category>('categories_v2').catch(
          () => [] as Array<{ id: string; data: Category }>,
        ),
        getDoc(doc(db, 'pages_v2', 'about')),
      ]);
      setRecs(r.sort((a, b) => a.id.localeCompare(b.id)));
      setShows(s.sort((a, b) => a.id.localeCompare(b.id)));
      setCategories(c.sort((a, b) => a.id.localeCompare(b.id)));

      // Auto-seed from legacy on first open if the new doc doesn't exist.
      if (snap.exists()) {
        const parsed = HomeTestimonialsSchema.safeParse(snap.data());
        if (parsed.success) {
          setData(parsed.data);
          return;
        }
        // fall through to seed if the saved doc has the wrong shape
      }

      const aboutData = aboutSnap.exists() ? (aboutSnap.data() as Partial<AboutPage>) : null;
      const legacy = Array.isArray(aboutData?.testimonials)
        ? (aboutData!.testimonials as LegacyTestimonial[])
        : [];
      const recIdSet = new Set(r.map((x) => x.id));
      const seeded: HomeTestimonialItem[] = legacy
        .filter((t) => t.recommendationId && recIdSet.has(t.recommendationId))
        .map((t) => ({
          recommendationId: t.recommendationId!,
          quoteOverride: (t.text || '').trim(),
          authorOverride: (t.author || '').trim(),
          fromShowTitleOverride: (t.fromShowTitle || '').trim(),
        }));
      setData({ items: seeded, autoplaySeconds: 0 });
    })();
  }, []);

  const recsById = useMemo(
    () => Object.fromEntries(recs.map((r) => [r.id, r.data])),
    [recs],
  );
  const showsById = useMemo(
    () => Object.fromEntries(shows.map((s) => [s.id, s.data])),
    [shows],
  );
  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.data])),
    [categories],
  );

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

  if (!data) return <p className="v2-empty">טוען...</p>;

  function update(next: Partial<HomeTestimonials>) {
    setData((prev) => ({ ...(prev as HomeTestimonials), ...next }));
  }

  function updateItems(items: HomeTestimonialItem[]) {
    update({ items });
  }

  function updateItem(idx: number, patch: Partial<HomeTestimonialItem>) {
    const next = [...data!.items];
    next[idx] = { ...next[idx], ...patch };
    updateItems(next);
  }

  function remove(idx: number) {
    updateItems(data!.items.filter((_, i) => i !== idx));
  }

  function move(idx: number, delta: number) {
    const next = [...data!.items];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    updateItems(next);
  }

  function addToCarousel(recId: string) {
    if (data!.items.some((it) => it.recommendationId === recId)) {
      showToast(L.toasts.alreadyAdded, 'error');
      return;
    }
    updateItems([
      ...data!.items,
      {
        recommendationId: recId,
        quoteOverride: '',
        authorOverride: '',
        fromShowTitleOverride: '',
      },
    ]);
    showToast(L.toasts.added);
  }

  async function copyRec(rec: Recommendation) {
    const linked = rec.linkedTarget;
    const linkedTitle =
      linked?.kind === 'show'
        ? showsById[linked.id]?.title || ''
        : linked?.kind === 'collection'
          ? categoriesById[linked.id]?.title || ''
          : '';
    const permalink =
      typeof window !== 'undefined' ? `${window.location.origin}/recommendation/${rec.id}` : '';
    const text = formatRecommendationForClipboard(rec, { linkedTitle, permalink });
    const ok = await copyToClipboard(text);
    showToast(ok ? L.toasts.copied : L.toasts.copyFailed, ok ? 'success' : 'error');
  }

  async function save() {
    setSaving(true);
    try {
      const result = await saveValidated(
        'settings_v2',
        'homeTestimonials',
        data,
        HomeTestimonialsSchema,
      );
      if (!result.ok) {
        showToast('שגיאה בשמירה: ' + result.messages.join(', '), 'error');
        return;
      }
      showToast(L.toasts.saved);
    } catch (e) {
      console.error('Save failed', e);
      showToast('שגיאה בשמירה: ' + ((e as Error)?.message || 'בעיה לא ידועה'), 'error');
    } finally {
      setSaving(false);
    }
  }

  // --- Library filter / search ---
  function describeTarget(rec: Recommendation): { label: string; muted: boolean } {
    const t = rec.linkedTarget;
    if (!t) return { label: 'כללי', muted: true };
    if (t.kind === 'show') {
      const s = showsById[t.id];
      const prefix = s?.kind === 'workshop' ? '🎭' : '📺';
      return { label: `${prefix} ${s?.title || t.id}`, muted: false };
    }
    if (t.kind === 'collection') {
      const c = categoriesById[t.id];
      return { label: `🗂️ ${c?.title || t.id}`, muted: false };
    }
    return { label: 'כללי', muted: true };
  }

  function matchesFilter(rec: Recommendation): boolean {
    if (!libraryFilter) return true;
    const t = rec.linkedTarget;
    if (libraryFilter === 'general') return !t;
    if (libraryFilter.startsWith('show:'))
      return t?.kind === 'show' && t.id === libraryFilter.slice(5);
    if (libraryFilter.startsWith('collection:'))
      return t?.kind === 'collection' && t.id === libraryFilter.slice(11);
    return true;
  }

  const filteredLibrary = recs.filter(({ data: rec }) => {
    if (!matchesFilter(rec)) return false;
    const q = librarySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (rec.recommenderName || '').toLowerCase().includes(q) ||
      (rec.recommenderRole || '').toLowerCase().includes(q) ||
      (rec.content || '').toLowerCase().includes(q)
    );
  });

  const inCarouselSet = new Set(data.items.map((it) => it.recommendationId));

  // Filter dropdown options
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

  return (
    <div className="v2-editor v2-editor-single">
      <div className="v2-editor-form">
        <div className="v2-editor-header">
          <h2>{L._entity}</h2>
          <div className="v2-editor-actions">
            <button className="v2-btn v2-btn-primary" onClick={save} disabled={saving}>
              {saving ? 'שומר...' : C.actions.save}
            </button>
          </div>
        </div>

        <p className="v2-field-hint" style={{ marginBottom: 'var(--sp-3)' }}>
          {L.unsavedHint}
        </p>

        {/* ===== Section A: Active carousel items ===== */}
        <section className="v2-section">
          <h3 className="v2-section-title">{L.activeSectionTitle}</h3>
          <p className="v2-field-hint">{L.activeSectionHint}</p>

          {data.items.length === 0 ? (
            <p className="v2-empty">{L.emptyActive}</p>
          ) : (
            <div className="v2-array-list">
              {data.items.map((it, idx) => {
                const rec = recsById[it.recommendationId];
                const isOpen = !!openOverrides[it.recommendationId];
                const missing = !rec;

                const displayedQuote =
                  (it.quoteOverride || '').trim() || snippet(rec?.content || '', 220);
                const displayedAuthor =
                  (it.authorOverride || '').trim() || rec?.recommenderName || '';
                const target = rec ? describeTarget(rec) : { label: '', muted: true };
                const linked = rec?.linkedTarget;
                const linkedTitle =
                  linked?.kind === 'show'
                    ? showsById[linked.id]?.title
                    : linked?.kind === 'collection'
                      ? categoriesById[linked.id]?.title
                      : '';
                const displayedSecondary =
                  (it.fromShowTitleOverride || '').trim() || linkedTitle || '';

                return (
                  <div
                    key={it.recommendationId}
                    className={`v2-array-item v2-ht-active-card${missing ? ' v2-ht-missing' : ''}`}
                  >
                    <div className="v2-array-item-body">
                      {missing ? (
                        <div className="v2-ht-missing-warning">
                          <strong>⚠ {L.missingRecommendation}</strong>
                          <div style={{ color: 'var(--c-text-muted)', fontSize: 'var(--fs-xs)' }}>
                            ID: {it.recommendationId}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="v2-ht-active-head">
                            <span
                              className={`v2-badge ${target.muted ? 'v2-badge-muted' : 'v2-badge-link'}`}
                            >
                              {target.label}
                            </span>
                            <span className="v2-ht-active-id">{it.recommendationId}</span>
                          </div>
                          <p className="v2-ht-active-quote">
                            <span className="v2-ht-quote-glyph">❝</span> {displayedQuote}
                          </p>
                          <div className="v2-ht-active-attrib">
                            <strong>{displayedAuthor || '—'}</strong>
                            {displayedSecondary && (
                              <span className="v2-ht-active-secondary">{displayedSecondary}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="v2-btn v2-btn-secondary v2-ht-edit-toggle"
                            onClick={() =>
                              setOpenOverrides((prev) => ({
                                ...prev,
                                [it.recommendationId]: !prev[it.recommendationId],
                              }))
                            }
                          >
                            {isOpen ? L.actions.closeEdit : L.actions.editDisplay}
                          </button>
                          {isOpen && (
                            <div className="v2-ht-overrides">
                              <p className="v2-field-hint">{L.overrides.hint}</p>
                              <TextareaField
                                label={L.overrides.quoteOverride}
                                value={it.quoteOverride || ''}
                                onChange={(v) => updateItem(idx, { quoteOverride: v })}
                                rows={3}
                                placeholder={snippet(rec.content || '', 220)}
                              />
                              <TextField
                                label={L.overrides.authorOverride}
                                value={it.authorOverride || ''}
                                onChange={(v) => updateItem(idx, { authorOverride: v })}
                                placeholder={rec.recommenderName || ''}
                              />
                              <TextField
                                label={L.overrides.fromShowTitleOverride}
                                value={it.fromShowTitleOverride || ''}
                                onChange={(v) => updateItem(idx, { fromShowTitleOverride: v })}
                                placeholder={linkedTitle || ''}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="v2-array-item-actions">
                      <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}>
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(idx, 1)}
                        disabled={idx === data.items.length - 1}
                      >
                        ↓
                      </button>
                      <button type="button" onClick={() => remove(idx)}>
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ===== Section B: Full library ===== */}
        <section className="v2-section">
          <h3 className="v2-section-title">{L.librarySectionTitle}</h3>
          <p className="v2-field-hint">{L.librarySectionHint}</p>

          {recs.length === 0 ? (
            <p className="v2-empty">{L.emptyLibrary}</p>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--sp-2)',
                  flexWrap: 'wrap',
                  marginBottom: 'var(--sp-3)',
                }}
              >
                <select
                  className="v2-input"
                  value={libraryFilter}
                  onChange={(e) => setLibraryFilter(e.target.value)}
                  aria-label={L.libraryFilterAriaLabel}
                  style={{ minWidth: 240 }}
                >
                  <option value="">כל ההמלצות ({counts.total})</option>
                  <option value="general">כלליות — ללא קישור ({counts.general})</option>
                  {showFilterOptions.length > 0 && (
                    <>
                      <option disabled>
                        ── מקושרות להצגות ──
                      </option>
                      {showFilterOptions.map((o) => (
                        <option key={`show:${o.id}`} value={`show:${o.id}`}>
                          {o.kind === 'workshop' ? '🎭' : '📺'} {o.title} ({o.count})
                        </option>
                      ))}
                    </>
                  )}
                  {categoryFilterOptions.length > 0 && (
                    <>
                      <option disabled>
                        ── מקושרות לקטגוריות ──
                      </option>
                      {categoryFilterOptions.map((o) => (
                        <option key={`collection:${o.id}`} value={`collection:${o.id}`}>
                          🗂️ {o.title} ({o.count})
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <input
                  type="search"
                  className="v2-input v2-search"
                  placeholder={L.librarySearchPlaceholder}
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  style={{ flex: 1, minWidth: 200 }}
                />
              </div>

              <div className="v2-ht-library-list">
                {filteredLibrary.map(({ id, data: rec }) => {
                  const target = describeTarget(rec);
                  const inCarousel = inCarouselSet.has(id);
                  return (
                    <div key={id} className="v2-ht-library-card">
                      <div className="v2-ht-library-body">
                        <div className="v2-ht-library-head">
                          <span
                            className={`v2-badge ${target.muted ? 'v2-badge-muted' : 'v2-badge-link'}`}
                          >
                            {target.label}
                          </span>
                          {rec.date && (
                            <span className="v2-rec-date">{rec.date}</span>
                          )}
                          {inCarousel && (
                            <span className="v2-badge v2-badge-featured">
                              ✓ {L.actions.alreadyInCarousel}
                            </span>
                          )}
                        </div>
                        <div className="v2-ht-library-name">
                          <strong>{rec.recommenderName || id}</strong>
                          {rec.recommenderRole && (
                            <span className="v2-ht-library-role">
                              {' · '}
                              {rec.recommenderRole}
                            </span>
                          )}
                        </div>
                        <div className="v2-ht-library-snippet">
                          {snippet(rec.content || '', 200)}
                        </div>
                      </div>
                      <div className="v2-ht-library-actions">
                        <button
                          type="button"
                          className="v2-btn v2-btn-primary"
                          onClick={() => addToCarousel(id)}
                          disabled={inCarousel}
                          title={inCarousel ? L.actions.alreadyInCarousel : L.actions.addToCarousel}
                        >
                          {inCarousel ? '✓' : `+ ${L.actions.addToCarousel}`}
                        </button>
                        <button
                          type="button"
                          className="v2-btn v2-btn-secondary v2-ht-copy-btn"
                          onClick={() => copyRec(rec)}
                          title={L.actions.copyFullText}
                        >
                          📋 {L.actions.copyFullText}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredLibrary.length === 0 && (
                  <p className="v2-empty">אין המלצות שתואמות את הסינון</p>
                )}
              </div>
            </>
          )}
        </section>

        {/* ===== Section C: Display settings ===== */}
        <section className="v2-section">
          <h3 className="v2-section-title">הגדרות תצוגה</h3>
          <div className="v2-field">
            <label className="v2-field-label">{L.autoplaySeconds}</label>
            <input
              type="number"
              className="v2-input"
              min={0}
              max={60}
              value={data.autoplaySeconds}
              onChange={(e) =>
                update({
                  autoplaySeconds: Math.max(0, Math.min(60, Number(e.target.value) || 0)),
                })
              }
              dir="ltr"
              style={{ maxWidth: 120 }}
            />
            <p className="v2-field-hint">
              0 — ללא החלפה אוטומטית. 5–10 — הגיוני לקרוסלת המלצות.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
