import Link from 'next/link';
import { showData } from '../../../data/presentations';
import Gallery from '../../../components/Gallery';
import ShowRecommendations from '../../../components/ShowRecommendations';

export default async function ShowPage({ params }) {
  // 1. חילוץ ה-ID
  const { id } = await params;
  
  // 2. שליפת המידע
  const presentation = showData[id];

  if (!presentation) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>הצגה לא נמצאה</div>;
  }

  // בדיקה האם יש שני לוגואים
  const hasDoubleLogo = presentation.mainImg1 && presentation.mainImg2;

  // 3. לוגיקה לטריילר
  let trailerContent = null;
  if (presentation.vidue && presentation.vidue.Trailer) {
      if (Array.isArray(presentation.vidue.Trailer) && presentation.vidue.Trailer.length > 0) {
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
    
      {/* --- אזור הכותרת והלוגו (לוגיקה משתנה) --- */}
      
{hasDoubleLogo ? (
        // === אפשרות א': יש 2 לוגואים עם טקסט ===
        <div className="header-double-layout">
           
           {/* צד ימין: עוטף את התמונה והטקסט */}
           <div className="logo-wrapper">
               <img 
                 src={`/${presentation.mainImg1}`} 
                 alt="לוגו ימני" 
                 className="show-flyer-img"
               />
               {presentation.textUnderImg1 && (
                   <p className="logo-caption">{presentation.textUnderImg1}</p>
               )}
           </div>
           
           {/* כותרת באמצע */}
           <h1 className="presentation-page-title">{presentation.title}</h1>
           
           {/* צד שמאל: עוטף את התמונה והטקסט */}
           <div className="logo-wrapper">
               <img 
                 src={`/${presentation.mainImg2}`} 
                 alt="לוגו שמאלי" 
                 className="show-flyer-img"
               />
               {presentation.textUnderImg2 && (
                   <p className="logo-caption">{presentation.textUnderImg2}</p>
               )}
           </div>
        </div>
      ) : (
        // === אפשרות ב': לוגו אחד רגיל ===
        <div className="show-header-wrapper">
          <h1 className="presentation-page-title">{presentation.title}</h1>
          {presentation.mainImg && (
             <img 
               src={`/${presentation.mainImg}`} 
               alt="פלאייר ההצגה" 
               className="show-flyer-img"
             />
          )}
        </div>
      )}

      {/* --- המשך הדף כרגיל --- */}

      {/* אזור הטריילר */}
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
              {presentation.linkRec && presentation.linkRec.length > 0 && (
                  <Link href={`/recommendation/${presentation.id}`} className="cta-button">
                      להמלצות
                  </Link>
              )}
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

        {/* טעימות מההצגה */}
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