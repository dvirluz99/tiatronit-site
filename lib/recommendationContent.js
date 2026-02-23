/**
 * המרת טקסט רגיל ל-HTML לתצוגת ההמלצות.
 * פסקאות מופרדות בשורה ריקה (\n\n). שורה חדשה בודדת -> <br/>.
 * אם התוכן כבר נראה כמו HTML (מתחיל ב-<), מחזירים כמו שהוא (תאימות לאחור).
 */
export function plainTextToHtml(text) {
  if (text == null || typeof text !== 'string') return '';
  const t = text.trim();
  if (!t) return '';
  if (t.startsWith('<')) return t;
  const escaped = t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const paras = escaped.split(/\n\n+/).filter((p) => p.trim());
  if (paras.length === 0) return '';
  return paras.map((p) => '<p>' + p.trim().replace(/\n/g, '<br/>') + '</p>').join('');
}

/**
 * המרת HTML לטקסט רגיל לעריכה ב-CMS (לנתונים ישנים).
 */
export function htmlToPlain(html) {
  if (html == null || typeof html !== 'string') return '';
  return html
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
