import Link from 'next/link';
import Image from 'next/image';
import { getShowById, getAllShows } from '../../../lib/data';
import dynamic from 'next/dynamic';

const Gallery = dynamic(() => import('../../../components/Gallery'));
const ShowRecommendations = dynamic(() => import('../../../components/ShowRecommendations'));

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

export default async function ShowPage({ params }) {
  const { id } = await params;
  const show = await getShowById(id);

  if (!show) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>הצגה לא נמצאה</div>;
  }

  const formats = show.presentationFormats || [];
  const hasMultipleFormats = formats.length >= 2;

  const trailers = show.video?.trailers || [];
  const clips = show.video?.clips || [];
  const customerClips = show.video?.customerClips || [];

  return (
    <div className="div_presentation">

      {hasMultipleFormats ? (
        <div className="header-double-layout">

          <div className="logo-wrapper">
            <Image
              src={formats[0].image}
              alt="גרסה ראשונה"
              className="show-flyer-img"
              width={500}
              height={500}
            />
            {formats[0].caption && <p className="logo-caption">{formats[0].caption}</p>}
          </div>

          <h1 className="presentation-page-title">{show.title}</h1>

          <div className="logo-wrapper">
            <Image
              src={formats[1].image}
              alt="גרסה שנייה"
              className="show-flyer-img"
              width={500}
              height={500}
            />
            {formats[1].caption && <p className="logo-caption">{formats[1].caption}</p>}
          </div>
        </div>
      ) : (
        <div className="show-header-wrapper">
          <h1 className="presentation-page-title">{show.title}</h1>
          {(show.mainImg || formats[0]?.image) && (
            <Image
              src={show.mainImg || formats[0].image}
              alt="פלאייר ההצגה"
              className="show-flyer-img"
              width={500}
              height={500}
            />
          )}
        </div>
      )}

      {trailers.length > 0 && (
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
      )}

      <div className="show-details-container">
        <h2 className="show-title">{show.title}</h2>
        <p className="show-description">{show.description}</p>

        <div className="creator-bio">
          <p className="creator-intro">{show.creatorIntro}</p>
          <p className="creator-name">{show.creatorName}</p>
          <p className="creator-credentials">{show.creatorCredentials}</p>
        </div>

        <p className="audience-highlight">{show.audience}</p>

        <div className="cta-container">
          {show.recommendationIds && show.recommendationIds.length > 0 && (
            <Link href={`/recommendation/${show.id}`} className="cta-button">
              להמלצות
            </Link>
          )}
          <Link href="/contact" className="invitation-button contact_us">
            להזמנה
          </Link>
        </div>

        <div className="social-proof">
          <h4>ניסיון וקהלים:</h4>
          <p>{show.socialProof}</p>
        </div>
      </div>

      <ShowRecommendations
        recommendationIds={show.recommendationIds}
        showId={show.id}
        userVideos={customerClips}
      />

      {clips.length > 0 && (
        <div className="show-clips-section">
          <h3 className="clips-title">טעימות מההצגה</h3>
          <div className="clips-grid">
            {clips.map((clip, index) => (
              <div key={index} className="clip-card">
                <div className="video-responsive">
                  <iframe
                    width="100%"
                    height="250"
                    src={`https://www.youtube.com/embed/${clip.youtubeId}`}
                    title={clip.caption || 'YouTube video player'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                {clip.caption && <p className="clip-caption">{clip.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {show.gallery && show.gallery.length > 0 && (
        <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
          <h2
            className="collection-section-title"
            style={{ display: 'block', textAlign: 'center', marginBottom: '2rem' }}
          >
            גלריית תמונות
          </h2>
          <Gallery images={show.gallery} />
        </div>
      )}
    </div>
  );
}
