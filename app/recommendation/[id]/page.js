import Link from 'next/link';
import {
  getRecommendations,
  getAllShows,
  getHomePageStructure,
  linkedTargetTitle,
} from '../../../lib/data';
import { plainTextToHtml } from '../../../lib/recommendationContent';
import ScrollReveal from '../../../components/ScrollReveal';

export default async function RecommendationsPage({ params }) {
  const { id } = await params;

  const [recommendationsData, shows, homePageStructure] = await Promise.all([
    getRecommendations(),
    getAllShows(),
    getHomePageStructure(),
  ]);

  const collectionsById = Object.fromEntries(homePageStructure.map((c) => [c.id, c]));

  let relevant = [];

  if (id.startsWith('rec')) {
    if (recommendationsData[id]) relevant.push(recommendationsData[id]);
  } else if (shows[id] && shows[id].recommendationIds) {
    relevant = shows[id].recommendationIds
      .map((recId) => recommendationsData[recId])
      .filter(Boolean);
  } else if (collectionsById[id] && collectionsById[id].recommendationIds) {
    relevant = collectionsById[id].recommendationIds
      .map((recId) => recommendationsData[recId])
      .filter(Boolean);
  }

  if (relevant.length === 0) {
    return (
      <main className="continer_main_for_home">
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>לא נמצאו המלצות</h2>
          <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
            חזרה לדף הבית
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="recommendation-page-wrapper">

        <ScrollReveal variant="fade" as="h2" className="recommendation-header">
          המלצות חמות
        </ScrollReveal>

        <div className="recommendations-list-container">
          {relevant.map((rec, index) => {
            const title = linkedTargetTitle(rec.linkedTarget, shows, collectionsById);
            return (
              <ScrollReveal
                key={rec.id}
                as="article"
                className="recommendation-card-full"
                delay={Math.min(index * 80, 320)}
              >
                <div className="rec-meta">
                  <span className="rec-role">
                    <strong>{rec.recommenderName}</strong>
                    {rec.recommenderRole && (
                      <>
                        <br />
                        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--c-text-muted)' }}>
                          {rec.recommenderRole}
                        </span>
                      </>
                    )}
                  </span>
                  {rec.date && <span className="rec-date">{rec.date}</span>}
                </div>

                <div
                  className="rec-content"
                  dangerouslySetInnerHTML={{ __html: plainTextToHtml(rec.content) }}
                />

                {title && (
                  <div className="rec-footer">
                    <strong>מתייחס ל-</strong>
                    {title}
                  </div>
                )}
              </ScrollReveal>
            );
          })}
        </div>

        <div className="rec-cta-container">
          <Link href="/contact" className="cta-button-large">
            להזמנת הצגה / סדנא
          </Link>
        </div>

      </div>
    </main>
  );
}
