'use client';

import type { Show } from '../../../lib/schema';

type Props = { show: Show };

export default function ShowPreview({ show }: Props) {
  const formats = show.presentationFormats || [];
  const hasMultiple = formats.length >= 2;
  const heroImage = show.mainImg || formats[0]?.image;

  return (
    <div className="v2-preview">
      <div className="v2-preview-badge">תצוגה מקדימה</div>

      <div className="v2-preview-show">
        {hasMultiple ? (
          <div className="v2-preview-header-double">
            <div className="v2-preview-logo">
              {formats[0].image ? <img src={formats[0].image} alt="גרסה א" /> : <div className="v2-preview-empty">ללא תמונה</div>}
              {formats[0].caption && <p className="v2-preview-caption">{formats[0].caption}</p>}
            </div>
            <h1 className="v2-preview-title">{show.title || 'ללא כותרת'}</h1>
            <div className="v2-preview-logo">
              {formats[1].image ? <img src={formats[1].image} alt="גרסה ב" /> : <div className="v2-preview-empty">ללא תמונה</div>}
              {formats[1].caption && <p className="v2-preview-caption">{formats[1].caption}</p>}
            </div>
          </div>
        ) : (
          <div className="v2-preview-header-single">
            <h1 className="v2-preview-title">{show.title || 'ללא כותרת'}</h1>
            {heroImage ? (
              <img src={heroImage} alt="תמונת ההצגה" className="v2-preview-hero" />
            ) : (
              <div className="v2-preview-empty v2-preview-hero">ללא תמונה ראשית</div>
            )}
          </div>
        )}

        {show.video?.trailers && show.video.trailers.length > 0 && (
          <div className="v2-preview-trailers">
            {show.video.trailers.map((id) => (
              <iframe
                key={id}
                src={`https://www.youtube.com/embed/${id}`}
                title="טריילר"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ))}
          </div>
        )}

        <section className="v2-preview-body">
          {show.description && <p className="v2-preview-description">{show.description}</p>}

          {(show.creatorIntro || show.creatorName || show.creatorCredentials) && (
            <div className="v2-preview-creator">
              {show.creatorIntro && <p>{show.creatorIntro}</p>}
              {show.creatorName && <p className="v2-preview-creator-name">{show.creatorName}</p>}
              {show.creatorCredentials && <p className="v2-preview-creator-credentials">{show.creatorCredentials}</p>}
            </div>
          )}

          {show.audience && <p className="v2-preview-audience">{show.audience}</p>}

          {show.socialProof && (
            <div className="v2-preview-social">
              <h4>ניסיון וקהלים:</h4>
              <p>{show.socialProof}</p>
            </div>
          )}
        </section>

        {show.video?.clips && show.video.clips.length > 0 && (
          <section className="v2-preview-clips">
            <h3>טעימות מההצגה</h3>
            <div className="v2-preview-clips-grid">
              {show.video.clips.map((clip, i) => (
                <div key={i} className="v2-preview-clip">
                  <iframe
                    src={`https://www.youtube.com/embed/${clip.youtubeId}`}
                    title={clip.caption || 'קטע'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                  {clip.caption && <p>{clip.caption}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {show.gallery && show.gallery.length > 0 && (
          <section className="v2-preview-gallery">
            <h3>גלריה</h3>
            <div className="v2-preview-gallery-grid">
              {show.gallery.map((src, i) => (
                <img key={i} src={src} alt={`תמונה ${i + 1}`} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
