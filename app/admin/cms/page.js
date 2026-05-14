'use client';

import { useCallback, useState } from 'react';
import AdminGuard from '../../../components/admin/AdminGuard';
import Toast from '../../../components/admin/Toast';
import ShowsTab from '../../../components/admin/v2/ShowsTab';
import HomepageTab from '../../../components/admin/v2/HomepageTab';
import HomeTestimonialsTab from '../../../components/admin/v2/HomeTestimonialsTab';
import CategoriesTab from '../../../components/admin/v2/CategoriesTab';
import RecommendationsTab from '../../../components/admin/v2/RecommendationsTab';
import ClipsLibraryTab from '../../../components/admin/v2/ClipsLibraryTab';
import ImagesLibraryTab from '../../../components/admin/v2/ImagesLibraryTab';
import PagesTab from '../../../components/admin/v2/PagesTab';
import Link from 'next/link';
import '../../../components/admin/v2/admin-v2.css';

const TABS = [
  { id: 'homepage', label: 'דף הבית', Component: HomepageTab },
  { id: 'homeTestimonials', label: 'המלצות בדף הבית', Component: HomeTestimonialsTab },
  { id: 'shows', label: 'הצגות וסדנאות', Component: ShowsTab },
  { id: 'categories', label: 'קטגוריות', Component: CategoriesTab },
  { id: 'recommendations', label: 'המלצות', Component: RecommendationsTab },
  { id: 'clips', label: 'ספריית סרטונים', Component: ClipsLibraryTab },
  { id: 'images', label: 'ספריית תמונות', Component: ImagesLibraryTab },
  { id: 'pages', label: 'עמודים והגדרות', Component: PagesTab },
];

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState('homepage');
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
