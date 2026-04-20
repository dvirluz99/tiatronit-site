import Link from 'next/link';
import Image from 'next/image';
import { getHomePageStructure, getAllShows } from '../../../lib/data';
import dynamic from 'next/dynamic';
import ScrollReveal from '../../../components/ScrollReveal';

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
    return (
      <main className="continer_main_for_home">
        <p style={{ textAlign: 'center', marginTop: '3rem' }}>אוסף לא נמצא</p>
      </main>
    );
  }

  const showIds = card.showIds || [];
  const showsInCollection = showIds.map((sid) => shows[sid]).filter(Boolean);

  const videos = card.videos || [];
  const gallery = card.gallery || [];
  const recommendationIds = card.recommendationIds || [];

  return (
    <main>

      <section className="cards-section" style={{ paddingBottom: 0 }}>
        <ScrollReveal variant="fade" className="collection-header-wrapper">
          <span className="cards-eyebrow">אוסף</span>
          <h1 className="collection-title">{card.title}</h1>
          {card.description && (
            <p className="collection-description">{card.description}</p>
          )}
        </ScrollReveal>
      </section>

      {videos.length > 0 && (
        <section className="collection-media-section">
          <ScrollReveal>
            <h2 className="collection-section-title">צפו בטעימה</h2>
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
          </ScrollReveal>
        </section>
      )}

      {card.extendedHtml && (
        <section className="cards-section" style={{ paddingBlock: 0 }}>
          <ScrollReveal
            className="collection-text-box"
            dangerouslySetInnerHTML={{ __html: card.extendedHtml }}
          />
        </section>
      )}

      <section className="cards-section" style={{ paddingTop: 'var(--sp-12)' }}>
        {showsInCollection.length > 0 ? (
          <div className="continer_main_for_all">
            {showsInCollection.map((show, index) => {
              const importanceClass = show.priority === 'featured' ? 'importance-recommended' : '';
              return (
                <ScrollReveal
                  key={show.id}
                  as="div"
                  className={`div_card ${importanceClass}`}
                  delay={Math.min(index * 60, 360)}
                  variant="up"
                >
                  <Link href={`/show/${show.id}`} aria-label={show.title}>
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
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>כרגע אין הצגות באוסף הזה.</p>
        )}
      </section>

      {recommendationIds.length > 0 && (
        <ShowRecommendations recommendationIds={recommendationIds} showId={card.id} />
      )}

      {gallery.length > 0 && (
        <section className="cards-section" style={{ paddingTop: 0 }}>
          <ScrollReveal>
            <h2 className="gallery-title" style={{ display: 'block', textAlign: 'center', marginInline: 'auto' }}>
              גלריית תמונות
            </h2>
            <Gallery images={gallery} />
          </ScrollReveal>
        </section>
      )}
    </main>
  );
}
