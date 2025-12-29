export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // דוגמה, אם תרצה לחסום משהו בעתיד
    },
    sitemap: 'https://www.ronitluz.co.il/sitemap.xml',
  }
}