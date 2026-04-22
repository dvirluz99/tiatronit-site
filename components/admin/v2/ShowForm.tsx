'use client';

import { useMemo, useState } from 'react';
import {
  LABELS,
  ShowSchema,
  type Show,
  type Recommendation,
  type Clip,
  type CustomerClip,
} from '../../../lib/schema';
import { saveValidated, removeDoc } from '../../../lib/firestore-v2';
import TextField from './fields/TextField';
import TextareaField from './fields/TextareaField';
import SelectField from './fields/SelectField';
import ImageField from './fields/ImageField';
import GalleryField from './fields/GalleryField';
import YouTubeIdField from './fields/YouTubeIdField';
import ArrayField from './fields/ArrayField';
import MultiSelectField from './fields/MultiSelectField';
import ShowPreview from './ShowPreview';

type Props = {
  initial: Show;
  isNew: boolean;
  existingIds: string[];
  recommendations: Array<{ id: string; data: Recommendation }>;
  clips: Array<{ id: string; data: Clip }>;
  customerClips: Array<{ id: string; data: CustomerClip }>;
  onSaved: (show: Show) => void;
  onCancel: () => void;
  onDeleted: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
};

const L = LABELS.show;
const C = LABELS.common;

export default function ShowForm({
  initial,
  isNew,
  existingIds,
  recommendations,
  clips,
  customerClips,
  onSaved,
  onCancel,
  onDeleted,
  showToast,
}: Props) {
  const [show, setShow] = useState<Show>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const idError = useMemo(() => {
    if (!show.id.trim()) return 'שדה חובה';
    if (!/^[a-z0-9_-]+$/i.test(show.id)) return 'מזהה יכול להכיל אותיות, מספרים, מקף או קו תחתון';
    if (isNew && existingIds.includes(show.id)) return 'מזהה קיים כבר';
    return errors.id;
  }, [show.id, isNew, existingIds, errors.id]);

  function set<K extends keyof Show>(key: K, value: Show[K]) {
    setShow((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  }

  function updateVideo<K extends keyof Show['video']>(key: K, value: Show['video'][K]) {
    setShow((prev) => ({ ...prev, video: { ...prev.video, [key]: value } }));
  }

  async function save() {
    if (idError) {
      setErrors((prev) => ({ ...prev, id: idError }));
      showToast('יש שגיאה במזהה - ראה/י סימון אדום', 'error');
      return;
    }
    setSaving(true);
    try {
      const result = await saveValidated('shows_v2', show.id, show, ShowSchema);
      if (!result.ok) {
        setErrors(result.errors);
        showToast('יש שגיאות בטופס - ראה/י סימונים אדומים', 'error');
        return;
      }
      showToast(isNew ? 'ההצגה נוספה' : 'ההצגה נשמרה');
      onSaved(result.data);
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
      await removeDoc('shows_v2', show.id);
      showToast('ההצגה נמחקה');
      onDeleted();
    } catch (e) {
      showToast('שגיאה במחיקה: ' + (e as Error).message, 'error');
    }
  }

  const recOptions = recommendations.map((r) => ({
    value: r.id,
    label: `${r.data.recommenderName} — ${r.data.recommenderRole || r.id}`,
  }));

  const clipOptions = clips.map((c) => ({
    value: c.id,
    label: c.data.caption ? `${c.data.caption} (${c.id})` : c.id,
  }));

  const customerClipOptions = customerClips.map((c) => ({
    value: c.id,
    label: c.data.caption ? `${c.data.caption} (${c.id})` : c.id,
  }));

  return (
    <div className="v2-editor">
      <div className="v2-editor-form">
        <div className="v2-editor-header">
          <h2>{isNew ? 'הצגה חדשה' : `עריכת ${show.title || show.id}`}</h2>
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
            value={show.id}
            onChange={(v) => set('id', v.trim())}
            dir="ltr"
            hint={isNew ? 'יוצרים מזהה קצר באנגלית (למשל: show-chavale)' : 'המזהה קבוע, לא ניתן לשנות'}
            error={idError}
          />

          <TextField
            label={L.title}
            value={show.title}
            onChange={(v) => set('title', v)}
            error={errors.title}
          />

          <div className="v2-row">
            <SelectField
              label={L.category}
              value={show.category}
              onChange={(v) => set('category', v as Show['category'])}
              options={[
                { value: 'kids', label: C.categoryOptions.kids },
                { value: 'youth', label: C.categoryOptions.youth },
                { value: 'adults', label: C.categoryOptions.adults },
              ]}
              error={errors.category}
            />
            <SelectField
              label={L.priority}
              value={show.priority}
              onChange={(v) => set('priority', v as Show['priority'])}
              options={[
                { value: 'normal', label: C.priorityOptions.normal },
                { value: 'featured', label: C.priorityOptions.featured },
              ]}
              error={errors.priority}
            />
          </div>

          <TextareaField
            label={L.description}
            value={show.description}
            onChange={(v) => set('description', v)}
            rows={4}
            error={errors.description}
          />

          <TextField
            label={L.audience}
            value={show.audience}
            onChange={(v) => set('audience', v)}
            placeholder="מתאים לכל הגילאים..."
            error={errors.audience}
          />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">פרטי היוצרת</h3>
          <TextField
            label={L.creatorName}
            value={show.creatorName}
            onChange={(v) => set('creatorName', v)}
          />
          <TextField
            label={L.creatorIntro}
            value={show.creatorIntro}
            onChange={(v) => set('creatorIntro', v)}
            placeholder='ההצגה מועברת ע"י...'
          />
          <TextField
            label={L.creatorCredentials}
            value={show.creatorCredentials}
            onChange={(v) => set('creatorCredentials', v)}
          />
          <TextField
            label={L.phone}
            value={show.phone}
            onChange={(v) => set('phone', v)}
            dir="ltr"
            type="tel"
          />
          <TextareaField
            label={L.socialProof}
            value={show.socialProof}
            onChange={(v) => set('socialProof', v)}
            rows={2}
          />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">תמונות</h3>
          <ImageField
            label={L.mainImg}
            value={show.mainImg}
            onChange={(v) => set('mainImg', v)}
            hint="התמונה הראשית שמופיעה בכרטיסיית ההצגה"
            error={errors.mainImg}
          />

          <ArrayField
            label={L.presentationFormats}
            items={show.presentationFormats}
            hint="השתמש/י אם יש מספר גרסאות (כמו תיאטרון בובות + הצגת יחיד) — כל גרסה מקבלת תמונה ותיאור"
            emptyItem={() => ({ image: '', caption: '' })}
            addLabel="גרסה חדשה"
            onChange={(next) => set('presentationFormats', next)}
            renderItem={(item, idx, update) => (
              <>
                <ImageField
                  label={L.presentationFormatsItem.image}
                  value={item.image}
                  onChange={(image) => update({ ...item, image })}
                />
                <TextField
                  label={L.presentationFormatsItem.caption}
                  value={item.caption}
                  onChange={(caption) => update({ ...item, caption })}
                />
              </>
            )}
          />

          <GalleryField
            label={L.gallery}
            images={show.gallery}
            onChange={(next) => set('gallery', next)}
            hint="גלריית תמונות נוספות שמופיעות בתחתית עמוד ההצגה"
          />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">{L.video._section}</h3>

          <ArrayField
            label={L.video.trailers}
            items={show.video.trailers}
            emptyItem={() => ''}
            addLabel="טריילר"
            onChange={(next) => updateVideo('trailers', next)}
            renderItem={(item, idx, update) => (
              <YouTubeIdField label={`טריילר ${idx + 1}`} value={item} onChange={update} />
            )}
          />

          <MultiSelectField
            label={L.clipIds}
            selected={show.clipIds}
            options={clipOptions}
            onChange={(next) => set('clipIds', next)}
            hint='בוחרים מתוך "ספריית סרטונים → טעימות מההצגות". להוספת סרטון חדש — היכנסי ללשונית הספרייה.'
            emptyText='אין סרטונים בספרייה — לכי ל"ספריית סרטונים" כדי להוסיף.'
          />

          <MultiSelectField
            label={L.customerClipIds}
            selected={show.customerClipIds}
            options={customerClipOptions}
            onChange={(next) => set('customerClipIds', next)}
            hint='בוחרים מתוך "ספריית סרטונים → אנשים מדברים על ההצגות".'
            emptyText='אין עדויות בספרייה — לכי ל"ספריית סרטונים" כדי להוסיף.'
          />
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">המלצות מקושרות</h3>
          <MultiSelectField
            label={L.recommendationIds}
            selected={show.recommendationIds}
            options={recOptions}
            onChange={(next) => set('recommendationIds', next)}
            emptyText="אין המלצות במערכת — הוסף/י המלצות לפני קישור"
          />
        </section>

        {confirmDelete && (
          <div className="v2-modal-backdrop" onClick={() => setConfirmDelete(false)}>
            <div className="v2-modal" onClick={(e) => e.stopPropagation()}>
              <h3>למחוק את ההצגה "{show.title}"?</h3>
              <p>הפעולה הזו לא הפיכה. הגיבוי המקומי שלך עדיין יכיל את ההצגה.</p>
              <div className="v2-modal-actions">
                <button className="v2-btn v2-btn-secondary" onClick={() => setConfirmDelete(false)}>
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

      <aside className="v2-editor-preview">
        <ShowPreview show={show} />
      </aside>
    </div>
  );
}
