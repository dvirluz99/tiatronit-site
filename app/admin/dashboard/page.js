'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/admin/login');
        return;
      }
      setUser(currentUser);
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/admin/login');
    router.refresh();
  };

  if (checking) {
    return (
      <div className="admin-login-page">
        <p className="admin-login-loading">טוען...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>דשבורד ניהול</h1>
        <p>שלום, {user?.email}</p>
        <button type="button" onClick={handleLogout} className="admin-logout-btn">
          התנתקי
        </button>
      </div>
      <nav className="admin-dashboard-nav">
        <Link href="/admin/cms">ניהול תוכן (CMS)</Link>
        <Link href="/admin/update-images">עדכון תמונות</Link>
        <Link href="/admin/migrate">מיגרציה</Link>
      </nav>
      <p className="admin-dashboard-welcome">מכאן אפשר לניהול כרטיסיות, הצגות, המלצות, עמודים והגדרות – או לדפי עדכון תמונות ומיגרציה.</p>
    </div>
  );
}
