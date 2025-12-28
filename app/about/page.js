import Link from 'next/link';
import { aboutData } from '../../data/presentations';

export default function AboutPage() {
  return (
    <main className="continer_main_for_home">
      <div className="about-page-wrapper">
        
        {/* --- חלק עליון: תמונה וטקסט --- */}
        <div className="about-top-section">
            
            {/* תמונה (אם יש) */}
            {aboutData.mainImage && (
                <div className="about-image-container">
                    <img src={`/${aboutData.mainImage}`} alt="רונית לוז" />
                </div>
            )}

            {/* טקסט ראשי */}
            <div className="about-text-content">
                <h1 className="about-title">{aboutData.title}</h1>
                {/* השימוש ב-dangerouslySetInnerHTML נדרש כי הטקסט בקובץ הנתונים מכיל תגיות HTML כמו <p> */}
                <div 
                    className="about-description"
                    dangerouslySetInnerHTML={{ __html: aboutData.mainDescription }}
                />
            </div>
        </div>

        {/* --- חלק תחתון: כרטיסיות ציטוטים --- */}
        {aboutData.testimonials && aboutData.testimonials.length > 0 && (
            <div className="testimonials-section">
                <h3>מילים חמות מהשטח</h3>
                <div className="testimonials-grid">
                    {aboutData.testimonials.map((item, index) => (
                        <Link key={index} href={`/recommendation/${item.linkRecId}`}>
                        <div  className="testimonial-mini-card">
                            <div className="quote-icon">❝</div>
                            <p className="testi-text">{item.text}</p>
                            <span className="testi-author">- {item.author}</span>
                            <Link href={`/show/${item.linkP}`}><span className="testi-from-Pres">{item.fromPresention}</span></Link>
                        </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

      </div>
    </main>
  );
}