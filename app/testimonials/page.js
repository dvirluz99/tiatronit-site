import Link from 'next/link';
import {
  getRecommendations,
  getAllShows,
  getHomePageStructure,
  linkedTargetHref,
  linkedTargetTitle,
} from '../../lib/data';
import { plainTextToHtml } from '../../lib/recommendationContent';
import ScrollReveal from '../../components/ScrollReveal';
import '../styles/testimonials.css';

export default async function TestimonialsPage() {

  const [recommendationsData, shows, homePageStructure] = await Promise.all([
    getRecommendations(),
    getAllShows(),
    getHomePageStructure(),
  ]);

  const collectionsById = Object.fromEntries(homePageStructure.map((c) => [c.id, c]));
  const allRecommendations = Object.values(recommendationsData);

  return (
    <main>

      <ScrollReveal variant="fade" className="testimonials-page-header" as="header">
        <span className="cards-eyebrow">הלקוחות שלנו מספרים</span>
        <h1 className="testimonials-title">המלצות חמות</h1>
        <p className="testimonials-subtitle">
          גאים לשתף את המילים החמות שלקוחות, מנהלים ומשתתפים בחרו לכתוב עלינו.
        </p>
      </ScrollReveal>

      <div className="testimonials-grid">
        {allRecommendations.map((rec, index) => {
          const href = linkedTargetHref(rec.linkedTarget);
          const title = linkedTargetTitle(rec.linkedTarget, shows, collectionsById);

          return (
            <ScrollReveal
              key={rec.id}
              as="div"
              className="testimonial-card"
              delay={Math.min((index % 6) * 60, 360)}
            >
              <div className="quote-icon-large" aria-hidden="true">❝</div>

              <div className="recommender-info">
                <span className="recommender-name">{rec.recommenderName}</span>
                <span className="recommender-role">{rec.recommenderRole}</span>
                {rec.date && (
                  <span className="recommender-role" style={{ opacity: 0.75 }}>{rec.date}</span>
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
            </ScrollReveal>
          );
        })}
      </div>

      <div className="bottom-cta">
        <Link href="/contact" className="cta-button-large">
          רוצים להזמין? צרו קשר
        </Link>
      </div>

    </main>
  );
}
