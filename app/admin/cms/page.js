'use client';

import { useCallback, useState } from 'react';
import AdminGuard from '../../../components/admin/AdminGuard';
import Toast from '../../../components/admin/Toast';
import ShowsTab from '../../../components/admin/v2/ShowsTab';
import CollectionsTab from '../../../components/admin/v2/CollectionsTab';
import RecommendationsTab from '../../../components/admin/v2/RecommendationsTab';
import PagesTab from '../../../components/admin/v2/PagesTab';
import Link from 'next/link';
import '../../../components/admin/v2/admin-v2.css';

const TABS = [
  { id: 'shows', label: 'הצגות', Component: ShowsTab },
  { id: 'collections', label: 'כרטיסיות ואוספים', Component: CollectionsTab },
  { id: 'recommendations', label: 'המלצות', Component: RecommendationsTab },
  { id: 'pages', label: 'עמודים והגדרות', Component: PagesTab },
];

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState('shows');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const active = TABS.find((t) => t.id === activeTab);
  const ActiveComponent = active?.Component;

  return (
    <AdminGuard>
      <div className="v2-shell">
        <header className="v2-topbar">
          <div className="v2-topbar-title">
            <h1>ניהול תוכן האתר</h1>
            <Link href="/admin/dashboard" className="v2-topbar-link">← חזרה לדשבורד</Link>
          </div>
          <nav className="v2-tabs" aria-label="אזורי עריכה">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`v2-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="v2-main">
          {ActiveComponent && <ActiveComponent showToast={showToast} />}
        </main>
      </div>

      {toast && (
        <div className="cms-toast-container">
          <Toast message={toast.message} type={toast.type} onClose={closeToast} />
        </div>
      )}
    </AdminGuard>
  );
}
