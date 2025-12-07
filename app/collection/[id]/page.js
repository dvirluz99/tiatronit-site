import Link from 'next/link';
import { homePageStructure, showData } from '../../../data/presentations';

export default async function CollectionPage({ params }) {
  // 1. מחלצים את ה-ID של האוסף (למשל card_4)
  const { id } = await params;

  // 2. מוצאים את הגדרת האוסף מתוך המבנה של דף הבית
  const collectionCard = homePageStructure.find((item) => item.id === id);

  if (!collectionCard) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>אוסף לא נמצא</div>;
  }

  // 3. "הקסם": המרת רשימת ה-IDs (כמו p4, p5) לאובייקטים מלאים של הצגות
  // אם המערך contains ריק, הרשימה תהיה ריקה
  const showsInCollection = (collectionCard.contains || []).map((showId) => {
      return showData[showId];
  }).filter(Boolean); // ה-filter מנקה למקרה שיש ID שגוי שלא קיים ב-showData

  return (
    <main className="continer_main_for_home">
      
      {/* --- אזור הכותרת והתיאור המעוצב --- */}
      <div className="collection-header-wrapper">
          <h1 className="collection-title">
            {collectionCard.title}
          </h1>
          
          {collectionCard.description && (
            <div className="collection-description">
              {collectionCard.description}
            </div>
          )}
      </div>
      
      {/* רשת הכרטיסיות (אותו עיצוב כמו דף הבית) */}
      <div className="continer_main_for_all">
        {showsInCollection.map((show) => {
             // כאן זה תמיד הצגה בודדת, אז הלינק פשוט
             const linkHref = `/show/${show.id}`;

             return (
              <div key={show.id} className={`div_card ${show.importance ? `importance-${show.importance}` : ''}`}>
                <Link href={linkHref}>
                  <figure>
                    <img 
                      src={`/${show.mainImg}`} 
                      alt={show.title} 
                      className="img_for_card" 
                    />
                    <figcaption className={show.importance === 'recommended' ? 'caption-highlight' : ''}>
                      {show.title}
                    </figcaption>
                  </figure>
                </Link>
              </div>
             );
        })}
      </div>

      {/* הודעה אם אין הצגות באוסף הזה */}
      {showsInCollection.length === 0 && (
          <p style={{textAlign: 'center'}}>כרגע אין הצגות בקטגוריה זו.</p>
      )}

      {collectionCard.collectionVideo && (
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
            <h2 style={{ color: '#1a4f7c', marginBottom: '1rem' }}>צפו בטעימה מהסדנא</h2>
            <div 
                className="div_trailer" /* משתמש בעיצוב הקיים של הטריילרים */
                dangerouslySetInnerHTML={{ __html: collectionCard.collectionVideo }} 
            />
        </div>
      )}

      {/* 2. הצגת טקסט נוסף (אם קיים בדאטה) */}
      {collectionCard.extraContent && (
        <div 
            className="show-description" /* משתמש בעיצוב הקיים של תיאורי הצגות */
            style={{ 
                marginTop: '2rem', 
                maxWidth: '800px', 
                marginLeft: 'auto', 
                marginRight: 'auto',
                padding: '2rem',
                backgroundColor: '#fff',
                borderRadius: '15px',
                border: '1px solid #eef2f6'
            }}
            dangerouslySetInnerHTML={{ __html: collectionCard.extraContent }}
        />
      )}
    </main>
  );
}