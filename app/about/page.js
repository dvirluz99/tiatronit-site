import { getAboutData } from '../../lib/data';
import { plainTextToHtml } from '../../lib/recommendationContent';
import ScrollReveal from '../../components/ScrollReveal';
import AboutTestimonials from '../../components/AboutTestimonials';

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
            <AboutTestimonials testimonials={aboutData.testimonials} defaultCount={5} />
          </section>
        )}

      </div>
    </main>
  );
}