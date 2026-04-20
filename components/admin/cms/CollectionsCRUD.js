'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { saveCollection, deleteCollection } from '../../../lib/v1-to-v2-sync';
import ImageUploadComponent from '../ImageUploadComponent';
import GalleryEditor from '../GalleryEditor';

function youtubeEmbedHtml(youtubeId) {
  const id = (youtubeId || '').trim().replace(/^.*(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+).*$/, '$1');
  if (!id) return '';
  return `<iframe class="vidue_iframe" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}

const EMPTY_CARD = {
  id: '',
  title: '',
  mainImg: '',
  importance: '',
  type: 'single',
  linkedShowId: '',
  linkRec: [],
  collectionGallery: [],
  contains: [],
  description: '',
  collectionVideo: [],
};

function linkRecToString(arr) {
  return Array.isArray(arr) ? arr.join(', ') : '';
}

function stringToLinkRec(str) {
  if (!str || !str.trim()) return [];
  return str.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
}

export default function CollectionsCRUD({ showToast }) {
  const [items, setItems] = useState([]);
  const [showsMap, setShowsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_CARD);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [addShowId, setAddShowId] = useState('');
  const [collectionVideoIds, setCollectionVideoIds] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [colSnap, showsSnap] = await Promise.all([
        getDocs(collection(db, 'collections')),
        getDocs(collection(db, 'shows')),
      ]);
      const list = [];
      colSnap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      setItems(list);

      const shows = {};
      showsSnap.forEach((d) => {
        shows[d.id] = { id: d.id, title: d.data().title || d.id };
      });
      setShowsMap(shows);
    } catch (e) {
      showToast?.('שגיאה בטעינת הכרטיסיות: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_CARD, id: `card_${Date.now().toString(36)}`, collectionGallery: [], contains: [], description: '', collectionVideo: [] });
    setCollectionVideoIds('');
    setAddShowId('');
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    const cv = item.collectionVideo;
    const videoIds = Array.isArray(cv)
      ? cv
          .map((html) => {
            const m = (html || '').match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
            return m ? m[1] : '';
          })
          .filter(Boolean)
          .join(', ')
      : '';
    setCollectionVideoIds(videoIds);
    setForm({
      id: item.id,
      title: item.title || '',
      mainImg: item.mainImg || '',
      importance: item.importance || '',
      type: item.type || 'single',
      linkedShowId: item.linkedShowId || '',
      linkRec: item.linkRec || [],
      collectionGallery: item.collectionGallery || [],
      contains: Array.isArray(item.contains) ? [...item.contains] : [],
      description: item.description || '',
      collectionVideo: Array.isArray(cv) ? cv : [],
    });
    setAddShowId('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_CARD);
  };

  const save = async () => {
    if (!form.id?.trim()) {
      showToast?.('שדה מזהה (id) חובה', 'error');
      return;
    }
    if (!form.title?.trim()) {
      showToast?.('כותרת חובה', 'error');
      return;
    }
    setSaving(true);
    try {
      const docId = form.id.trim();
      const linkRecArr = Array.isArray(form.linkRec) ? form.linkRec : stringToLinkRec(linkRecToString(form.linkRec));
      const collectionGallery = (Array.isArray(form.collectionGallery) ? form.collectionGallery : [])
        .filter((i) => i && (i.img || typeof i === 'string'))
        .map((i) => (typeof i === 'string' ? { img: i } : { img: i.img || '' }));
      const contains = form.type === 'collection' && Array.isArray(form.contains) ? form.contains.filter(Boolean) : [];
      const collectionVideo = collectionVideoIds
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((id) => youtubeEmbedHtml(id))
        .filter(Boolean);

      const data = {
        title: form.title.trim(),
        mainImg: form.mainImg.trim() || '',
        importance: form.importance.trim() || '',
        type: form.type || 'single',
        linkedShowId: form.type === 'single' ? (form.linkedShowId || '').trim() : '',
        linkRec: linkRecArr,
        collectionGallery,
        description: (form.description || '').trim(),
        collectionVideo,
      };
      if (form.type === 'collection') {
        data.contains = contains;
      } else {
        data.contains = [];
      }

      await saveCollection(docId, data);
      showToast?.(editingId ? 'הכרטיסייה עודכנה בהצלחה' : 'הכרטיסייה נוספה בהצלחה');
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
      await deleteCollection(id);
      showToast?.('הכרטיסייה נמחקה');
      load();
    } catch (e) {
      showToast?.('שגיאה במחיקה: ' + e.message, 'error');
    }
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addContainsShow = () => {
    const id = addShowId.trim();
    if (!id) return;
    const next = [...(form.contains || []), id];
    if (next.filter((x) => x === id).length > 1) return;
    updateForm('contains', next);
    setAddShowId('');
  };

  const removeContainsShow = (index) => {
    updateForm(
      'contains',
      (form.contains || []).filter((_, i) => i !== index)
    );
  };

  const showTitles = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return '—';
    return ids.map((id) => showsMap[id]?.title || id).join(', ');
  };

  return (
    <div className="cms-panel">
      <h2>ניהול כרטיסיות (collections)</h2>
      {loading ? (
        <p className="admin-login-loading">טוען...</p>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <button type="button" className="cms-btn cms-btn-primary" onClick={openAdd}>
              + כרטיסייה חדשה
            </button>
          </div>
          <div className="cms-table-wrap">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>תמונה</th>
                  <th>מזהה</th>
                  <th>כותרת</th>
                  <th>סוג</th>
                  <th>הצגות בכרטיס</th>
                  <th>חשיבות</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.mainImg ? (
                        <img src={item.mainImg} alt="" className="cms-cell-img" />
                      ) : (
                        <span style={{ color: '#999' }}>—</span>
                      )}
                    </td>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.type || '—'}</td>
                    <td title={item.type === 'single' ? (item.linkedShowId || '') : (item.contains || []).join(', ')}>
                      {item.type === 'single'
                        ? item.linkedShowId
                          ? (showsMap[item.linkedShowId]?.title || item.linkedShowId)
                          : '—'
                        : showTitles(item.contains)}
                    </td>
                    <td>{item.importance || '—'}</td>
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
            <h3>{editingId ? 'עריכת כרטיסייה' : 'כרטיסייה חדשה'}</h3>
            <form className="cms-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
              <div className="cms-form-row">
                <label className="cms-label">מזהה מסמך (id)</label>
                <input
                  className="cms-input"
                  value={form.id}
                  onChange={(e) => updateForm('id', e.target.value)}
                  disabled={!!editingId}
                  placeholder="card_9"
                />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">כותרת</label>
                <input
                  className="cms-input"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="כותרת הכרטיסייה"
                />
              </div>
              <ImageUploadComponent
                subfolder="general_photo"
                currentImageUrl={form.mainImg}
                onUpload={(url) => updateForm('mainImg', url)}
                label="תמונה ראשית (mainImg)"
              />
              <div className="cms-form-row">
                <label className="cms-label">סוג (type)</label>
                <select className="cms-select" value={form.type} onChange={(e) => updateForm('type', e.target.value)}>
                  <option value="single">single – קישור להצגה אחת (linkedShowId)</option>
                  <option value="collection">collection – אוסף הצגות (contains)</option>
                </select>
              </div>

              {form.type === 'single' && (
                <div className="cms-form-row">
                  <label className="cms-label">מזהה הצגה (linkedShowId)</label>
                  <select
                    className="cms-select"
                    value={form.linkedShowId}
                    onChange={(e) => updateForm('linkedShowId', e.target.value)}
                  >
                    <option value="">— בחרי הצגה —</option>
                    {Object.entries(showsMap).map(([id, s]) => (
                      <option key={id} value={id}>{s.title || id}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.type === 'collection' && (
                <div className="cms-form-row">
                  <label className="cms-label">הצגות באוסף (contains)</label>
                  <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 0.5rem 0' }}>הוסיפי הצגות שיופיעו בתוך הכרטיסייה.</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.5rem 0' }}>
                    {(form.contains || []).map((showId, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{ flex: 1 }}>{showsMap[showId]?.title || showId}</span>
                        <button type="button" className="cms-btn cms-btn-danger" onClick={() => removeContainsShow(i)}>הסר</button>
                      </li>
                    ))}
                  </ul>
                  <div className="cms-gallery-add">
                    <select
                      className="cms-select"
                      value={addShowId}
                      onChange={(e) => setAddShowId(e.target.value)}
                      style={{ maxWidth: '280px' }}
                    >
                      <option value="">— הוספת הצגה לאוסף —</option>
                      {Object.entries(showsMap)
                        .filter(([id]) => !(form.contains || []).includes(id))
                        .map(([id, s]) => (
                          <option key={id} value={id}>{s.title || id}</option>
                        ))}
                    </select>
                    <button type="button" className="cms-btn cms-btn-primary" onClick={addContainsShow}>
                      הוסף להצגות
                    </button>
                  </div>
                </div>
              )}

              <div className="cms-form-row">
                <label className="cms-label">סרטון יוטיוב לאוסף (collectionVideo)</label>
                <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 0.35rem 0' }}>מזהי YouTube מופרדים בפסיק – יוצגו כ&quot;צפו בטעימה מהסדנא&quot;</p>
                <input className="cms-input" value={collectionVideoIds} onChange={(e) => setCollectionVideoIds(e.target.value)} placeholder="KRCoCcJ3eU8, 97jA2ir7Uu0" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">תיאור (description) – לאוסף</label>
                <textarea className="cms-textarea" value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={2} placeholder="ההצגות לילדים משלבות רכות שמחה והקשבה" />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">חשיבות (importance)</label>
                <input
                  className="cms-input"
                  value={form.importance}
                  onChange={(e) => updateForm('importance', e.target.value)}
                  placeholder="recommended / accustomed / ריק"
                />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">המלצות (linkRec) – מפרידים בפסיק</label>
                <input
                  className="cms-input"
                  value={linkRecToString(form.linkRec)}
                  onChange={(e) => updateForm('linkRec', stringToLinkRec(e.target.value))}
                  placeholder="rec1, rec2"
                />
              </div>
              <GalleryEditor
                label="גלריית תמונות (collectionGallery)"
                subfolder="general_photo"
                items={form.collectionGallery}
                onChange={(arr) => updateForm('collectionGallery', arr)}
              />
              <div className="cms-modal-actions">
                <button type="button" className="cms-btn cms-btn-secondary" onClick={closeForm}>
                  ביטול
                </button>
                <button type="submit" className="cms-btn cms-btn-primary" disabled={saving}>
                  {saving ? 'שומר...' : 'שמור'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="cms-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="cms-modal" onClick={(e) => e.stopPropagation()}>
            <h3>מחיקת כרטיסייה</h3>
            <p>האם למחוק את הכרטיסייה &quot;{deleteConfirm}&quot;? פעולה זו לא ניתנת לביטול.</p>
            <div className="cms-modal-actions">
              <button type="button" className="cms-btn cms-btn-secondary" onClick={() => setDeleteConfirm(null)}>
                ביטול
              </button>
              <button type="button" className="cms-btn cms-btn-danger" onClick={doDelete}>
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
