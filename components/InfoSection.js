'use client';
import Link from 'next/link';
import styles from './InfoSection.module.css';

// --- מבנה הנתונים לכרטיסיות ---
const infoCardsData = [
  {
    id: 1,
    type: 'therapy', // סוג חדש: בובותרפיה
    title: "הבובה ככלי לביטוי רגשי",
    imgSrc: "https://firebasestorage.googleapis.com/v0/b/teatronit-db.firebasestorage.app/o/AllDir%2Fgeneral_photo%2Fimage3.jpg?alt=media&token=e1b13905-7e19-4e68-ae9a-12b59dc965f8", // שים תמונה מתאימה (ילד מחזיק בובה למשל)
    imgAlt: "ילד משחק בבובה",
    description: `
      הבובה היא הרבה מעבר למשחק. היא גשר לנפש.
      בעולם הטיפול והחינוך, הבובה משמשת כ"אובייקט מתווך" המאפשר לילדים (וגם למבוגרים) להשליך עליה רגשות, פחדים ותקוות בצורה בטוחה ומוגנת.
      דרך הבובה, המחסומים יורדים, הלב נפתח, ומתאפשר שיח עמוק ומרפא על נושאים שלפעמים קשה לבטא במילים ישירות.
    `,
    // בחלק הזה אולי אין כפתור, או שיש כפתור "קראו עוד" לעמוד אודות
    linkUrl: "/about",
    linkText: "קראו עוד עלי ←"
  },
  {
    id: 2,
    type: 'activities', // סוג חדש: פעילויות
    title: "הצגות וסדנאות מעוררות השראה",
    imgSrc: "https://firebasestorage.googleapis.com/v0/b/teatronit-db.firebasestorage.app/o/AllDir%2Fgeneral_photo%2Fimage4.jpg?alt=media&token=b4a3e39d-32d3-4568-bb4b-69b777818f41", // תמונה של קהל או הצגה
    imgAlt: "הצגה מול קהל",
    description: `
      אני מציעה מגוון רחב של פעילויות המותאמות לכל גיל ולכל צורך.
      החל מהצגות ילדים סוחפות שמשלבות הומור וערכים, דרך סדנאות עומק לצוותי חינוך וטיפול, ועד למפגשים מרגשים לגיל השלישי.
      כל מפגש הוא חוויה ייחודית המשלבת את קסם התיאטרון עם תובנות מעולם הנפש.
    `,
    linkUrl: "/collection/card_4", // אפשר להפנות לקטלוג הראשי או ליצור דף "שירותים"
    linkText: "לצפייה בכל הפעילויות ←"
  }
];

export default function InfoSection() {

   const scrollToShows = () => {
    const showsSection = document.getElementById('shows-grid');
    if (showsSection) {
      showsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.wrapper}>
      {infoCardsData.map((item, index) => {
        
        const isEven = index % 2 === 0;
        const bgClass = isEven ? styles.bgWhite : styles.bgBlue;
        // במחשב: זוגי = רגיל, אי-זוגי = הפוך
        const layoutClass = isEven ? '' : styles.reverseLayout;

        return (
          <section key={item.id} className={`${styles.fullWidthSection} ${bgClass}`}>
            <div className={`${styles.contentContainer} ${layoutClass}`}>
              
              {/* טקסט */}
              <div className={styles.textContent}>
                <h2 className={styles.title}>{item.title}</h2>
                <p className={styles.description}>{item.description}</p>
                {item.type === 'activities'?(
                    <button onClick={scrollToShows} className={styles.button}>
                        {item.linkText}
                    </button>
                ):(
                    <Link href={item.linkUrl} className={styles.button}>
                        {item.linkText}
                    </Link>
                )}
                
              </div>

              {/* תמונה */}
              <div className={styles.imageWrapper}>
                <img 
                    src={item.imgSrc} 
                    alt={item.imgAlt} 
                    className={styles.image} 
                />
              </div>

            </div>
          </section>
        );
      })}
    </div>
  );
}