'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('אימייל או סיסמה לא נכונים. נסי שוב.');
      } else if (err.code === 'auth/invalid-email') {
        setError('כתובת אימייל לא תקינה.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('ניסיונות התחברות רבים מדי. נסי שוב מאוחר יותר.');
      } else {
        setError('אירעה שגיאה בהתחברות. נסי שוב.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-page" aria-label="התחברות לאזור הניהול">
      <div className="admin-login-card">
        <h1>התחברות לניהול</h1>
        <p className="admin-login-subtitle">תיאטרונית – אזור מנהלים</p>

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="admin-login-error" role="alert">{error}</div>}

          <label htmlFor="admin-email">אימייל</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            required
            disabled={loading}
          />

          <label htmlFor="admin-password">סיסמה</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'מתחברת...' : 'התחברי'}
          </button>
        </form>
      </div>
    </section>
  );
}
