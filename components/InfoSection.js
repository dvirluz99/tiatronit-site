'use client';

import Link from 'next/link';
import styles from './InfoSection.module.css';
import ScrollReveal from './ScrollReveal';

const infoCards = [
  {
    id: 1,
    label: 'הגישה',
    title: 'הבובה ככלי לביטוי רגשי',
    imgSrc:
      'https://firebasestorage.googleapis.com/v0/b/teatronit-db.firebasestorage.app/o/AllDir%2Fgeneral_photo%2Fimage3.jpg?alt=media&token=e1b13905-7e19-4e68-ae9a-12b59dc965f8',
    imgAlt: 'ילד משחק בבובה',
    description: `הבובה היא הרבה מעבר למשחק. היא גשר לנפש.
בעולם הטיפול והחינוך, הבובה משמשת כ"אובייקט מתווך" המאפשר לילדים — וגם למבוגרים — להשליך עליה רגשות, פחדים ותקוות בצורה בטוחה ומוגנת.
דרך הבובה, המחסומים יורדים, הלב נפתח, ומתאפשר שיח עמוק ומרפא על נושאים שלפעמים קשה לבטא במילים ישירות.`,
    href: '/about',
    linkText: 'קראו עוד עליי',
    action: 'link',
  },
  {
    id: 2,
    label: 'המפגשים',
    title: 'הצגות וסדנאות מעוררות השראה',
    imgSrc:
      'https://firebasestorage.googleapis.com/v0/b/teatronit-db.firebasestorage.app/o/AllDir%2Fgeneral_photo%2Fimage4.jpg?alt=media&token=b4a3e39d-32d3-4568-bb4b-69b777818f41',
    imgAlt: 'הצגה מול קהל',
    description: `אני מציעה מגוון רחב של פעילויות המותאמות לכל גיל ולכל צורך.
החל מהצגות ילדים סוחפות שמשלבות הומור וערכים, דרך סדנאות עומק לצוותי חינוך וטיפול, ועד למפגשים מרגשים לגיל השלישי.
כל מפגש הוא חוויה ייחודית המשלבת את קסם התיאטרון עם תובנות מעולם הנפש.`,
    href: '#shows-grid',
    linkText: 'לכל הפעילויות',
    action: 'scroll',
  },
];

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5l-7 7 7 7" />
  </svg>
);

export default function InfoSection() {

  const scrollToShows = (e) => {
    e.preventDefault();
    const target = document.getElementById('shows-grid');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.wrapper}>
      {infoCards.map((item, index) => {
        const isReverse = index % 2 === 1;
        return (
          <section
            key={item.id}
            className={`${styles.section} ${isReverse ? styles.sectionAlt : ''}`}
          >
            <div className={`${styles.container} ${isReverse ? styles.reverse : ''}`}>

              <ScrollReveal variant="slide-right" className={styles.text}>
                <span className={styles.label}>{item.label}</span>
                <h2 className={styles.title}>{item.title}</h2>
                <p className={styles.description}>{item.description}</p>

                {item.action === 'scroll' ? (
                  <button onClick={scrollToShows} className={styles.cta} type="button">
                    {item.linkText}
                    <Arrow />
                  </button>
                ) : (
                  <Link href={item.href} className={styles.cta}>
                    {item.linkText}
                    <Arrow />
                  </Link>
                )}
              </ScrollReveal>

              <ScrollReveal variant="slide-left" className={styles.media} delay={120}>
                <div className={styles.imageWrap}>
                  <img
                    src={item.imgSrc}
                    alt={item.imgAlt}
                    className={styles.image}
                    loading="lazy"
                  />
                </div>
              </ScrollReveal>

            </div>
          </section>
        );
      })}
    </div>
  );
}
