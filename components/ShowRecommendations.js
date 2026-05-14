import { getRecommendations } from '../lib/data';
import RecommendationsToggle from './RecommendationsToggle';
import VideoSectionToggle from './VideoSectionToggle';
import styles from './ShowRecommendations.module.css';

export default async function ShowRecommendations({
  recommendationIds,
  userVideos,
  textTitle,
  videoTitle,
}) {
  const recommendationsData = await getRecommendations();
  const relevantRecs = recommendationIds
    ? recommendationIds.map((recId) => recommendationsData[recId]).filter(Boolean)
    : [];

  const hasTextRecs = relevantRecs.length > 0;
  const hasVideos = userVideos && userVideos.length > 0;

  if (!hasTextRecs && !hasVideos) return null;

  return (
    <div className={styles.container}>
      {hasTextRecs && (
        <section>
          <h3 className={styles.title}>{textTitle || 'משתפים על ההצגה'}</h3>
          <RecommendationsToggle recommendations={relevantRecs} defaultCount={3} />
        </section>
      )}

      {hasVideos && (
        <div className={styles.videoSection}>
          <VideoSectionToggle
            videos={userVideos}
            title={videoTitle || 'אנשים מדברים'}
            defaultCount={2}
          />
        </div>
      )}
    </div>
  );
}