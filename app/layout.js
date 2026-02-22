import './styles/base.css';
import './styles/header.css';
import './styles/cards.css';
import './styles/show.css';
import './styles/pages.css';
import './styles/footer.css';
import './styles/carousel.css';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import { getHomePageStructure, getAllShows } from '../lib/data';

export const metadata = {

  metadataBase: new URL('https://www.ronitluz.co.il'), // הכתובת של האתר שלך (או localhost בפיתוח)
  
  title: 'תיאטרונית',
  description: 'תיאטרון בובות רגשי חברתי - רונית לוז',
  alternates: {
    canonical: './',
  },
  
  icons: {
    icon: '/icon.jpg'
  },
  verification: {
    google: "hbe7WTCRBWSeMHA68wKCQfUyPmqk6B7iMYFtnRpUWZg",
  },
  openGraph: {
    title: 'תיאטרונית | בובותרפיה רגשית-חברתית',
    description: 'חוויה ייחודית של תיאטרון בובות, סדנאות והצגות לכל הגילאים. רונית לוז.',
    url: 'https://www.ronitluz.co.il', // או הדומיין הפרטי שלך
    siteName: 'תיאטרונית',
    images: [
      {
        url: '/AllDir/logo/logo1.jpg', // <--- הנתיב לתמונה הכי יפה באתר שלך (לוגו, תמונה ראשית)
        width: 1200,
        height: 630,
        alt: 'רונית לוז, בובותרפיה',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
};

export default async function RootLayout({ children }) {

  const homePageStructure = await getHomePageStructure();
  const showData = await getAllShows();
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* קישורים לפונטים ולאייקונים כמו בקובץ המקורי */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        <Header homePageStructure={homePageStructure} showData={showData}/>
        
        {/* ה-children זה בעצם העמוד הספציפי שאנחנו נמצאים בו (דף הבית, אודות וכו') */}
        {children}
        
        <Footer />
      </body>
    </html>
  );
}