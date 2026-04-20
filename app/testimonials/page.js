import Link from 'next/link';
import {
  getRecommendations,
  getAllShows,
  getHomePageStructure,
  linkedTargetHref,
  linkedTargetTitle,
} from '../../lib/data';
import { plainTextToHtml } from '../../lib/recommendationContent';
import '../styles/testimonials.css';

export default async function TestimonialsPage() {

  const [recommendationsData, shows, homePageStructure] = await Promise.all([
    getRecommendations(),
    getAllShows(),
    getHomePageStructure(),
  ]);

  const collectionsById = Object.fromEntries(
    homePageStructure.map((c) => [c.id, c]),
  );

  const allRecommendations = Object.values(recommendationsData);

  return (
    <main>

      <div className="testimonials-page-header">
        <h1 className="testimonials-title">המלצות חמות</h1>
        <p className="testimonials-subtitle">
          גאים לשתף את המילים החמות שלקוחות, מנהלים ומשתתפים בחרו לכתוב עלינו
        </p>
      </div>

      <div className="testimonials-grid">

        {allRecommendations.map((rec) => {
          const href = linkedTargetHref(rec.linkedTarget);
          const title = linkedTargetTitle(rec.linkedTarget, shows, collectionsById);

          return (
            <div key={rec.id} className="testimonial-card">

              <div className="quote-icon-large">❝</div>

              <div className="recommender-info">
                <span className="recommender-name">{rec.recommenderName}</span>
                <span className="recommender-role">{rec.recommenderRole}</span>
                {rec.date && (
                  <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>{rec.date}</div>
                )}
              </div>

              <div
                className="recommendation-body"
                dangerouslySetInnerHTML={{ __html: plainTextToHtml(rec.content) }}
              />

              <div className="card-footer">
                {title && <span className="show-name">{title}</span>}

                {href && (
                  <Link href={href} className="details-btn">
                    לפרטים על ההצגה ←
                  </Link>
                )}
              </div>

            </div>
          );
        })}

      </div>

      <div className="bottom-cta">
        <Link href="/contact" className="cta-button-large contact_us">
          רוצים להמליץ או להזמין? צרו קשר
        </Link>
      </div>

    </main>
  );
}
