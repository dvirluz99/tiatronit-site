'use client';

import styles from './page.module.css';

// --- זה ה-ID של הסרטון מיוטיוב ---
const YOUTUBE_VIDEO_ID = 'NhaQDVbDp4o'; 

export default function PuppetsPage() {
  return (
    <div className={styles.container}>
      
      {/* כותרת הדף */}
      <header className={styles.header}>
        <h1 className={styles.title}>עולם הבובות של תיאטרונית</h1>
        <p className={styles.subtitle}>
          כיצד מפעילים בובה? איך יוצרים קשר?
          <br />
          המדריך המלא לעבודה רגשית עם בובות טיפוליות.
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

      {/* כרטיס המידע הגדול (במקום הגריד) */}
      <section className={styles.infoSection}>
        <div className={styles.infoCard}>
          
          <h2 className={styles.infoTitle}>הפילוסופיה שמאחורי הבובה</h2>
          <p className={styles.paragraph}>
            הבובה היא הרבה מעבר לחפץ או צעצוע. בגישת "תיאטרונית", הבובה משמשת כגשר – 
            היא מאפשרת לנו, כמטפלים או כהורים, לעקוף הגנות ולגעת ברגש בצורה עדינה ובטוחה.
            כשאנחנו מפעילים בובה, אנחנו מעניקים לה נשמה, והיא בתמורה מעניקה לנו את היכולת להקשיב ולהיראות.
          </p>

          <div className={styles.divider}></div>

          <h3 className={styles.subTitle}>עקרונות להפעלה נכונה</h3>
          <ul className={styles.infoList}>
            <li>
              <strong>קשר עין:</strong> הבובה צריכה להסתכל על הילד/המטופל, אבל גם עלינו המפעילים. המשולש הזה יוצר אמינות.
            </li>
            <li>
              <strong>נשימה:</strong> כמונו, גם הבובה צריכה "לנשום". תנועות קטנות של בית החזה של הבובה הופכות אותה לאנושית.
            </li>
            <li>
              <strong>הקשבה:</strong> הבובה היא קודם כל דמות מקשיבה. היא לא חייבת לדבר הרבה כדי להיות משמעותית.
            </li>
            <li>
              <strong>תנועה ואופי:</strong> לכל בובה שפת גוף משלה. בובה ביישנית תזוז לאט, בובה אנרגטית תקפוץ. מצאו את הקצב שלה.
            </li>
          </ul>

          <div className={styles.summaryBox}>
            <p>
              "הבובה היא המילים שעדיין לא מצאנו. דרכה, הלב נפתח."
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}