import Link from 'next/link';
import { showData } from '../../../data/presentations';
import Gallery from '../../../components/Gallery';
import ShowRecommendations from '../../../components/ShowRecommendations'

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

  let vidueCustomers = null;
  if(presentation.vidue && presentation.vidue.customers){
        if(Array.isArray(presentation.vidue.customers)){
            vidueCustomers = presentation.vidue.customers;
        }
  }

  let showClips = null;
  if(presentation.vidue && presentation.vidue.clips && Array.isArray(presentation.vidue.clips)){
      showClips = presentation.vidue.clips;
  }

  return (
    <div className="div_presentation">
    
      <div className="show-header-wrapper">
          
          {/* הכותרת */}
          <h1 className="presentation-page-title">{presentation.title}</h1>
          
          {/* הפלאייר (יופיע משמאל לכותרת בגלל ה-CSS) */}
          {presentation.mainImg && (
             <img 
                src={`/${presentation.mainImg}`} 
                alt="פלאייר ההצגה" 
                className="show-flyer-img"
             />
          )}
          
      </div>

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

        <ShowRecommendations 
          recommendationIds={presentation.linkRec} 
          showId={presentation.id}
          userVideos = {vidueCustomers}
        />

        {/* --- אזור חדש: טעימות מההצגה --- */}
        {showClips && showClips.length > 0 && (
            <div className="show-clips-section">
                <h3 className="clips-title">טעימות מההצגה</h3>
                <div className="clips-grid">
                    {showClips.map((clip, index) => (
                        <div key={index} className="clip-card">
                            <video controls className="clip-video">
                                <source src={clip.src} type="video/mp4" />
                                הדפדפן שלך לא תומך בוידאו.
                            </video>
                            {clip.caption && <p className="clip-caption">{clip.caption}</p>}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {presentation.arrayGallery && presentation.arrayGallery.length > 0 && (
            <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>

                <h2 className="collection-section-title" style={{ display: 'block', textAlign: 'center', marginBottom: '2rem' }}>
                    גלריית תמונות
                </h2>
                
                <Gallery images={presentation.arrayGallery} />
            </div>
            
        )}
    </div>
  );
}