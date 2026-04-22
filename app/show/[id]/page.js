import Link from 'next/link';
import Image from 'next/image';
import { getShowById, getAllShows } from '../../../lib/data';
import dynamic from 'next/dynamic';
import ScrollReveal from '../../../components/ScrollReveal';

const Gallery = dynamic(() => import('../../../components/Gallery'));
const ShowRecommendations = dynamic(() => import('../../../components/ShowRecommendations'));
const VideoSectionToggle = dynamic(() => import('../../../components/VideoSectionToggle'));

const CATEGORY_LABEL = { kids: 'ילדים', youth: 'בני נוער', adults: 'מבוגרים' };

export async function generateStaticParams() {
  const shows = await getAllShows();
  return Object.keys(shows).map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const show = await getShowById(id);

  if (!show) return { title: 'הצגה לא נמצאה' };

  const title = show.title || 'הצגה';
  const description = show.description || 'תיאטרון בובות רגשי חברתי - רונית לוז';
  const imageUrl = show.mainImg || show.presentationFormats?.[0]?.image || '/AllDir/logo/logo1.jpg';

  return {
    title,
    description,
    openGraph: { title, description, images: [imageUrl] },
  };
}

const IconAudience = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a6 6 0 016-6h0a6 6 0 016 6v2" /><circle cx="17" cy="5" r="2" />
  </svg>
);

const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41L13.42 20.58a2 2 0 01-2.83 0L3 13V3h10l7.59 7.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export default async function ShowPage({ params }) {
  const { id } = await params;
  const show = await getShowById(id);

  if (!show) {
    return (
      <main className="div_presentation">
        <p style={{ textAlign: 'center', marginTop: '3rem' }}>הצגה לא נמצאה</p>
      </main>
    );
  }

  const formats = show.presentationFormats || [];
  const hasFormats = formats.length >= 2;
  const heroImage = show.mainImg || formats[0]?.image;

  const trailers = show.video?.trailers || [];
  const clips = show.video?.clips || [];
  const customerClips = show.video?.customerClips || [];

  const categoryLabel = CATEGORY_LABEL[show.category] || show.category;

  return (
    <main className="div_presentation">

      <section className="show-hero">
        <ScrollReveal variant="slide-right" className="show-hero-text">
          <span className="show-eyebrow">
            {show.priority === 'featured' ? 'ההצגה המועברת ביותר' : 'הצגה / סדנא'}
          </span>

          <h1 className="presentation-page-title">{show.title}</h1>

          {show.description && (
            <p className="show-hero-description">{show.description}</p>
          )}

          <div className="show-meta">
            <span className="show-meta-chip">
              <IconTag />
              <span>{categoryLabel}</span>
            </span>
            {show.audience && (
              <span className="show-meta-chip">
                <IconAudience />
                <span>{show.audience}</span>
              </span>
            )}
          </div>

          <div className="cta-container">
            {show.recommendationIds && show.recommendationIds.length > 0 && (
              <Link href={`/recommendation/${show.id}`} className="cta-button">
                קראו המלצות
              </Link>
            )}
            <Link href="/contact" className="cta-button invitation-button">
              להזמנה
            </Link>
          </div>
        </ScrollReveal>

        {hasFormats ? (
          <ScrollReveal variant="slide-left" className="show-hero-formats" delay={120}>
            <span className="show-hero-formats-label">שתי מתכונות הצגה</span>
            {formats.slice(0, 2).map((f, i) => (
              <div key={i} className="show-format-card">
                <div className="show-format-card-img">
                  <Image
                    src={f.image}
                    alt={f.caption || `מתכונת ${i + 1}`}
                    width={320}
                    height={320}
                  />
                </div>
                {f.caption && (
                  <p className="show-format-card-caption">{f.caption}</p>
                )}
              </div>
            ))}
          </ScrollReveal>
        ) : (
          <ScrollReveal variant="slide-left" className="show-hero-media" delay={120}>
            {heroImage && (
              <Image
                src={heroImage}
                alt={show.title}
                width={640}
                height={640}
                priority
              />
            )}
          </ScrollReveal>
        )}
      </section>

      {trailers.length > 0 && (
        <ScrollReveal variant="fade">
          <div className="div_trailer">
            {trailers.map((youtubeId) => (
              <iframe
                key={youtubeId}
                className="vidue_iframe"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="טריילר ההצגה"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ))}
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal className="show-details-container">
        <h2 className="show-title">על ההצגה</h2>
        {show.description && <p className="show-description">{show.description}</p>}

        {(show.creatorName || show.creatorIntro || show.creatorCredentials) && (
          <div className="creator-bio">
            {show.creatorIntro && <p className="creator-intro">{show.creatorIntro}</p>}
            {show.creatorName && <p className="creator-name">{show.creatorName}</p>}
            {show.creatorCredentials && <p className="creator-credentials">{show.creatorCredentials}</p>}
          </div>
        )}

        {show.audience && (
          <p className="audience-highlight"><span>{show.audience}</span></p>
        )}

        {show.socialProof && (
          <div className="social-proof">
            <h4>ניסיון וקהלים</h4>
            <p>{show.socialProof}</p>
          </div>
        )}
      </ScrollReveal>

      <ShowRecommendations
        recommendationIds={show.recommendationIds}
        showId={show.id}
        userVideos={customerClips}
      />

      {clips.length > 0 && (
        <ScrollReveal>
          <VideoSectionToggle
            videos={clips}
            title="טעימות מההצגה"
            defaultCount={2}
          />
        </ScrollReveal>
      )}

      {show.gallery && show.gallery.length > 0 && (
        <ScrollReveal>
          <h3 className="gallery-title" style={{ display: 'block', textAlign: 'center' }}>
            גלריית תמונות
          </h3>
          <Gallery images={show.gallery} />
        </ScrollReveal>
      )}
    </main>
  );
}
