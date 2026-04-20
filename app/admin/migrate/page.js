'use client';

// Legacy migration UI — DISABLED.
// The real migration from v1 to v2 is performed by scripts/migrate-to-v2.ts,
// which was run once on 2026-04-20. This page is kept as a placeholder so any
// bookmarks don't 404, but the button no longer mutates data.

export default function MigratePage() {
  return (
    <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1>כלי מיגרציה (לא פעיל)</h1>
      <p style={{ color: '#555' }}>
        הכלי הזה הושבת. המיגרציה הגדולה ל-v2 הושלמה בצורה חד-פעמית דרך
        <code> scripts/migrate-to-v2.ts</code>, והדשבורד כותב עכשיו גם ל-v2 אוטומטית.
      </p>
      <p style={{ color: '#555' }}>
        אם אתה צריך להריץ תיקונים נוספים על הנתונים, תעשה את זה דרך סקריפטים עם
        גיבוי מראש (ראה <code>scripts/backup-firestore.mjs</code>).
      </p>
    </div>
  );
}
