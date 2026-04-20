'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { savePageAbout, savePagePuppets, saveHomeGallery } from '../../../lib/v1-to-v2-sync';
import ImageUploadComponent from '../ImageUploadComponent';
import { htmlToPlain } from '../../../lib/recommendationContent';

const PAGES_CONFIG = [
  { collection: 'pages', id: 'about', label: 'עמוד אודות' },
  { collection: 'pages', id: 'puppets', label: 'עמוד בובות' },
];

const SETTINGS_CONFIG = [
  { collection: 'settings', id: 'homeGallery', label: 'גלריית דף הבית' },
];

export default function PagesSettingsCRUD({ showToast }) {
  const [activeDoc, setActiveDoc] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [homeGalleryImages, setHomeGalleryImages] = useState([]);
  const [aboutMainDescriptionPlain, setAboutMainDescriptionPlain] = useState('');
  const [puppetsParagraphPlain, setPuppetsParagraphPlain] = useState('');
  const [puppetsSubtitlePlain, setPuppetsSubtitlePlain] = useState('');
  const [addImageUrl, setAddImageUrl] = useState('');

  const allDocs = [...PAGES_CONFIG, ...SETTINGS_CONFIG];

  const loadDoc = async (config) => {
    setActiveDoc(config);
    setLoading(true);
    try {
      const ref = doc(db, config.collection, config.id);
      const snap = await getDoc(ref);
      const raw = snap.exists() ? snap.data() : {};
      setData(raw);

      if (config.id === 'homeGallery') {
        setHomeGalleryImages(Array.isArray(raw.images) ? raw.images : []);
        setAddImageUrl('');
      }
      if (config.id === 'about') {
        const desc = raw.mainDescription || '';
        setAboutMainDescriptionPlain(
          typeof desc === 'string' && desc.trim().startsWith('<') ? htmlToPlain(desc) : desc
        );
      }
      if (config.id === 'puppets') {
        const p = raw.paragraph || '';
        const sub = raw.subtitle || '';
        setPuppetsParagraphPlain(typeof p === 'string' && p.trim().startsWith('<') ? htmlToPlain(p) : p);
        setPuppetsSubtitlePlain(typeof sub === 'string' && sub.trim().startsWith('<') ? htmlToPlain(sub) : sub);
      }
    } catch (e) {
      showToast?.('שגיאה בטעינה: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const addGalleryImage = (url) => {
    if (!url?.trim()) return;
    setHomeGalleryImages((prev) => [...prev, url.trim()]);
    setAddImageUrl('');
  };

  const removeGalleryImage = (index) => {
    setHomeGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!activeDoc) return;
    setSaving(true);
    try {
      const toSave = { ...data };

      if (activeDoc.id === 'homeGallery') {
        toSave.images = homeGalleryImages;
      }

      if (activeDoc.id === 'about') {
        toSave.mainDescription = aboutMainDescriptionPlain;
      }

      if (activeDoc.id === 'puppets') {
        toSave.paragraph = puppetsParagraphPlain;
        toSave.subtitle = puppetsSubtitlePlain;
      }

      if (activeDoc.id === 'about') await savePageAbout(toSave);
      else if (activeDoc.id === 'puppets') await savePagePuppets(toSave);
      else if (activeDoc.id === 'homeGallery') await saveHomeGallery(toSave);
      showToast?.('נשמר בהצלחה');
      setData(toSave);
    } catch (e) {
      showToast?.('שגיאה בשמירה: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cms-panel">
      <h2>עמודים והגדרות (pages &amp; settings)</h2>
      <p style={{ color: '#555', marginBottom: '1rem', fontSize: '0.9rem' }}>
        בחרו מסמך לעריכה. טקסטים נשמרים כטקסט רגיל (לא HTML).
      </p>
      <div className="cms-tabs" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        {allDocs.map((config) => (
          <button
            key={config.collection + '/' + config.id}
            type="button"
            className={`cms-tab ${activeDoc?.id === config.id ? 'active' : ''}`}
            onClick={() => loadDoc(config)}
          >
            {config.label}
          </button>
        ))}
      </div>

      {activeDoc && (
        <div className="cms-modal cms-modal--wide" style={{ marginTop: '1rem', maxHeight: 'none' }}>
          <h3>{activeDoc.label}</h3>
          {loading ? (
            <p className="admin-login-loading">טוען...</p>
          ) : (
            <form className="cms-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
              {activeDoc.id === 'homeGallery' && (
                <>
                  <label className="cms-label">תמונות הגלריה</label>
                  <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 0.5rem 0' }}>
                    הוסיפי תמונות להעלאה או הדבקי קישור. הסדר קובע את תצוגת הגלריה.
                  </p>
                  <div className="cms-gallery-list" style={{ marginBottom: '1rem' }}>
                    {homeGalleryImages.map((url, index) => (
                      <div key={index} className="cms-gallery-item">
                        <img src={url} alt="" />
                        <button type="button" className="cms-gallery-item-remove" onClick={() => removeGalleryImage(index)} aria-label="הסר">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="cms-gallery-add" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                    <ImageUploadComponent subfolder="general_photo" onUpload={addGalleryImage} label="העלאת תמונה" />
                    <span style={{ alignSelf: 'center' }}>או קישור:</span>
                    <input type="url" className="cms-input" placeholder="https://..." value={addImageUrl} onChange={(e) => setAddImageUrl(e.target.value)} style={{ maxWidth: '280px' }} />
                    <button type="button" className="cms-btn cms-btn-secondary" onClick={() => addGalleryImage(addImageUrl)}>הוסף</button>
                  </div>
                </>
              )}

              {activeDoc.id === 'about' && (
                <>
                  <div className="cms-form-row">
                    <label className="cms-label">כותרת (title)</label>
                    <input className="cms-input" value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
                  </div>
                  <div className="cms-form-row">
                    <label className="cms-label">תמונה ראשית (mainImage)</label>
                    <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 0.35rem 0' }}>תמונה שמופיעה בעמוד אודות. אפשר להחליף בהעלאה.</p>
                    {data.mainImage && (
                      <div className="cms-image-preview" style={{ marginBottom: '0.5rem' }}>
                        <img src={data.mainImage.startsWith('http') ? data.mainImage : `/${data.mainImage}`} alt="תצוגה נוכחית" />
                      </div>
                    )}
                    <ImageUploadComponent subfolder="general_photo" currentImageUrl={data.mainImage?.startsWith('http') ? data.mainImage : (data.mainImage ? `/${data.mainImage}` : '')} onUpload={(url) => updateField('mainImage', url)} label="" />
                  </div>
                  <div className="cms-form-row">
                    <label className="cms-label">תיאור (mainDescription) – טקסט רגיל</label>
                    <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 0.35rem 0' }}>שורה ריקה = פסקה חדשה. לא צריך HTML.</p>
                    <textarea className="cms-textarea" value={aboutMainDescriptionPlain} onChange={(e) => setAboutMainDescriptionPlain(e.target.value)} rows={8} placeholder="טקסט העמוד..." />
                  </div>
                </>
              )}

              {activeDoc.id === 'puppets' && (
                <>
                  <div className="cms-form-row">
                    <label className="cms-label">title</label>
                    <input className="cms-input" value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
                  </div>
                  <div className="cms-form-row">
                    <label className="cms-label">subtitle – טקסט רגיל</label>
                    <textarea className="cms-textarea" value={puppetsSubtitlePlain} onChange={(e) => setPuppetsSubtitlePlain(e.target.value)} rows={2} />
                  </div>
                  <div className="cms-form-row">
                    <label className="cms-label">youtubeVideoId</label>
                    <input className="cms-input" value={data.youtubeVideoId || ''} onChange={(e) => updateField('youtubeVideoId', e.target.value)} placeholder="מזהה הסרטון" />
                  </div>
                  <div className="cms-form-row">
                    <label className="cms-label">infoTitle</label>
                    <input className="cms-input" value={data.infoTitle || ''} onChange={(e) => updateField('infoTitle', e.target.value)} />
                  </div>
                  <div className="cms-form-row">
                    <label className="cms-label">paragraph – טקסט רגיל</label>
                    <textarea className="cms-textarea" value={puppetsParagraphPlain} onChange={(e) => setPuppetsParagraphPlain(e.target.value)} rows={4} />
                  </div>
                  <div className="cms-form-row">
                    <label className="cms-label">subTitle</label>
                    <input className="cms-input" value={data.subTitle || ''} onChange={(e) => updateField('subTitle', e.target.value)} />
                  </div>
                  <div className="cms-form-row">
                    <label className="cms-label">summaryQuote</label>
                    <textarea className="cms-textarea" value={data.summaryQuote || ''} onChange={(e) => updateField('summaryQuote', e.target.value)} rows={2} />
                  </div>
                </>
              )}

              <div className="cms-modal-actions" style={{ marginTop: '1rem' }}>
                <button type="submit" className="cms-btn cms-btn-primary" disabled={saving}>{saving ? 'שומר...' : 'שמור'}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
