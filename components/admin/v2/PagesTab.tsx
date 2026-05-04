'use client';

import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  LABELS,
  AboutPageSchema,
  PuppetsPageSchema,
  HomeGallerySchema,
  type AboutPage,
  type PuppetsPage,
  type HomeGallery,
  type AboutTestimonial,
  type PuppetInfoItem,
  type Show,
  type Recommendation,
} from '../../../lib/schema';
import { saveValidated, listAll } from '../../../lib/firestore-v2';
import { splitIntoSentences, joinSentences, summarizeContent } from '../../../lib/sentenceSplit';
import TextField from './fields/TextField';
import TextareaField from './fields/TextareaField';
import ImageField from './fields/ImageField';
import GalleryField from './fields/GalleryField';
import YouTubeIdField from './fields/YouTubeIdField';
import ArrayField from './fields/ArrayField';
import SelectField from './fields/SelectField';

type SubTab = 'about' | 'puppets' | 'homeGallery';

const CA = LABELS.pageAbout;
const CP = LABELS.pagePuppets;
const CG = LABELS.homeGallery;
const C = LABELS.common;

type Props = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

export default function PagesTab({ showToast }: Props) {
  const [active, setActive] = useState<SubTab>('about');

  return (
    <div className="v2-pages-tab">
      <nav className="v2-subtabs">
        <button className={`v2-subtab ${active === 'about' ? 'active' : ''}`} onClick={() => setActive('about')}>
          {CA._entity}
        </button>
        <button className={`v2-subtab ${active === 'puppets' ? 'active' : ''}`} onClick={() => setActive('puppets')}>
          {CP._entity}
        </button>
        <button className={`v2-subtab ${active === 'homeGallery' ? 'active' : ''}`} onClick={() => setActive('homeGallery')}>
          {CG._entity}
        </button>
      </nav>

      {active === 'about' && <AboutEditor showToast={showToast} />}
      {active === 'puppets' && <PuppetsEditor showToast={showToast} />}
      {active === 'homeGallery' && <HomeGalleryEditor showToast={showToast} />}
    </div>
  );
}

function AboutEditor({ showToast }: { showToast: Props['showToast'] }) {
  const [data, setData] = useState<AboutPage | null>(null);
  const [shows, setShows] = useState<Array<{ id: string; data: Show }>>([]);
  const [recs, setRecs] = useState<Array<{ id: string; data: Recommendation }>>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'pages_v2', 'about'));
      const d = snap.exists() ? (snap.data() as AboutPage) : emptyAbout();
      setData(d);
      const [s, r] = await Promise.all([
        listAll<Show>('shows_v2'),
        listAll<Recommendation>('recommendations_v2'),
      ]);
      setShows(s);
      setRecs(r);
    })();
  }, []);

  if (!data) return <p className="v2-empty">טוען...</p>;

  const set = <K extends keyof AboutPage>(key: K, value: AboutPage[K]) =>
    setData({ ...data, [key]: value });

  const showOptions = [{ value: '', label: '—' }, ...shows.map((s) => ({ value: s.id, label: s.data.title || s.id }))];
  const recOptions = [{ value: '', label: '—' }, ...recs.map((r) => ({ value: r.id, label: `${r.data.recommenderName} (${r.id})` }))];

  async function save() {
    setSaving(true);
    try {
      const result = await saveValidated('pages_v2', 'about', data, AboutPageSchema);
      if (!result.ok) {
        setErrors(result.errors);
        showToast('יש שגיאות בטופס', 'error');
        return;
      }
      setErrors({});
      showToast('נשמר');
    } catch (e) {
      console.error('Save failed', e);
      showToast('שגיאה בשמירה: ' + ((e as Error)?.message || 'בעיה לא ידועה'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="v2-editor v2-editor-single">
      <div className="v2-editor-form">
        <div className="v2-editor-header">
          <h2>{CA._entity}</h2>
          <div className="v2-editor-actions">
            <button className="v2-btn v2-btn-primary" onClick={save} disabled={saving}>
              {saving ? 'שומר...' : C.actions.save}
            </button>
          </div>
        </div>

        <section className="v2-section">
          <TextField label={CA.title} value={data.title} onChange={(v) => set('title', v)} error={errors.title} />
          <ImageField label={CA.mainImage} value={data.mainImage} onChange={(v) => set('mainImage', v)} subfolder="pages/about" />
          <TextareaField label={CA.mainDescription} value={data.mainDescription} onChange={(v) => set('mainDescription', v)} rows={8} error={errors.mainDescription} />
        </section>

        <section className="v2-section">
          <MissingRecsPanel
            testimonials={data.testimonials}
            recs={recs}
            shows={shows}
            onAppend={(newOnes) => set('testimonials', [...data.testimonials, ...newOnes])}
            showToast={showToast}
          />
          <ArrayField
            label={CA.testimonials}
            items={data.testimonials}
            emptyItem={() => ({ author: '', fromShowTitle: '', showId: '', recommendationId: '', text: '' }) as AboutTestimonial}
            addLabel="ציטוט"
            onChange={(next) => set('testimonials', next)}
            renderItem={(item, idx, update) => (
              <TestimonialEditor
                item={item}
                update={update}
                shows={shows}
                recs={recs}
                showOptions={showOptions}
                recOptions={recOptions}
              />
            )}
          />
        </section>
      </div>
    </div>
  );
}

function buildTestimonialFromRec(
  rec: Recommendation,
  recId: string,
  shows: Array<{ id: string; data: Show }>,
): AboutTestimonial {
  const linkedShow =
    rec.linkedTarget?.kind === 'show'
      ? shows.find((s) => s.id === rec.linkedTarget!.id)?.data
      : undefined;
  return {
    author: rec.recommenderName || '',
    recommendationId: recId,
    showId: rec.linkedTarget?.kind === 'show' ? rec.linkedTarget.id : '',
    fromShowTitle: linkedShow?.title || '',
    text: summarizeContent(rec.content || ''),
  };
}

function MissingRecsPanel({
  testimonials,
  recs,
  shows,
  onAppend,
  showToast,
}: {
  testimonials: AboutTestimonial[];
  recs: Array<{ id: string; data: Recommendation }>;
  shows: Array<{ id: string; data: Show }>;
  onAppend: (toAdd: AboutTestimonial[]) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}) {
  const linkedRecIds = useMemo(() => {
    const s = new Set<string>();
    for (const t of testimonials) {
      if (t.recommendationId) s.add(t.recommendationId);
    }
    return s;
  }, [testimonials]);

  const missing = useMemo(
    () => recs.filter((r) => !linkedRecIds.has(r.id)),
    [recs, linkedRecIds],
  );

  if (missing.length === 0) {
    return (
      <div className="v2-missing-recs v2-missing-recs-empty">
        <span>✓ לכל ההמלצות יש ציטוט.</span>
      </div>
    );
  }

  function addOne(r: { id: string; data: Recommendation }) {
    const t = buildTestimonialFromRec(r.data, r.id, shows);
    onAppend([t]);
    showToast(`נוסף ציטוט עבור ${r.data.recommenderName || r.id}`);
  }

  function addAll() {
    const toAdd = missing.map((r) => buildTestimonialFromRec(r.data, r.id, shows));
    onAppend(toAdd);
    showToast(`נוספו ${toAdd.length} ציטוטים אוטומטיים — בדוק/י לפני שמירה`);
  }

  return (
    <div className="v2-missing-recs">
      <div className="v2-missing-recs-header">
        <strong>המלצות ללא ציטוט ({missing.length})</strong>
        <button type="button" className="v2-btn v2-btn-secondary" onClick={addAll}>
          צור ציטוט אוטומטי לכולן
        </button>
      </div>
      <p className="v2-field-hint">
        לחיצה על שם תוסיף ציטוט בודד עם תקציר אוטומטי מתוכן ההמלצה. ניתן לערוך אחר כך לפני שמירה.
      </p>
      <div className="v2-chip-list">
        {missing.map((r) => (
          <button
            key={r.id}
            type="button"
            className="v2-chip"
            onClick={() => addOne(r)}
            title={r.data.recommenderRole || r.id}
          >
            + {r.data.recommenderName || r.id}
          </button>
        ))}
      </div>
    </div>
  );
}

function TestimonialEditor({
  item,
  update,
  shows,
  recs,
  showOptions,
  recOptions,
}: {
  item: AboutTestimonial;
  update: (next: AboutTestimonial) => void;
  shows: Array<{ id: string; data: Show }>;
  recs: Array<{ id: string; data: Recommendation }>;
  showOptions: Array<{ value: string; label: string }>;
  recOptions: Array<{ value: string; label: string }>;
}) {
  const linkedRec = useMemo(
    () => recs.find((r) => r.id === item.recommendationId)?.data,
    [recs, item.recommendationId],
  );
  const linkedShow = useMemo(() => {
    if (item.showId) return shows.find((s) => s.id === item.showId)?.data;
    if (linkedRec?.linkedTarget?.kind === 'show') {
      return shows.find((s) => s.id === linkedRec.linkedTarget!.id)?.data;
    }
    return undefined;
  }, [linkedRec, item.showId, shows]);

  const sentences = useMemo(
    () => (linkedRec?.content ? splitIntoSentences(linkedRec.content) : []),
    [linkedRec],
  );

  const selectedIdx = useMemo(() => {
    if (!sentences.length || !item.text) return [] as number[];
    const out: number[] = [];
    sentences.forEach((s, i) => {
      if (item.text.includes(s.text)) out.push(i);
    });
    return out;
  }, [sentences, item.text]);

  function toggleSentence(idx: number) {
    const isOn = selectedIdx.includes(idx);
    const next = isOn
      ? selectedIdx.filter((i) => i !== idx)
      : [...selectedIdx, idx].sort((a, b) => a - b);
    update({ ...item, text: joinSentences(next.map((i) => sentences[i])) });
  }

  function autofill() {
    if (!linkedRec) return;
    const next: AboutTestimonial = { ...item };
    if (!next.author && linkedRec.recommenderName) next.author = linkedRec.recommenderName;
    if (!next.fromShowTitle && linkedShow?.title) next.fromShowTitle = linkedShow.title;
    if (!next.showId && linkedRec.linkedTarget?.kind === 'show') {
      next.showId = linkedRec.linkedTarget.id;
    }
    update(next);
  }

  const canAutofill = !!linkedRec && (!item.author || !item.fromShowTitle || (!item.showId && linkedRec.linkedTarget?.kind === 'show'));

  return (
    <>
      <TextField label={CA.testimonialItem.author} value={item.author} onChange={(author) => update({ ...item, author })} />
      <TextareaField label={CA.testimonialItem.text} value={item.text} onChange={(text) => update({ ...item, text })} rows={3} />
      <div className="v2-row">
        <SelectField label={CA.testimonialItem.showId} value={item.showId} options={showOptions} onChange={(showId) => update({ ...item, showId })} />
        <SelectField label={CA.testimonialItem.recommendationId} value={item.recommendationId} options={recOptions} onChange={(recommendationId) => update({ ...item, recommendationId })} />
      </div>
      <TextField label={CA.testimonialItem.fromShowTitle} value={item.fromShowTitle} onChange={(fromShowTitle) => update({ ...item, fromShowTitle })} />

      {linkedRec && (
        <div className="v2-rec-picker">
          <div className="v2-rec-picker-header">
            <div className="v2-rec-picker-title">
              <strong>{linkedRec.recommenderName}</strong>
              {linkedRec.recommenderRole ? <span className="v2-rec-picker-meta"> — {linkedRec.recommenderRole}</span> : null}
              {linkedShow ? <span className="v2-rec-picker-meta"> · 📺 {linkedShow.title || linkedShow.id}</span> : null}
            </div>
            <button
              type="button"
              className="v2-btn v2-btn-secondary"
              onClick={autofill}
              disabled={!canAutofill}
              title={canAutofill ? 'מילוי שדות ריקים מתוך ההמלצה' : 'כבר מולא'}
            >
              מילוי אוטומטי
            </button>
          </div>
          {sentences.length === 0 ? (
            <p className="v2-field-hint">להמלצה הזו אין תוכן זמין לפיצול למשפטים.</p>
          ) : (
            <>
              <p className="v2-field-hint">
                לחיצה על משפט תוסיף או תסיר אותו מהציטוט. הסדר נשמר לפי סדר ההמלצה. עריכה ידנית של הטקסט תידרס בלחיצה הבאה.
              </p>
              <div className="v2-sentence-grid">
                {sentences.map((s, i) => {
                  const on = selectedIdx.includes(i);
                  const order = on ? selectedIdx.indexOf(i) + 1 : null;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`v2-sentence-chip ${on ? 'on' : ''}`}
                      onClick={() => toggleSentence(i)}
                    >
                      {order != null && <span className="v2-sentence-order">{order}</span>}
                      <span className="v2-sentence-text">{s.text}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function PuppetsEditor({ showToast }: { showToast: Props['showToast'] }) {
  const [data, setData] = useState<PuppetsPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'pages_v2', 'puppets'));
      setData(snap.exists() ? (snap.data() as PuppetsPage) : emptyPuppets());
    })();
  }, []);

  if (!data) return <p className="v2-empty">טוען...</p>;

  const set = <K extends keyof PuppetsPage>(key: K, value: PuppetsPage[K]) =>
    setData({ ...data, [key]: value });

  async function save() {
    setSaving(true);
    try {
      const result = await saveValidated('pages_v2', 'puppets', data, PuppetsPageSchema);
      if (!result.ok) {
        setErrors(result.errors);
        showToast('יש שגיאות בטופס', 'error');
        return;
      }
      setErrors({});
      showToast('נשמר');
    } catch (e) {
      console.error('Save failed', e);
      showToast('שגיאה בשמירה: ' + ((e as Error)?.message || 'בעיה לא ידועה'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="v2-editor v2-editor-single">
      <div className="v2-editor-form">
        <div className="v2-editor-header">
          <h2>{CP._entity}</h2>
          <div className="v2-editor-actions">
            <button className="v2-btn v2-btn-primary" onClick={save} disabled={saving}>
              {saving ? 'שומר...' : C.actions.save}
            </button>
          </div>
        </div>

        <section className="v2-section">
          <TextField label={CP.title} value={data.title} onChange={(v) => set('title', v)} error={errors.title} />
          <TextareaField label={CP.subtitle} value={data.subtitle} onChange={(v) => set('subtitle', v)} rows={2} />
          <YouTubeIdField label={CP.youtubeVideoId} value={data.youtubeVideoId} onChange={(v) => set('youtubeVideoId', v)} />
          <TextareaField label={CP.paragraph} value={data.paragraph} onChange={(v) => set('paragraph', v)} rows={5} />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">אזור עקרונות</h3>
          <TextField label={CP.infoSectionTitle} value={data.infoSectionTitle} onChange={(v) => set('infoSectionTitle', v)} />
          <TextField label={CP.infoListTitle} value={data.infoListTitle} onChange={(v) => set('infoListTitle', v)} />

          <ArrayField
            label={CP.infoList}
            items={data.infoList}
            emptyItem={() => ({ title: '', text: '' }) as PuppetInfoItem}
            addLabel="עקרון"
            onChange={(next) => set('infoList', next)}
            renderItem={(item, idx, update) => (
              <>
                <TextField label={CP.infoListItem.title} value={item.title} onChange={(title) => update({ ...item, title })} />
                <TextareaField label={CP.infoListItem.text} value={item.text} onChange={(text) => update({ ...item, text })} rows={2} />
              </>
            )}
          />
        </section>

        <section className="v2-section">
          <TextareaField label={CP.summaryQuote} value={data.summaryQuote} onChange={(v) => set('summaryQuote', v)} rows={2} />
        </section>
      </div>
    </div>
  );
}

function HomeGalleryEditor({ showToast }: { showToast: Props['showToast'] }) {
  const [data, setData] = useState<HomeGallery | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'settings_v2', 'homeGallery'));
      setData(snap.exists() ? (snap.data() as HomeGallery) : { images: [] });
    })();
  }, []);

  if (!data) return <p className="v2-empty">טוען...</p>;

  async function save() {
    setSaving(true);
    try {
      const result = await saveValidated('settings_v2', 'homeGallery', data, HomeGallerySchema);
      if (!result.ok) {
        showToast('שגיאה בשמירה: ' + result.messages.join(', '), 'error');
        return;
      }
      showToast('נשמר');
    } catch (e) {
      console.error('Save failed', e);
      showToast('שגיאה בשמירה: ' + ((e as Error)?.message || 'בעיה לא ידועה'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="v2-editor v2-editor-single">
      <div className="v2-editor-form">
        <div className="v2-editor-header">
          <h2>{CG._entity}</h2>
          <div className="v2-editor-actions">
            <button className="v2-btn v2-btn-primary" onClick={save} disabled={saving}>
              {saving ? 'שומר...' : C.actions.save}
            </button>
          </div>
        </div>

        <section className="v2-section">
          <GalleryField label={CG.images} images={data.images} onChange={(next) => setData({ ...data, images: next })} subfolder="pages/homeGallery" />
        </section>
      </div>
    </div>
  );
}

function emptyAbout(): AboutPage {
  return { title: '', mainImage: '', mainDescription: '', testimonials: [] };
}

function emptyPuppets(): PuppetsPage {
  return {
    title: '',
    subtitle: '',
    paragraph: '',
    youtubeVideoId: '',
    infoSectionTitle: '',
    infoListTitle: '',
    infoList: [],
    summaryQuote: '',
  };
}
