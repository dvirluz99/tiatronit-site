import { showData, homePageStructure } from './data/presentations';

export default function sitemap() {
  // 1. הגדר את הכתובת הראשית של האתר (מה שקיבלת מ-Vercel או הדומיין שלך)
  // חשוב: בלי לוכסן בסוף
  const baseUrl = 'https://tiatronit-site.vercel.app'; 

  // 2. דפים סטטיים שיש לך באתר
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/testimonials',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));

  // 3. יצירת רשימה של כל ההצגות (Single Shows)
  const showsRoutes = Object.values(showData).map((show) => ({
    url: `${baseUrl}/show/${show.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9, // עדיפות גבוהה
  }));

  // 4. יצירת רשימה של כל האוספים (Collections)
  // מסננים רק את אלו שהם מסוג collection
  const collectionsRoutes = homePageStructure
    .filter((item) => item.type === 'collection')
    .map((collection) => ({
      url: `${baseUrl}/collection/${collection.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  // 5. איחוד כל הרשימות
  return [...staticRoutes, ...showsRoutes, ...collectionsRoutes];
}