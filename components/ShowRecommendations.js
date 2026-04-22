import Link from 'next/link';
import { getRecommendations } from '../lib/data';
import { plainTextToHtml } from '../lib/recommendationContent';
import VideoSectionToggle from './VideoSectionToggle';
import styles from './ShowRecommendations.module.css';

// הוספנו את userVideos לכאן
export default async function ShowRecommendations({ recommendationIds, showId, userVideos }) {
  
  const recommendationsData = await getRecommendations();
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
      
        {hasTextRecs && (
        <>
            <h3 className={styles.title}>משתפים על ההצגה</h3>
            <div className={styles.grid}>
                {summaryRecs.map((rec) => (
                <div key={rec.id} className={styles.card}>
                    <div className="quote-icon">❝</div> 
                    
                    {/* --- התיקון כאן: שימוש ב-className במקום style --- */}
                    <div
                        className={styles.testiText} 
                        dangerouslySetInnerHTML={{ __html: plainTextToHtml(rec.content) }}
                    />
                    {/* ------------------------------------------------ */}

                    <div>
                        <span className="testi-author">{rec.recommenderName}</span>
                        <br />
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>{rec.recommenderRole}</span>
                    </div>
                </div>
                ))}
            </div>
            
            {/* ... כפתור קרא עוד ... */}
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

      {hasVideos && (
        <div className={styles.videoSection}>
          <VideoSectionToggle
            videos={userVideos}
            title="אנשים מדברים"
            defaultCount={2}
          />
        </div>
      )}

    </div>
  );
}