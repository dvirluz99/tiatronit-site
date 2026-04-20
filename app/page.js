import Link from 'next/link';
import Image from 'next/image';
import { getHomePageStructure, getAboutData, getHomeGalleryImages } from '../lib/data';
import dynamic from 'next/dynamic';
import ScrollReveal from '../components/ScrollReveal';

const TestimonialsCarousel = dynamic(() => import('../components/TestimonialsCarousel'));
const HomeGallery = dynamic(() => import('../components/HomeGallery'));
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';

export default async function Home() {
  const homePageStructure = await getHomePageStructure();
  const aboutData = await getAboutData();
  const galleryImages = await getHomeGalleryImages();

  return (
    <main>
      <HeroSection />

      <HomeGallery images={galleryImages} />

      <InfoSection />

      <section id="shows-grid" className="cards-section">
        <ScrollReveal className="cards-section-header">
          <span className="cards-eyebrow">הקטלוג</span>
          <h2 className="cards-title">הסדנאות וההצגות</h2>
          <div className="cards-divider" aria-hidden="true"></div>
          <p className="cards-subtitle">
            מגוון הצגות, סדנאות ומפגשים מרגשים לכל הגילאים.
            לחצו על כרטיסייה לפרטים נוספים.
          </p>
        </ScrollReveal>

        <div className="continer_main_for_all">
          {homePageStructure.map((card, index) => {
            let linkHref = '';
            if (card.type === 'collection') {
              linkHref = `/collection/${card.id}`;
            } else {
              const targetId = card.linkedShowId || card.id;
              linkHref = `/show/${targetId}`;
            }

            const importanceClass = card.priority === 'featured' ? 'importance-recommended' : '';

            return (
              <ScrollReveal
                key={card.id}
                as="div"
                className={`div_card ${importanceClass}`}
                delay={Math.min(index * 60, 360)}
                variant="up"
              >
                <Link href={linkHref} aria-label={card.title}>
                  <figure>
                    <Image
                      src={`${card.mainImg}`}
                      alt={card.title}
                      className="img_for_card"
                      width={500}
                      height={500}
                    />
                    <figcaption className={card.priority === 'featured' ? 'caption-highlight' : ''}>
                      {card.title}
                    </figcaption>
                  </figure>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <TestimonialsCarousel aboutData={aboutData} />
    </main>
  );
}
