import Link from 'next/link';
import {
  getRecommendations,
  getAllShows,
  getHomePageStructure,
  linkedTargetTitle,
} from '../../../lib/data';
import { plainTextToHtml } from '../../../lib/recommendationContent';

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
    <main className="continer_main_for_home">
      <div className="recommendation-page-wrapper">

        <h2 className="recommendation-header">המלצות חמות</h2>

        <div
          className="recommendations-list-container"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {relevant.map((rec) => {
            const title = linkedTargetTitle(rec.linkedTarget, shows, collectionsById);
            return (
              <div key={rec.id} className="recommendation-card-full">

                <div className="rec-meta">
                  <span className="rec-role">
                    <strong>{rec.recommenderName}</strong>
                    <br />
                    <span style={{ fontSize: '0.9em', color: '#666' }}>{rec.recommenderRole}</span>
                  </span>
                  <span className="rec-date">{rec.date}</span>
                </div>

                <div
                  className="rec-content"
                  dangerouslySetInnerHTML={{ __html: plainTextToHtml(rec.content) }}
                />

                {title && (
                  <div className="rec-footer">
                    <p><strong>מתייחס להצגה:</strong> {title}</p>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        <div className="rec-cta-container">
          <Link href="/contact" className="cta-button-large contact_us">
            להזמנת הצגה / סדנא צרו קשר
          </Link>
        </div>

      </div>
    </main>
  );
}
