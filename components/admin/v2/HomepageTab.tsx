'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  LABELS,
  HomepageSchema,
  type Homepage,
  type HomepageItem,
  type Show,
  type Category,
} from '../../../lib/schema';
import { listAll, saveValidated } from '../../../lib/firestore-v2';

const L = LABELS.homepage;
const C = LABELS.common;

type Props = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

export default function HomepageTab({ showToast }: Props) {
  const [data, setData] = useState<Homepage | null>(null);
  const [shows, setShows] = useState<Array<{ id: string; data: Show }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; data: Category }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [snap, s, c] = await Promise.all([
        getDoc(doc(db, 'settings_v2', 'homepage')),
        listAll<Show>('shows_v2'),
        listAll<Category>('categories_v2').catch(
          () => [] as Array<{ id: string; data: Category }>,
        ),
      ]);
      setShows(s.sort((a, b) => a.id.localeCompare(b.id)));
      setCategories(c.sort((a, b) => a.id.localeCompare(b.id)));
      const parsed = snap.exists()
        ? HomepageSchema.safeParse(snap.data())
        : { success: true as const, data: { items: [] } as Homepage };
      setData(parsed.success ? parsed.data : { items: [] });
    })();
  }, []);

  if (!data) return <p className="v2-empty">טוען...</p>;

  function update(items: HomepageItem[]) {
    setData({ items });
  }

  function addItem(kind: 'show' | 'category', id: string) {
    if (!id) return;
    if (data!.items.some((it) => it.kind === kind && it.id === id)) {
      showToast('הפריט כבר קיים ברשימה', 'error');
      return;
    }
    update([...data!.items, { kind, id }]);
  }

  function remove(idx: number) {
    update(data!.items.filter((_, i) => i !== idx));
  }

  function move(idx: number, delta: number) {
    const next = [...data!.items];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    update(next);
  }

  async function save() {
    setSaving(true);
    try {
      const result = await saveValidated('settings_v2', 'homepage', data, HomepageSchema);
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

  const showsById = Object.fromEntries(shows.map((s) => [s.id, s.data]));
  const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c.data]));

  function itemLabel(it: HomepageItem): string {
    if (it.kind === 'show') {
      const s = showsById[it.id];
      const prefix = s?.kind === 'workshop' ? '🎭' : '📺';
      return `${prefix} ${s?.title || `(חסר: ${it.id})`}`;
    }
    if (it.kind === 'category') {
      return `🗂️ ${categoriesById[it.id]?.title || `(חסר: ${it.id})`}`;
    }
    return it.id;
  }

  const availableShows = shows.filter(
    (s) => !data.items.some((it) => it.kind === 'show' && it.id === s.id),
  );
  const availableCategories = categories.filter(
    (c) => !data.items.some((it) => it.kind === 'category' && it.id === c.id),
  );

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

        <section className="v2-section">
          <label className="v2-field-label">{L.items}</label>
          <p className="v2-field-hint">
            סדר הכרטיסיות בדף הבית. החיצים ↑ ↓ מזיזים, × מסיר. ההוספה מהטפסים למטה.
          </p>

          <div className="v2-array-list">
            {data.items.map((it, idx) => (
              <div key={`${it.kind}:${it.id}`} className="v2-array-item">
                <div className="v2-array-item-body" style={{ padding: 'var(--sp-3)' }}>
                  <strong style={{ fontSize: 'var(--fs-base)' }}>{itemLabel(it)}</strong>
                  <div style={{ color: 'var(--c-text-muted)', fontSize: 'var(--fs-xs)' }}>
                    {it.kind === 'show' ? 'הצגה / סדנא' : 'קטגוריה'} · {it.id}
                  </div>
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
            ))}
            {data.items.length === 0 && <p className="v2-empty">הרשימה ריקה</p>}
          </div>
        </section>

        <section className="v2-section">
          <h3 className="v2-section-title">הוספה לרשימה</h3>

          <div className="v2-row" style={{ gap: 'var(--sp-4)' }}>
            <AddControl
              label="הוספת הצגה / סדנא"
              options={availableShows.map((s) => ({
                value: s.id,
                label: `${s.data.kind === 'workshop' ? '🎭' : '📺'} ${s.data.title || s.id}`,
              }))}
              onAdd={(id) => addItem('show', id)}
              emptyText="כל ההצגות כבר ברשימה"
            />
            <AddControl
              label="הוספת קטגוריה"
              options={availableCategories.map((c) => ({
                value: c.id,
                label: `🗂️ ${c.data.title || c.id}`,
              }))}
              onAdd={(id) => addItem('category', id)}
              emptyText="כל הקטגוריות כבר ברשימה (או שעוד לא יצרת)"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function AddControl({
  label,
  options,
  onAdd,
  emptyText,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  onAdd: (id: string) => void;
  emptyText: string;
}) {
  const [pick, setPick] = useState('');

  if (options.length === 0) {
    return (
      <div className="v2-field" style={{ flex: 1 }}>
        <label className="v2-field-label">{label}</label>
        <p className="v2-empty">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="v2-field" style={{ flex: 1 }}>
      <label className="v2-field-label">{label}</label>
      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
        <select
          className="v2-input"
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">בחרי פריט...</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="v2-btn v2-btn-secondary"
          onClick={() => {
            if (pick) {
              onAdd(pick);
              setPick('');
            }
          }}
          disabled={!pick}
        >
          +
        </button>
      </div>
    </div>
  );
}
