'use client';

import styles from './HeroSection.module.css';
import ScrollReveal from './ScrollReveal';

export default function HeroSection() {

  const scrollToShows = () => {
    const target = document.getElementById('shows-grid');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <ScrollReveal variant="slide-right" className={styles.content}>
        <span className={styles.eyebrow}>תיאטרון בובות רגשי–חברתי</span>

        <h1 id="hero-title" className={styles.title}>
          <span className={styles.titleAccent}>תיאטרונית</span>
          {' '}— חוויה של נפש ובמה
        </h1>

        <p className={styles.subtitle}>
          הקמתי את תיאטרונית מתוך אהבה ושליחות, לחבר בין אנשים, רגשות ובמה.{' '}
          <strong>בובהתרפיה</strong> היא כלי עוצמתי ליצירת קשר, עיבוד רגשי והעצמה —
          לילדים, בני נוער, מבוגרים וקשישים. שילוב ייחודי של אמנות, טיפול וחינוך,
          המעניק חוויה מקרבת, מרגשת ובלתי נשכחת.
        </p>

        <div className={styles.actions}>
          <button onClick={scrollToShows} className={styles.ctaPrimary}>
            לראות את ההצגות
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M19 12l-7 7-7-7" />
            </svg>
          </button>
          <a href="/contact" className={styles.ctaSecondary}>
            ליצירת קשר
          </a>
        </div>
      </ScrollReveal>

      <ScrollReveal variant="slide-left" className={styles.media} delay={120}>
        <div className={styles.videoFrame}>
          <video autoPlay muted loop playsInline preload="auto">
            <source
              src="https://firebasestorage.googleapis.com/v0/b/teatronit-db.firebasestorage.app/o/AllDir%2Fvideos%2FHero_bg.mp4?alt=media&token=55e77b04-89c6-4d38-b502-4e7274b46272"
              type="video/mp4"
            />
          </video>
          <div className={styles.mediaBadge}>עם הלב, בכל גיל</div>
        </div>
      </ScrollReveal>

      <ScrollReveal className={styles.stats} delay={240}>
        <div className={styles.stat}>
          <div className={styles.statNumber}>+15</div>
          <div className={styles.statLabel}>הצגות וסדנאות</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>+20</div>
          <div className={styles.statLabel}>המלצות מקצועיות</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>כל הגילאים</div>
          <div className={styles.statLabel}>מילדים עד הגיל השלישי</div>
        </div>
      </ScrollReveal>
    </section>
  );
}
