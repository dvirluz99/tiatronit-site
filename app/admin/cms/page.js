'use client';

import { useState, useCallback } from 'react';
import AdminGuard from '../../../components/admin/AdminGuard';
import Toast from '../../../components/admin/Toast';
import CollectionsCRUD from '../../../components/admin/cms/CollectionsCRUD';
import ShowsCRUD from '../../../components/admin/cms/ShowsCRUD';
import RecommendationsCRUD from '../../../components/admin/cms/RecommendationsCRUD';
import PagesSettingsCRUD from '../../../components/admin/cms/PagesSettingsCRUD';
import Link from 'next/link';

const TABS = [
  { id: 'collections', label: 'כרטיסיות', Component: CollectionsCRUD },
  { id: 'shows', label: 'הצגות', Component: ShowsCRUD },
  { id: 'recommendations', label: 'המלצות', Component: RecommendationsCRUD },
  { id: 'pages', label: 'עמודים והגדרות', Component: PagesSettingsCRUD },
];

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState('collections');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const active = TABS.find((t) => t.id === activeTab);
  const ActiveComponent = active?.Component;

  return (
    <AdminGuard>
      <div className="admin-dashboard" style={{ maxWidth: '1100px' }}>
        <div className="admin-dashboard-header">
          <h1>ניהול תוכן (CMS)</h1>
          <p>
            <Link href="/admin/dashboard" style={{ color: '#2998f4', fontWeight: 600 }}>← חזרה לדשבורד</Link>
          </p>
          <div style={{ width: '100%' }} />
        </div>

        <nav className="cms-tabs" aria-label="טאבים לניהול תוכן">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`cms-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {ActiveComponent && <ActiveComponent showToast={showToast} />}
      </div>

      {toast && (
        <div className="cms-toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        </div>
      )}
    </AdminGuard>
  );
}
