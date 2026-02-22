import styles from './page.module.css';
import { getPuppetsData } from '../../lib/data'; // ודא שהנתיב נכון

// מחקנו את ה-'use client' כדי שנוכל להשתמש ב-async/await (Server Component)
export default async function PuppetsPage() {
  
  // מושכים את הנתונים מ-Firebase
  const data = await getPuppetsData();

  if (!data) return <div style={{textAlign: 'center', padding: '50px'}}>טוען נתונים...</div>;

  return (
    <div className={styles.container}>
      
      {/* כותרת הדף */}
      <header className={styles.header}>
        <h1 className={styles.title}>{data.title}</h1>
        {/* שימוש ב-dangerouslySetInnerHTML בגלל ה-<br /> שיש בכותרת המשנה */}
        <p 
            className={styles.subtitle} 
            dangerouslySetInnerHTML={{ __html: data.subtitle }} 
        />
      </header>

      {/* הטמעת סרטון יוטיוב */}
      <section className={styles.videoSection}>
        <div className={styles.videoWrapper}>
          <iframe
            src={`https://www.youtube.com/embed/${data.youtubeVideoId}`}
            title="הסבר על הבובות"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* כרטיס המידע הגדול */}
      <section className={styles.infoSection}>
        <div className={styles.infoCard}>
          
          <h2 className={styles.infoTitle}>{data.infoTitle}</h2>
          <p className={styles.paragraph}>{data.paragraph}</p>

          <div className={styles.divider}></div>

          <h3 className={styles.subTitle}>{data.subTitle}</h3>
          
          <ul className={styles.infoList}>
            {/* רצים על מערך העקרונות במקום לכתוב אותם ידנית */}
            {data.infoList.map((item, index) => (
                <li key={index}>
                    <strong>{item.title}</strong> {item.text}
                </li>
            ))}
          </ul>

          <div className={styles.summaryBox}>
            <p>{data.summaryQuote}</p>
          </div>

        </div>
      </section>

    </div>
  );
}