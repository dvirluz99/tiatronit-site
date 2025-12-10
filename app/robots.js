export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // דוגמה, אם תרצה לחסום משהו בעתיד
    },
    sitemap: 'https://tiatronit-site.vercel.app/sitemap.xml',
  }
}