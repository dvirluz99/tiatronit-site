import Link from 'next/link';
import { recommendationsData } from '../../data/presentations';
import '../styles/testimonials.css'; // 1. ייבוא ה-CSS החדש

export default function TestimonialsPage() {
  
  const allRecommendations = Object.values(recommendationsData);

  return (
    <main>
      
      {/* --- כותרת ראשית --- */}
      <div className="testimonials-page-header">
        <h1 className="testimonials-title">המלצות חמות</h1>
        <p className="testimonials-subtitle">
          גאים לשתף את המילים החמות שלקוחות, מנהלים ומשתתפים בחרו לכתוב עלינו
        </p>
      </div>

      {/* --- רשת הכרטיסים --- */}
      <div className="testimonials-grid">
        
        {allRecommendations.map((rec) => (
          <div key={rec.id} className="testimonial-card">
            
            {/* אייקון רקע */}
            <div className="quote-icon-large">❝</div>

            {/* פרטי הממליץ */}
            <div className="recommender-info">
              <span className="recommender-name">{rec.recommenderName}</span>
              <span className="recommender-role">{rec.recommenderRole}</span>
              {rec.date && <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>{rec.date}</div>}
            </div>
            
            {/* תוכן ההמלצה */}
            <div 
              className="recommendation-body"
              dangerouslySetInnerHTML={{ __html: rec.content }}
            />

            {/* פוטר הכרטיס */}
            <div className="card-footer">
              <span className="show-name">
                 {rec.relatedShow}
              </span>
              
              {rec.linkedShowId && (
                <Link href={`/show/${rec.linkedShowId}`} className="details-btn">
                    לפרטים על ההצגה ←
                </Link>
              )}
            </div>

          </div>
        ))}

      </div>

      {/* כפתור הנעה לפעולה בתחתית */}
      <div className="bottom-cta">
        <Link href="/contact" className="cta-button-large contact_us">
          רוצים להמליץ או להזמין? צרו קשר
        </Link>
      </div>

    </main>
  );
}