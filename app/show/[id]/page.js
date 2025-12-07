import Link from 'next/link';
import { showData } from '../../../data/presentations';
import Gallery from '../../../components/Gallery';

// ב-Next.js החדש, params מגיע כ-Promise ולכן הפונקציה היא async
export default async function ShowPage({ params }) {
  // 1. חילוץ ה-ID מהכתובת (למשל p1, p2)
  const { id } = await params;
  
  // 2. שליפת המידע מקובץ הנתונים
  const presentation = showData[id];

  // אם אין הצגה כזו (למשל מישהו הקליד כתובת לא נכונה)
  if (!presentation) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>הצגה לא נמצאה</div>;
  }

  // 3. לוגיקה לטריילר (מתוך הקוד המקורי שלך)
  let trailerContent = null;
  if (presentation.vidue && presentation.vidue.Trailer) {
      // אם זה מערך ויש בו משהו, או שזו סתם מחרוזת
      if (Array.isArray(presentation.vidue.Trailer) && presentation.vidue.Trailer.length > 0) {
          // ב-React מסוכן להשתמש ב-innerHTML סתם כך, אבל מכיוון שזה iframe מיוטיוב שאתה שולט בו, נשתמש בזהירות
          trailerContent = presentation.vidue.Trailer.join(" ");
      } else if (typeof presentation.vidue.Trailer === 'string') {
          trailerContent = presentation.vidue.Trailer;
      }
  }

  return (
    <div className="div_presentation">
    
      {/* כותרת עליונה מעוצבת */}
      <h1 className="presentation-page-title">{presentation.title}</h1>

      {/* אזור הטריילר - רק אם קיים */}
      {trailerContent && (
        <div 
            className="div_trailer" 
            dangerouslySetInnerHTML={{ __html: trailerContent }} 
        />
      )}

      {/* פרטי ההצגה */}
      <div className="show-details-container">
          <h2 className="show-title">{presentation.showData.title}</h2>
          <p className="show-description">{presentation.showData.description}</p>
          
          <div className="creator-bio">
              <p className="creator-intro">{presentation.showData.creatorIntro}</p>
              <p className="creator-name">{presentation.showData.creatorName}</p>
              <p className="creator-credentials">{presentation.showData.creatorCredentials}</p>
          </div>
          
          <p className="audience-highlight">{presentation.showData.audience}</p>
          
          <div className="cta-container">
              {/* כפתור להמלצות */}
              {presentation.linkRec && presentation.linkRec.length > 0 && (
                  <Link href={`/recommendation/${presentation.id}`} className="cta-button">
                      להמלצות
                  </Link>
              )}
              
              {/* כפתור להזמנה (מעביר לצור קשר) */}
              <Link href="/contact" className="invitation-button contact_us">
                  להזמנה
              </Link>
          </div>

          <div className="social-proof">
              <h4>ניסיון וקהלים:</h4>
              <p>{presentation.showData.socialProof}</p>
          </div>
      </div>

        {presentation.arrayGallery && presentation.arrayGallery.length > 0 && (
            <Gallery images={presentation.arrayGallery} />
        )}
    </div>
  );
}