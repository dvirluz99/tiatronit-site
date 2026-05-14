import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  getCategoryById,
  getAllCategories,
  getAllShows,
  getClips,
  getCustomerClips,
} from '../../../lib/data';
import ScrollReveal from '../../../components/ScrollReveal';

const Gallery = dynamic(() => import('../../../components/Gallery'));
const ShowRecommendations = dynamic(() => import('../../../components/ShowRecommendations'));
const VideoSectionToggle = dynamic(() => import('../../../components/VideoSectionToggle'));

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return Object.keys(categories).map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) return { title: 'קטגוריה לא נמצאה' };
  return {
    title: category.title || 'קטגוריה',
    description: category.description || 'תיאטרון בובות רגשי חברתי - רונית לוז',
    openGraph: {
      title: category.title,
      description: category.description,
      images: [category.mainImg || '/AllDir/logo/logo1.jpg'],
    },
  };
}

export default async function CategoryPage({ params }) {
  const { id } = await params;

  const [category, shows, clipsLibrary, customerClipsLibrary] = await Promise.all([
    getCategoryById(id),
    getAllShows(),
    getClips(),
    getCustomerClips(),
  ]);

  if (!category) {
    return (
      <main className="continer_main_for_home">
        <p style={{ textAlign: 'center', marginTop: '3rem' }}>קטגוריה לא נמצאה</p>
      </main>
    );
  }

  const itemIds = Array.isArray(category.itemIds) ? category.itemIds : [];
  const items = itemIds.map((sid) => shows[sid]).filter(Boolean);

  const trailers = Array.isArray(category.trailers) ? category.trailers : [];
  const clipIds = Array.isArray(category.clipIds) ? category.clipIds : [];
  const customerClipIds = Array.isArray(category.customerClipIds) ? category.customerClipIds : [];
  const clips = clipIds.map((cid) => clipsLibrary[cid]).filter(Boolean);
  const customerClips = customerClipIds.map((cid) => customerClipsLibrary[cid]).filter(Boolean);
  const gallery = Array.isArray(category.gallery) ? category.gallery : [];
  const recommendationIds = Array.isArray(category.recommendationIds)
    ? category.recommendationIds
    : [];
  const L = category.labels || {};

  return (
    <main className="page-shell">
      <section className="cards-section">
        <ScrollReveal variant="fade" className="collection-header-wrapper">
          <span className="cards-eyebrow">{L.eyebrow || 'קטגוריה'}</span>
          <h1 className="collection-title">{category.title}</h1>
          {category.description && (
            <p className="collection-description">{category.description}</p>
          )}
        </ScrollReveal>
      </section>

      {/* 1. Items grid — hoisted up so the visitor immediately sees what's
             inside the category. This is section #1 per the requirement that
             the contained shows must not get buried. */}
      {items.length > 0 && (
        <section className="cards-section">
          <ScrollReveal className="cards-section-header" variant="fade">
            <h2 className="cards-title">{L.itemsTitle || 'הצגות וסדנאות בקטגוריה'}</h2>
            <div className="cards-divider" aria-hidden="true"></div>
          </ScrollReveal>
          <div className="continer_main_for_all">
            {items.map((item, index) => {
              const importanceClass =
                item.priority === 'featured' ? 'importance-recommended' : '';
              return (
                <ScrollReveal
                  key={item.id}
                  as="div"
                  className={`div_card ${importanceClass}`}
                  delay={Math.min(index * 60, 360)}
                  variant="up"
                >
                  <Link href={`/show/${item.id}`} aria-label={item.title}>
                    <figure>
                      <Image
                        src={item.mainImg || item.presentationFormats?.[0]?.image || ''}
                        alt={item.title}
                        className="img_for_card"
                        width={500}
                        height={500}
                      />
                      <figcaption
                        className={item.priority === 'featured' ? 'caption-highlight' : ''}
                      >
                        {item.title}
                      </figcaption>
                    </figure>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {trailers.length > 0 && (
        <section className="collection-media-section">
          <ScrollReveal>
            <h2 className="collection-section-title">{L.trailersTitle || 'טריילרים'}</h2>
            <div className="div_trailer">
              {trailers.map((youtubeId) => (
                <iframe
                  key={youtubeId}
                  className="vidue_iframe"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="טריילר"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {category.extendedHtml && (
        <section className="cards-section">
          <ScrollReveal
            className="collection-text-box"
            dangerouslySetInnerHTML={{ __html: category.extendedHtml }}
          />
        </section>
      )}

      {clips.length > 0 && (
        <ScrollReveal>
          <VideoSectionToggle videos={clips} title={L.clipsTitle || 'טעימות'} defaultCount={2} />
        </ScrollReveal>
      )}

      <ShowRecommendations
        recommendationIds={recommendationIds}
        userVideos={customerClips}
        textTitle={L.textTestimonialsTitle}
        videoTitle={L.videoTestimonialsTitle}
      />

      {gallery.length > 0 && (
        <section className="cards-section section-centered">
          <ScrollReveal>
            <h2 className="gallery-title">{L.galleryTitle || 'גלריית תמונות'}</h2>
            <Gallery images={gallery} />
          </ScrollReveal>
        </section>
      )}
    </main>
  );
}
