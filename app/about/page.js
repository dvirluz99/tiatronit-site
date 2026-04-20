import Link from 'next/link';
import { getAboutData } from '../../lib/data';
import { plainTextToHtml } from '../../lib/recommendationContent';
import ScrollReveal from '../../components/ScrollReveal';

export default async function AboutPage() {
  const aboutData = (await getAboutData()) || {};
  const mainImageSrc = aboutData.mainImage
    ? aboutData.mainImage.startsWith('http') ? aboutData.mainImage : `/${aboutData.mainImage}`
    : '';

  return (
    <main>
      <div className="about-page-wrapper">

        <section className="about-top-section">
          {mainImageSrc && (
            <ScrollReveal variant="slide-right" className="about-image-container">
              <img src={mainImageSrc} alt="רונית לוז" />
            </ScrollReveal>
          )}

          <ScrollReveal variant="slide-left" className="about-text-content">
            <h1 className="about-title">{aboutData.title}</h1>
            <div
              className="about-description"
              dangerouslySetInnerHTML={{ __html: plainTextToHtml(aboutData.mainDescription) }}
            />
          </ScrollReveal>
        </section>

        {aboutData.testimonials && aboutData.testimonials.length > 0 && (
          <section className="testimonials-section">
            <ScrollReveal variant="fade">
              <h3>מילים חמות מהשטח</h3>
            </ScrollReveal>
            <div className="testimonials-grid">
              {aboutData.testimonials.map((item, index) => (
                <ScrollReveal
                  key={index}
                  as="div"
                  className="testimonial-mini-card"
                  delay={Math.min(index * 70, 420)}
                >
                  <div className="quote-icon">❝</div>
                  <p className="testi-text">{item.text}</p>
                  <span className="testi-author">— {item.author}</span>

                  {item.fromShowTitle && item.showId && (
                    <Link href={`/show/${item.showId}`}>
                      <span className="testi-from-Pres">{item.fromShowTitle}</span>
                    </Link>
                  )}

                  {item.recommendationId && (
                    <Link
                      href={`/recommendation/${item.recommendationId}`}
                      style={{ color: 'var(--c-accent-600)', fontWeight: 600, fontSize: 'var(--fs-sm)' }}
                    >
                      קראו את ההמלצה המלאה ←
                    </Link>
                  )}
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}