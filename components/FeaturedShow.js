import styles from './FeaturedShow.module.css';
import Link from 'next/link'; 

export default function FeaturedShow() {
  
    return (
    // קונטיינר עוטף כדי לסדר את הכותרת מעל הכרטיס
    <div className={styles.container}>
      
      {/* הכותרת החדשה */}
      <h2 className={styles.sectionTitle}>מומלץ ומרתק! 💡</h2>

      <div className={styles.cardWrapper}>
        <div className={styles.badge}>אנשים המליצו!</div>
        
        <div className={styles.imageContainer}>
          <img 
            src="/AllDir/חוהלה משואה לתקומה/huale_shoah_tkuma1.jpg" 
            alt="הצגה חדשה" 
            className={styles.cardImage}
          />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>חוהל'ה - משואה לתקומה</h3>
          <p className={styles.excerpt}>
            מסע מרגש של אמונה ותקווה. הצגה שנוגעת בלב ומחזקת את הרוח.
          </p>
          <Link href='show/p1' className={styles.footer}>
            <span className={styles.rating}>⭐ 5.0</span>
            <button className={styles.linkButton}>לפרטים &larr;</button>
          </Link>
        </div>
      </div>
    </div>
  );
}