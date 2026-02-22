import Link from 'next/link';
// import { aboutData } from '../../data/presentations';
import {getAboutData} from '../../lib/data'

export default async function AboutPage() {

    const aboutData = await getAboutData();

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
                        
                        /* כאן התיקון: הורדנו את ה-Link שעטף הכל, וה-key עבר ל-div */
                        <div key={index} className="testimonial-mini-card">
                            <div className="quote-icon">❝</div>
                            <p className="testi-text">{item.text}</p>
                            <span className="testi-author">- {item.author}</span>
                            
                            {/* קישור ראשון: לעמוד ההצגה */}
                            <Link href={`/show/${item.linkP}`}>
                                <span className="testi-from-Pres">{item.fromPresention}</span>
                            </Link>

                            {/* קישור שני: לעמוד ההמלצה המלא (הוספתי שורת רווח קטנה כדי שייראה טוב) */}
                            <div style={{ marginTop: '15px' }}>
                                <Link href={`/recommendation/${item.linkRecId}`} style={{ color: '#2998f4', fontWeight: 'bold' }}>
                                    קראו את ההמלצה המלאה &gt;
                                </Link>
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        )}

      </div>
    </main>
  );
}