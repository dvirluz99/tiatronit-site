import { showData, homePageStructure } from '../data/presentations';

export default function sitemap() {
  const baseUrl = 'https://tiatronit-site.vercel.app'; 
  
  // תיקון: יצירת תאריך בפורמט פשוט שגוגל אוהב (YYYY-MM-DD)
  const currentDate = new Date().toISOString().split('T')[0];

  // 2. דפים סטטיים
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/testimonials',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate, // שימוש בתאריך הנקי
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));

  // 3. הצגות
  const showsRoutes = Object.values(showData).map((show) => ({
    // encodeURIComponent מבטיח שאם יש רווח או עברית ב-ID, זה לא ישבור את הקובץ
    url: `${baseUrl}/show/${encodeURIComponent(show.id)}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 4. אוספים
  const collectionsRoutes = homePageStructure
    .filter((item) => item.type === 'collection')
    .map((collection) => ({
      url: `${baseUrl}/collection/${encodeURIComponent(collection.id)}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  return [...staticRoutes, ...showsRoutes, ...collectionsRoutes];
}