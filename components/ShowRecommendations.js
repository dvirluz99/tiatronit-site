import Link from 'next/link';
import { recommendationsData } from '../data/presentations';
import styles from './ShowRecommendations.module.css'; 

// הוספנו את userVideos לכאן
export default function ShowRecommendations({ recommendationIds, showId, userVideos }) {
  
  // לוגיקה קיימת של המלצות טקסט...
  const relevantRecs = recommendationIds
    ? recommendationIds.map((recId) => recommendationsData[recId]).filter(Boolean)
    : [];

  // נציג את הקומפוננטה אם יש המלצות טקסט או סרטונים
  const hasTextRecs = relevantRecs.length > 0;
  const hasVideos = userVideos && userVideos.length > 0;

  if (!hasTextRecs && !hasVideos) return null;

  const summaryRecs = relevantRecs.slice(0, 3);

  return (
    <div className={styles.container}>
      
      {/* --- חלק 1: המלצות טקסט (קיים) --- */}
      {hasTextRecs && (
        <>
            <h3 className={styles.title}>משתפים על ההצגה</h3>
            <div className={styles.grid}>
                {summaryRecs.map((rec) => (
                <div key={rec.id} className={styles.card}>
                    <div className="quote-icon">❝</div> 
                    <div
                    className="testi-text"
                    style={{
                        fontSize: '1rem',
                        marginBottom: '1rem',
                        maxHeight: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                    dangerouslySetInnerHTML={{ __html: rec.content }}
                    />
                    <div>
                    <span className="testi-author">{rec.recommenderName}</span>
                    <br />
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{rec.recommenderRole}</span>
                    </div>
                </div>
                ))}
            </div>
             {relevantRecs.length > 3 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link
                    href={`/recommendation/${showId}`}
                    style={{ color: '#2998f4', fontWeight: 'bold', textDecoration: 'underline' }}
                >
                    קראו עוד {relevantRecs.length - 3} המלצות...
                </Link>
                </div>
            )}
        </>
      )}

      {/* --- חלק 2: סרטוני לקוחות (חדש!) --- */}
      {hasVideos && (
        <div className={styles.videoSection}>
            <h3 className={styles.subTitle}>אנשים מדברים</h3>
            
            <div className={styles.videoGrid}>
                {userVideos.map((video, index) => (
                    <div key={index} className={styles.videoCard}>
                        <video 
                            controls 
                            className={styles.videoPlayer}
                            // אופציונלי: פוסטר (תמונה מקדימה) לפני שמנגנים
                            // poster="/path/to/poster.jpg" 
                        >
                            <source src={video.src} type="video/mp4" />
                            דפדפן זה לא תומך בוידאו.
                        </video>
                        {video.caption && (
                            <div className={styles.videoCaption}>{video.caption}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}

    </div>
  );
}