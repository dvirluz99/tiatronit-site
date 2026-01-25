'use client';

import Image from 'next/image';
import styles from './page.module.css';
import {puppetsData} from '../../data/presentations.js';

// --- זה ה-ID של הסרטון מיוטיוב ---
// עליך להחליף את הקוד הזה בקוד של הסרטון של אמא שלך
const YOUTUBE_VIDEO_ID = 'NhaQDVbDp4o'; 

export default function PuppetsPage() {
  return (
    <div className={styles.container}>
      
      {/* כותרת הדף */}
      <header className={styles.header}>
        <h1 className={styles.title}>הכירו את עולם הבובות</h1>
        <p className={styles.subtitle}>
          לכל בובה יש שם, אופי וסיפור משלה. 
          <br />
          הן עוזרות לנו לדבר על הדברים החשובים באמת בחיוך ובהומור.
        </p>
      </header>

      {/* הטמעת סרטון יוטיוב */}
      <section className={styles.videoSection}>
        <div className={styles.videoWrapper}>
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
            title="הסבר על הבובות"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* גריד כרטיסיות הבובות */}
      <section className={styles.grid}>
        {puppetsData.map((puppet) => (
          <div key={puppet.id} className={styles.card}>
            
            {/* תמונת הבובה */}
            <div className={styles.imageContainer}>
                {/* הערה: אם אין לך עדיין תמונות, אפשר להשתמש ב-img רגיל בינתיים.
                   Next/Image דורש הגדרת רוחב/גובה או fill.
                */}
                <div className={styles.placeholderImage}>
                    {/* כשתהיה תמונה אמיתית, נשתמש בזה: */}
                    {/* <Image src={puppet.image} alt={puppet.name} fill style={{objectFit: 'cover'}} /> */}
                    <span>תמונה של {puppet.name}</span>
                </div>
            </div>

            {/* טקסט */}
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{puppet.name}</h3>
              <div className={styles.divider}></div>
              <p className={styles.cardDesc}>{puppet.description}</p>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}