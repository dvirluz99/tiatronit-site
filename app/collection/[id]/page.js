import Link from 'next/link';
import Image from 'next/image';
import { getHomePageStructure, getAllShows } from '../../../lib/data';
import dynamic from 'next/dynamic';

const Gallery = dynamic(() => import('../../../components/Gallery'));
const ShowRecommendations = dynamic(() => import('../../../components/ShowRecommendations'));

export async function generateStaticParams() {
  const homePageStructure = await getHomePageStructure();
  const collections = homePageStructure.filter((c) => c.type === 'collection');
  return collections.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const homePageStructure = await getHomePageStructure();
  const card = homePageStructure.find((item) => item.id === id);

  if (!card) return { title: 'אוסף לא נמצא' };

  return {
    title: card.title || 'אוסף הצגות',
    description: card.description || 'תיאטרון בובות רגשי חברתי - רונית לוז',
    openGraph: {
      title: card.title || 'אוסף הצגות',
      description: card.description,
      images: [card.mainImg || '/AllDir/logo/logo1.jpg'],
    },
  };
}

export default async function CollectionPage({ params }) {
  const { id } = await params;

  const homePageStructure = await getHomePageStructure();
  const shows = await getAllShows();

  const card = homePageStructure.find((item) => item.id === id);

  if (!card) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>אוסף לא נמצא</div>;
  }

  const showIds = card.showIds || [];
  const showsInCollection = showIds.map((sid) => shows[sid]).filter(Boolean);

  const videos = card.videos || [];
  const gallery = card.gallery || [];
  const recommendationIds = card.recommendationIds || [];

  return (
    <main className="continer_main_for_home">

      <div className="collection-header-wrapper">
        <h1 className="collection-title">{card.title}</h1>
        {card.description && <div className="collection-description">{card.description}</div>}
      </div>

      {(videos.length > 0 || card.extendedHtml) && (
        <div className="collection-media-section">

          {videos.length > 0 && (
            <div>
              <h2 className="collection-section-title">צפו בטעימה מהסדנא</h2>
              <div className="div_trailer">
                {videos.map((youtubeId) => (
                  <iframe
                    key={youtubeId}
                    className="vidue_iframe"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="סרטון האוסף"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {card.extendedHtml && (
            <div
              className="collection-text-box"
              dangerouslySetInnerHTML={{ __html: card.extendedHtml }}
            />
          )}

        </div>
      )}

      <div className="continer_main_for_all">
        {showsInCollection.map((show) => {
          const importanceClass = show.priority === 'featured' ? 'importance-recommended' : 'importance-accustomed';
          return (
            <div key={show.id} className={`div_card ${importanceClass}`}>
              <Link href={`/show/${show.id}`}>
                <figure>
                  <Image
                    src={`${show.mainImg || show.presentationFormats?.[0]?.image || ''}`}
                    alt={show.title}
                    className="img_for_card"
                    width={500}
                    height={500}
                  />
                  <figcaption className={show.priority === 'featured' ? 'caption-highlight' : ''}>
                    {show.title}
                  </figcaption>
                </figure>
              </Link>
            </div>
          );
        })}
      </div>

      {showsInCollection.length === 0 && (
        <p style={{ textAlign: 'center' }}>כרגע אין הצגות בקטגוריה זו.</p>
      )}

      {recommendationIds.length > 0 && (
        <ShowRecommendations recommendationIds={recommendationIds} showId={card.id} />
      )}

      {gallery.length > 0 && (
        <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
          <h2
            className="collection-section-title"
            style={{ display: 'block', textAlign: 'center', marginBottom: '2rem' }}
          >
            גלריית תמונות
          </h2>
          <Gallery images={gallery} />
        </div>
      )}

    </main>
  );
}
