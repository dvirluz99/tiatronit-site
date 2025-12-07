import Link from 'next/link';
import { recommendationsData, showData } from '../../../data/presentations';

export default async function RecommendationsPage({ params }) {
  const { id } = await params;

  // --- לוגיקה לשליפת ההמלצות (כמו ב-ClassPresentation שלך) ---
  let relevantRecommendations = [];
  
  // מקרה א': ה-ID הוא של המלצה ספציפית (מתחיל ב-rec)
  if (id.startsWith('rec')) {
    if (recommendationsData[id]) {
      relevantRecommendations.push(recommendationsData[id]);
    }
  } 
  // מקרה ב': ה-ID הוא של הצגה (למשל p2), אז מביאים את כל ההמלצות שלה
  else if (showData[id] && showData[id].linkRec) {
    relevantRecommendations = showData[id].linkRec.map(recId => recommendationsData[recId]).filter(Boolean);
  }

  // אם לא מצאנו כלום
  if (relevantRecommendations.length === 0) {
    return (
      <main className="continer_main_for_home">
         <div style={{textAlign: 'center', marginTop: '50px'}}>
            <h2>לא נמצאו המלצות</h2>
            <Link href="/" style={{color: 'blue', textDecoration: 'underline'}}>חזרה לדף הבית</Link>
         </div>
      </main>
    );
  }

  return (
    <main className="continer_main_for_home">
      <div className="recommendation-page-wrapper">
        
        {/* כותרת הדף */}
        <h2 className="recommendation-header">המלצות חמות</h2>

        {/* רשימת הכרטיסים */}
        <div className="recommendations-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {relevantRecommendations.map((rec) => (
            <div key={rec.id} className="recommendation-card-full">
              
              <div className="rec-meta">
                <span className="rec-role">
                  <strong>{rec.recommenderName}</strong>
                  <br />
                  <span style={{ fontSize: '0.9em', color: '#666' }}>{rec.recommenderRole}</span>
                </span>
                <span className="rec-date">{rec.date}</span>
              </div>
              
              {/* תוכן ההמלצה (מכיל HTML ולכן משתמשים ב-dangerouslySetInnerHTML) */}
              <div 
                className="rec-content"
                dangerouslySetInnerHTML={{ __html: rec.content }}
              />

              <div className="rec-footer">
                <p><strong>מתייחס להצגה:</strong> {rec.relatedShow}</p>
              </div>

            </div>
          ))}
        </div>

        {/* כפתור הנעה לפעולה בתחתית */}
        <div className="rec-cta-container">
          <Link href="/contact" className="cta-button-large contact_us">
            להזמנת הצגה / סדנא צרו קשר
          </Link>
        </div>

      </div>
    </main>
  );
}