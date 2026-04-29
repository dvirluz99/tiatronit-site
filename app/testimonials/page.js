import Link from 'next/link';
import {
  getRecommendations,
  getAllShows,
  getHomePageStructure,
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
          const title = linkedTargetTitle(rec.linkedTarget, shows, collectionsById);

          return (
            <Link
              key={rec.id}
              href={`/recommendation/${rec.id}`}
              className="rec-card-link-wrapper"
              aria-label={`קראו את ההמלצה של ${rec.recommenderName || ''}`}
            >
            <ScrollReveal
              as="article"
              className="testimonial-card testimonial-card--clickable"
              delay={Math.min((index % 6) * 60, 360)}
            >
              <div className="quote-icon-large" aria-hidden="true">❝</div>

              <div className="recommender-info">
                {rec.recommenderImage && (
                  <img
                    className="rec-avatar rec-avatar--sm"
                    src={rec.recommenderImage}
                    alt=""
                  />
                )}
                <div className="recommender-info-text">
                  <span className="recommender-name">{rec.recommenderName}</span>
                  <span className="recommender-role">{rec.recommenderRole}</span>
                  {rec.date && (
                    <span className="recommender-role" style={{ opacity: 0.75 }}>{rec.date}</span>
                  )}
                </div>
              </div>

              <div
                className="recommendation-body"
                dangerouslySetInnerHTML={{ __html: plainTextToHtml(rec.content) }}
              />

              <div className="card-footer">
                {title && <span className="show-name">{title}</span>}
                <span className="details-btn">קראו עוד ←</span>
              </div>
            </ScrollReveal>
            </Link>
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
