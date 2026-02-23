'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import ImageUploadComponent from '../ImageUploadComponent';
import GalleryEditor from '../GalleryEditor';

function linkRecToString(arr) {
  return Array.isArray(arr) ? arr.join(', ') : '';
}

function stringToLinkRec(str) {
  if (!str || !str.trim()) return [];
  return str.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
}

function youtubeEmbedHtml(youtubeId) {
  const id = (youtubeId || '').trim().replace(/^.*(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+).*$/, '$1');
  if (!id) return '';
  return `<iframe class="vidue_iframe" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}

const emptyShowData = () => ({
  title: '',
  description: '',
  creatorIntro: '',
  creatorName: '',
  creatorCredentials: '',
  audience: '',
  phone: '',
  socialProof: '',
});

const emptyVidue = () => ({
  Trailer: [],
  customers: [],
  clips: [],
});

export default function ShowsCRUD({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    id: '',
    title: '',
    type: 'single',
    category: 'adults',
    importance: '',
    linkRec: [],
    mainImg: '',
    mainImg1: '',
    textUnderImg1: '',
    mainImg2: '',
    textUnderImg2: '',
    arrayGallery: [],
    showData: emptyShowData(),
    vidue: emptyVidue(),
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [trailerYoutubeIds, setTrailerYoutubeIds] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'shows'));
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      setItems(list);
    } catch (e) {
      showToast?.('שגיאה בטעינת ההצגות: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      id: 'p' + Date.now().toString(36),
      title: '',
      type: 'single',
      category: 'adults',
      importance: '',
      linkRec: [],
      mainImg: '',
      mainImg1: '',
      textUnderImg1: '',
      mainImg2: '',
      textUnderImg2: '',
      arrayGallery: [],
      showData: emptyShowData(),
      vidue: emptyVidue(),
    });
    setTrailerYoutubeIds('');
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    const sd = item.showData || {};
    const vidue = item.vidue || {};
    const trailer = vidue.Trailer;
    const trailerIds = Array.isArray(trailer)
      ? trailer
          .map((html) => {
            const m = (html || '').match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
            return m ? m[1] : '';
          })
          .filter(Boolean)
          .join(', ')
      : '';
    setTrailerYoutubeIds(trailerIds);
    setForm({
      id: item.id,
      title: item.title || '',
      type: item.type || 'single',
      category: item.category || 'adults',
      importance: item.importance || '',
      linkRec: item.linkRec || [],
      mainImg: item.mainImg || '',
      mainImg1: item.mainImg1 || '',
      textUnderImg1: item.textUnderImg1 || '',
      mainImg2: item.mainImg2 || '',
      textUnderImg2: item.textUnderImg2 || '',
      arrayGallery: item.arrayGallery || [],
      showData: {
        title: sd.title || '',
        description: sd.description || '',
        creatorIntro: sd.creatorIntro || '',
        creatorName: sd.creatorName || '',
        creatorCredentials: sd.creatorCredentials || '',
        audience: sd.audience || '',
        phone: sd.phone || '',
        socialProof: sd.socialProof || '',
      },
      vidue: {
        Trailer: Array.isArray(vidue.Trailer) ? vidue.Trailer : [],
        customers: Array.isArray(vidue.customers) ? vidue.customers : [],
        clips: Array.isArray(vidue.clips) ? vidue.clips : [],
      },
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setSaving(false);
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateShowData = (key, value) => {
    setForm((prev) => ({
      ...prev,
      showData: { ...prev.showData, [key]: value },
    }));
  };

  const updateVidue = (key, value) => {
    setForm((prev) => ({
      ...prev,
      vidue: { ...prev.vidue, [key]: value },
    }));
  };

  const addVidueCustomer = () => {
    updateVidue('customers', [...(form.vidue.customers || []), { youtubeId: '', caption: '' }]);
  };

  const setVidueCustomer = (index, field, value) => {
    const next = (form.vidue.customers || []).map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    updateVidue('customers', next);
  };

  const removeVidueCustomer = (index) => {
    updateVidue(
      'customers',
      (form.vidue.customers || []).filter((_, i) => i !== index)
    );
  };

  const addVidueClip = () => {
    updateVidue('clips', [...(form.vidue.clips || []), { youtubeId: '', caption: '' }]);
  };

  const setVidueClip = (index, field, value) => {
    const next = (form.vidue.clips || []).map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    updateVidue('clips', next);
  };

  const removeVidueClip = (index) => {
    updateVidue(
      'clips',
      (form.vidue.clips || []).filter((_, i) => i !== index)
    );
  };

  const save = async () => {
    if (!form.id?.trim()) {
      showToast?.('מזהה הצגה חובה', 'error');
      return;
    }
    setSaving(true);
    try {
      const docId = form.id.trim();
      const trailerIds = trailerYoutubeIds.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
      const Trailer = trailerIds.map((id) => youtubeEmbedHtml(id)).filter(Boolean);

      const arrayGallery = (Array.isArray(form.arrayGallery) ? form.arrayGallery : [])
        .filter((i) => i && (i.img || typeof i === 'string'))
        .map((i) => (typeof i === 'string' ? { img: i } : { img: i.img || '' }));

      const data = {
        title: form.title.trim(),
        type: form.type || 'single',
        category: (form.category || 'adults').trim(),
        importance: (form.importance || '').trim(),
        linkRec: stringToLinkRec(linkRecToString(form.linkRec)),
        mainImg: (form.mainImg || '').trim(),
        mainImg1: (form.mainImg1 || '').trim(),
        textUnderImg1: (form.textUnderImg1 || '').trim(),
        mainImg2: (form.mainImg2 || '').trim(),
        textUnderImg2: (form.textUnderImg2 || '').trim(),
        arrayGallery,
        showData: {
          title: (form.showData.title || '').trim(),
          description: (form.showData.description || '').trim(),
          creatorIntro: (form.showData.creatorIntro || '').trim(),
          creatorName: (form.showData.creatorName || '').trim(),
          creatorCredentials: (form.showData.creatorCredentials || '').trim(),
          audience: (form.showData.audience || '').trim(),
          phone: (form.showData.phone || '').trim(),
          socialProof: (form.showData.socialProof || '').trim(),
        },
        vidue: {
          Trailer,
          customers: (form.vidue.customers || []).filter((c) => (c.youtubeId || '').trim()),
          clips: (form.vidue.clips || []).filter((c) => (c.youtubeId || '').trim()),
        },
      };

      if (editingId) {
        await updateDoc(doc(db, 'shows', docId), data);
        showToast?.('ההצגה עודכנה בהצלחה');
      } else {
        await setDoc(doc(db, 'shows', docId), { id: docId, ...data });
        showToast?.('ההצגה נוספה בהצלחה');
      }
      closeForm();
      load();
    } catch (e) {
      showToast?.('שגיאה בשמירה: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm;
    setDeleteConfirm(null);
    try {
      await deleteDoc(doc(db, 'shows', id));
      showToast?.('ההצגה נמחקה');
      load();
    } catch (e) {
      showToast?.('שגיאה במחיקה: ' + e.message, 'error');
    }
  };

  const displayImg = (item) => item.mainImg || item.mainImg1 || item.mainImg2;

  return (
    <div className="cms-panel">
      <h2>ניהול הצגות (shows)</h2>
      {loading ? (
        <p className="admin-login-loading">טוען...</p>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <button type="button" className="cms-btn cms-btn-primary" onClick={openAdd}>
              + הצגה חדשה
            </button>
          </div>
          <div className="cms-table-wrap">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>תמונה</th>
                  <th>מזהה</th>
                  <th>כותרת</th>
                  <th>קטגוריה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {displayImg(item) ? (
                        <img src={displayImg(item)} alt="" className="cms-cell-img" />
                      ) : (
                        <span style={{ color: '#999' }}>—</span>
                      )}
                    </td>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.category || '—'}</td>
                    <td>
                      <div className="cms-actions">
                        <button type="button" className="cms-btn cms-btn-secondary" onClick={() => openEdit(item)}>
                          ערוך
                        </button>
                        <button type="button" className="cms-btn cms-btn-danger" onClick={() => setDeleteConfirm(item.id)}>
                          מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {formOpen && (
        <div className="cms-modal-overlay" onClick={closeForm}>
          <div className="cms-modal cms-modal--wide" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'עריכת הצגה' : 'הצגה חדשה'}</h3>
            <form className="cms-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
              <div className="cms-form-row">
                <label className="cms-label">מזהה (id)</label>
                <input className="cms-input" value={form.id} onChange={(e) => updateForm('id', e.target.value)} disabled={!!editingId} placeholder="p1" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">כותרת</label>
                <input className="cms-input" value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="חוהל'ה משואה לתקומה" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">קטגוריה (category)</label>
                <select className="cms-select" value={form.category} onChange={(e) => updateForm('category', e.target.value)}>
                  <option value="adults">adults</option>
                  <option value="kids">kids</option>
                  <option value="youth">youth</option>
                </select>
              </div>
              <div className="cms-form-row">
                <label className="cms-label">חשיבות (importance)</label>
                <input className="cms-input" value={form.importance} onChange={(e) => updateForm('importance', e.target.value)} placeholder="recommended / accustomed" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">המלצות (linkRec)</label>
                <input className="cms-input" value={linkRecToString(form.linkRec)} onChange={(e) => updateForm('linkRec', stringToLinkRec(e.target.value))} placeholder="rec1, rec2" />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #b8daf2', margin: '0.75rem 0' }} />
              <strong className="cms-label">תמונות כותרת</strong>
              <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 0.5rem 0' }}>לוגו אחד: mainImg. שני לוגואים: mainImg1 + mainImg2 (עם טקסט מתחת).</p>
              <div className="cms-form-row">
                <label className="cms-label">תמונה אחת (mainImg)</label>
                <ImageUploadComponent subfolder="shows" currentImageUrl={form.mainImg} onUpload={(url) => updateForm('mainImg', url)} label="" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">לוגו 1 (mainImg1)</label>
                <ImageUploadComponent subfolder="shows" currentImageUrl={form.mainImg1} onUpload={(url) => updateForm('mainImg1', url)} label="" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">טקסט מתחת לוגו 1 (textUnderImg1)</label>
                <input className="cms-input" value={form.textUnderImg1} onChange={(e) => updateForm('textUnderImg1', e.target.value)} placeholder="העברת ההצגה באמצעות תיאטרון בובות" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">לוגו 2 (mainImg2)</label>
                <ImageUploadComponent subfolder="shows" currentImageUrl={form.mainImg2} onUpload={(url) => updateForm('mainImg2', url)} label="" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">טקסט מתחת לוגו 2 (textUnderImg2)</label>
                <input className="cms-input" value={form.textUnderImg2} onChange={(e) => updateForm('textUnderImg2', e.target.value)} />
              </div>

              <GalleryEditor label="גלריית תמונות (arrayGallery)" subfolder="shows" items={form.arrayGallery} onChange={(arr) => updateForm('arrayGallery', arr)} />

              <hr style={{ border: 'none', borderTop: '1px solid #b8daf2', margin: '0.75rem 0' }} />
              <strong className="cms-label">פרטי ההצגה (showData)</strong>
              <div className="cms-form-row">
                <label className="cms-label">showData.title</label>
                <input className="cms-input" value={form.showData.title} onChange={(e) => updateShowData('title', e.target.value)} />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">showData.description</label>
                <textarea className="cms-textarea" value={form.showData.description} onChange={(e) => updateShowData('description', e.target.value)} rows={3} />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">creatorIntro</label>
                <input className="cms-input" value={form.showData.creatorIntro} onChange={(e) => updateShowData('creatorIntro', e.target.value)} placeholder='ההצגה מועברת ע"י נכדתם,' />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">creatorName</label>
                <input className="cms-input" value={form.showData.creatorName} onChange={(e) => updateShowData('creatorName', e.target.value)} />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">creatorCredentials</label>
                <input className="cms-input" value={form.showData.creatorCredentials} onChange={(e) => updateShowData('creatorCredentials', e.target.value)} />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">audience</label>
                <input className="cms-input" value={form.showData.audience} onChange={(e) => updateShowData('audience', e.target.value)} placeholder="מתאים לכל הגילאים החל מכיתה ד'" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">phone</label>
                <input className="cms-input" value={form.showData.phone} onChange={(e) => updateShowData('phone', e.target.value)} placeholder="0542043429" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">socialProof</label>
                <textarea className="cms-textarea" value={form.showData.socialProof} onChange={(e) => updateShowData('socialProof', e.target.value)} rows={2} />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #b8daf2', margin: '0.75rem 0' }} />
              <strong className="cms-label">וידאו (vidue)</strong>
              <div className="cms-form-row">
                <label className="cms-label">טריילר – מזהי YouTube (מופרדים בפסיק)</label>
                <input className="cms-input" value={trailerYoutubeIds} onChange={(e) => setTrailerYoutubeIds(e.target.value)} placeholder="7bcTavMpMZM, iHc3BcP99hY" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">סרטוני לקוחות (customers) – youtubeId + caption</label>
                {(form.vidue.customers || []).map((c, i) => (
                  <div key={i} className="cms-gallery-add" style={{ marginBottom: '0.5rem' }}>
                    <input className="cms-input" placeholder="YouTube ID" value={c.youtubeId} onChange={(e) => setVidueCustomer(i, 'youtubeId', e.target.value)} style={{ width: '120px' }} />
                    <input className="cms-input" placeholder="כיתוב" value={c.caption} onChange={(e) => setVidueCustomer(i, 'caption', e.target.value)} style={{ flex: 1, minWidth: '140px' }} />
                    <button type="button" className="cms-btn cms-btn-danger" onClick={() => removeVidueCustomer(i)}>הסר</button>
                  </div>
                ))}
                <button type="button" className="cms-btn cms-btn-secondary" onClick={addVidueCustomer}>+ הוסף סרטון לקוח</button>
              </div>
              <div className="cms-form-row">
                <label className="cms-label">טעימות (clips) – youtubeId + caption</label>
                {(form.vidue.clips || []).map((c, i) => (
                  <div key={i} className="cms-gallery-add" style={{ marginBottom: '0.5rem' }}>
                    <input className="cms-input" placeholder="YouTube ID" value={c.youtubeId} onChange={(e) => setVidueClip(i, 'youtubeId', e.target.value)} style={{ width: '120px' }} />
                    <input className="cms-input" placeholder="כיתוב" value={c.caption} onChange={(e) => setVidueClip(i, 'caption', e.target.value)} style={{ flex: 1, minWidth: '140px' }} />
                    <button type="button" className="cms-btn cms-btn-danger" onClick={() => removeVidueClip(i)}>הסר</button>
                  </div>
                ))}
                <button type="button" className="cms-btn cms-btn-secondary" onClick={addVidueClip}>+ הוסף טעימה</button>
              </div>

              <div className="cms-modal-actions">
                <button type="button" className="cms-btn cms-btn-secondary" onClick={closeForm}>ביטול</button>
                <button type="submit" className="cms-btn cms-btn-primary" disabled={saving}>{saving ? 'שומר...' : 'שמור'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="cms-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="cms-modal" onClick={(e) => e.stopPropagation()}>
            <h3>מחיקת הצגה</h3>
            <p>האם למחוק את ההצגה &quot;{deleteConfirm}&quot;? פעולה זו לא ניתנת לביטול.</p>
            <div className="cms-modal-actions">
              <button type="button" className="cms-btn cms-btn-secondary" onClick={() => setDeleteConfirm(null)}>ביטול</button>
              <button type="button" className="cms-btn cms-btn-danger" onClick={doDelete}>מחק</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
