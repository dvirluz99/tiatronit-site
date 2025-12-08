'use client'; // כדי שהגלילה לכפתור תעבוד חלק

import styles from './HeroSection.module.css';

export default function HeroSection() {
  
  // פונקציה לגלילה חלקה לאזור ההצגות
  const scrollToShows = () => {
    const showsSection = document.getElementById('shows-grid');
    if (showsSection) {
      showsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.heroWrapper}>
      
      {/* צד ימין: טקסט */}
      <div className={styles.textContent}>
        <h1 className={styles.title}>
        <span className={styles.highlight}>תיאטרונית-</span>
        תיאטרון בובות רגשי חברתי
        </h1>
        
        <p className={styles.description}>
          הקמתי את תיאטרונית מתוך אהבה ושליחות - לחבר בין אנשים, רגשות ובמה.
          <br />
          <strong> בובהתרפיה</strong> 
          <span> היא כלי עוצמתי ליצירת קשר, עיבוד רגשי והעצמה- לילדים, נוער, מבוגרים, וקשישים. שילוב ייחודי של אמנות, טיפול וחינוך, המעניק חוויה מקרבת, מרגשת ובלתי נשכחת.</span>
        </p>

        <button onClick={scrollToShows} className={styles.ctaButton}>
          מוזמנים לראות את ההצגות שלנו 🡨
        </button>
      </div>

      {/* צד שמאל: וידאו / תמונה */}
      <div className={styles.mediaContent}>
        <div className={styles.videoWrapper}>
            {/* אם אין לך וידאו עדיין, תחליף את תגית ה-video בתגית img */}
            <video 
                className={styles.videoElement}
                autoPlay 
                muted 
                loop 
                playsInline
                // poster="/AllDir/poster_image.jpg" // תמונה שרואים לפני שהוידאו נטען
            >
                {/* שים לב: עדכן את הנתיב לשם הקובץ האמיתי שלך */}
                <source src="/AllDir/videos/home_hero.mp4" type="video/mp4" />
                הדפדפן שלך לא תומך בוידאו.
            </video>
        </div>
      </div>

    </section>
  );
}