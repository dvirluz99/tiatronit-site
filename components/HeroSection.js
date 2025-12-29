'use client'; 

import styles from './HeroSection.module.css';
import FeaturedShow from './FeaturedShow';

export default function HeroSection() {
  
  const scrollToShows = () => {
    const showsSection = document.getElementById('shows-grid');
    if (showsSection) {
      showsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    // קונטיינר ראשי שקוף - אחראי רק על המיקום
    <div className={styles.layoutContainer}>
      
      {/* צד ימין: ההמלצה (מחוץ לרקע) */}
      <div className={styles.sidebarWrapper}>
        <FeaturedShow />
      </div>
      
      {/* צד שמאל: כרטיס ה-Hero המעוצב */}
      <section className={styles.heroCard}>
        
        {/* טקסט */}
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
            מוזמנים לראות את ההצגות שלנו ⬇️
          </button>
        </div>

        {/* וידאו/תמונה */}
        <div className={styles.mediaContent}>
          <div className={styles.videoWrapper}>
              <video 
                  className={styles.videoElement}
                  autoPlay 
                  muted 
                  loop 
                  playsInline
              >
                  <source src="/AllDir/videos/Hero_bg.mp4" type="video/mp4" />
                  הדפדפן שלך לא תומך בוידאו.
              </video>
          </div>
        </div>

      </section>

    </div>
  );
}