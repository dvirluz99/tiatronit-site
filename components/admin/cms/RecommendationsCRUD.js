'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { htmlToPlain } from '../../../lib/recommendationContent';

const CONTENT_MAX_LENGTH = 15000;

export default function RecommendationsCRUD({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    id: '',
    type: 'recommendation',
    recommenderName: '',
    recommenderRole: '',
    date: '',
    relatedShow: '',
    content: '',
    linkedShowId: '',
    contactInfo: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'recommendations'));
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      setItems(list);
    } catch (e) {
      showToast?.('שגיאה בטעינת ההמלצות: ' + e.message, 'error');
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
      id: `rec${Date.now().toString(36)}`,
      type: 'recommendation',
      recommenderName: '',
      recommenderRole: '',
      date: '',
      relatedShow: '',
      content: '',
      linkedShowId: '',
      contactInfo: '',
    });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    const rawContent = item.content || '';
    const contentForEdit = typeof rawContent === 'string' && rawContent.trim().startsWith('<')
      ? htmlToPlain(rawContent)
      : rawContent;
    setForm({
      id: item.id,
      type: item.type || 'recommendation',
      recommenderName: item.recommenderName || '',
      recommenderRole: item.recommenderRole || '',
      date: item.date || '',
      relatedShow: item.relatedShow || '',
      content: contentForEdit,
      linkedShowId: item.linkedShowId || '',
      contactInfo: item.contactInfo || '',
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

  const save = async () => {
    if (!form.id?.trim()) {
      showToast?.('מזהה המלצה חובה', 'error');
      return;
    }
    setSaving(true);
    try {
      const docId = form.id.trim();
      const data = {
        type: 'recommendation',
        recommenderName: form.recommenderName.trim(),
        recommenderRole: form.recommenderRole.trim(),
        date: form.date.trim(),
        relatedShow: form.relatedShow.trim(),
        content: form.content.trim(),
        linkedShowId: form.linkedShowId.trim() || '',
        contactInfo: form.contactInfo.trim() || '',
      };
      if (editingId) {
        await updateDoc(doc(db, 'recommendations', docId), data);
        showToast?.('ההמלצה עודכנה בהצלחה');
      } else {
        await setDoc(doc(db, 'recommendations', docId), { id: docId, ...data });
        showToast?.('ההמלצה נוספה בהצלחה');
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
      await deleteDoc(doc(db, 'recommendations', id));
      showToast?.('ההמלצה נמחקה');
      load();
    } catch (e) {
      showToast?.('שגיאה במחיקה: ' + e.message, 'error');
    }
  };

  return (
    <div className="cms-panel">
      <h2>ניהול המלצות (recommendations)</h2>
      {loading ? (
        <p className="admin-login-loading">טוען...</p>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <button type="button" className="cms-btn cms-btn-primary" onClick={openAdd}>
              + המלצה חדשה
            </button>
          </div>
          <div className="cms-table-wrap">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>מזהה</th>
                  <th>שם הממליץ</th>
                  <th>תפקיד</th>
                  <th>תאריך</th>
                  <th>מתייחס להצגה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.recommenderName}</td>
                    <td>{item.recommenderRole}</td>
                    <td>{item.date}</td>
                    <td>{item.relatedShow}</td>
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
            <h3>{editingId ? 'עריכת המלצה' : 'המלצה חדשה'}</h3>
            <form className="cms-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
              <div className="cms-form-row">
                <label className="cms-label">מזהה (id)</label>
                <input
                  className="cms-input"
                  value={form.id}
                  onChange={(e) => updateForm('id', e.target.value)}
                  disabled={!!editingId}
                  placeholder="rec1"
                />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">שם הממליץ</label>
                <input
                  className="cms-input"
                  value={form.recommenderName}
                  onChange={(e) => updateForm('recommenderName', e.target.value)}
                  placeholder="שם מלא"
                />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">תפקיד / מוסד</label>
                <input
                  className="cms-input"
                  value={form.recommenderRole}
                  onChange={(e) => updateForm('recommenderRole', e.target.value)}
                  placeholder="מנהלת גן, מועצה אזורית..."
                />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">תאריך</label>
                <input
                  className="cms-input"
                  value={form.date}
                  onChange={(e) => updateForm('date', e.target.value)}
                  placeholder="17.12.2024"
                />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">מתייחס להצגה (relatedShow)</label>
                <input
                  className="cms-input"
                  value={form.relatedShow}
                  onChange={(e) => updateForm('relatedShow', e.target.value)}
                  placeholder="כוחה של מילה"
                />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">קישור להצגה (linkedShowId)</label>
                <input
                  className="cms-input"
                  value={form.linkedShowId}
                  onChange={(e) => updateForm('linkedShowId', e.target.value)}
                  placeholder="/show/p1"
                />
              </div>
              <div className="cms-form-row">
                <label className="cms-label">תוכן ההמלצה (טקסט רגיל)</label>
                <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 0.35rem 0' }}>
                  כתבי בכתב רגיל. שורה ריקה תהפוך לפסקה חדשה. מגבלת תווים: {CONTENT_MAX_LENGTH.toLocaleString()}.
                </p>
                <textarea
                  className="cms-textarea"
                  value={form.content}
                  onChange={(e) => updateForm('content', e.target.value.slice(0, CONTENT_MAX_LENGTH))}
                  rows={12}
                  maxLength={CONTENT_MAX_LENGTH}
                  placeholder="טקסט ההמלצה...&#10;&#10;פסקה שנייה אחרי שורה ריקה."
                />
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{(form.content || '').length.toLocaleString()} / {CONTENT_MAX_LENGTH.toLocaleString()}</span>
              </div>
              <div className="cms-form-row">
                <label className="cms-label">פרטי התקשרות (contactInfo)</label>
                <input
                  className="cms-input"
                  value={form.contactInfo}
                  onChange={(e) => updateForm('contactInfo', e.target.value)}
                  placeholder="08-8594172"
                />
              </div>
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
            <h3>מחיקת המלצה</h3>
            <p>האם למחוק את ההמלצה &quot;{deleteConfirm}&quot;? פעולה זו לא ניתנת לביטול.</p>
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
