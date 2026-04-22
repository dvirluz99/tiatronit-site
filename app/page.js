import Link from 'next/link';
import Image from 'next/image';
import {
  getHomePageStructure,
  getAboutData,
  getHomeGalleryImages,
  getAllShows,
  getAllCategories,
  getHomepageManifest,
  resolveHomepageItems,
} from '../lib/data';
import dynamic from 'next/dynamic';
import ScrollReveal from '../components/ScrollReveal';

const TestimonialsCarousel = dynamic(() => import('../components/TestimonialsCarousel'));
const HomeGallery = dynamic(() => import('../components/HomeGallery'));
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';

// Build the homepage grid. Prefers the new settings_v2/homepage manifest
// (items reference shows + categories directly). Falls back to the legacy
// collections_v2 cards flow if the manifest doc doesn't exist yet, so the
// site keeps rendering during the migration.
async function buildHomepageCards() {
  const [manifest, shows, categories] = await Promise.all([
    getHomepageManifest(),
    getAllShows(),
    getAllCategories(),
  ]);

  if (manifest) {
    return resolveHomepageItems(manifest, shows, categories);
  }

  const legacy = await getHomePageStructure();
  return legacy.map((card) => ({
    key: card.id,
    href:
      card.type === 'collection'
        ? `/category/${card.id}`
        : `/show/${card.linkedShowId || card.id}`,
    title: card.title,
    mainImg: card.mainImg,
    priority: card.priority,
    isCategory: card.type === 'collection',
  }));
}

export default async function Home() {
  const [cards, aboutData, galleryImages] = await Promise.all([
    buildHomepageCards(),
    getAboutData(),
    getHomeGalleryImages(),
  ]);

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
          {cards.map((card, index) => {
            const importanceClass = card.priority === 'featured' ? 'importance-recommended' : '';
            return (
              <ScrollReveal
                key={card.key}
                as="div"
                className={`div_card ${importanceClass}`}
                delay={Math.min(index * 60, 360)}
                variant="up"
              >
                <Link href={card.href} aria-label={card.title}>
                  <figure>
                    <Image
                      src={card.mainImg}
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
