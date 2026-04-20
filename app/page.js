import Link from 'next/link';
import Image from 'next/image';
// import { homePageStructure } from '../data/presentations';
import {getHomePageStructure, getAboutData, getHomeGalleryImages} from '../lib/data'
import dynamic from 'next/dynamic';

const TestimonialsCarousel = dynamic(() => import('../components/TestimonialsCarousel'));
const HomeGallery = dynamic(() => import('../components/HomeGallery'));
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';

export default async function Home() {

  const homePageStructure = await getHomePageStructure();
  const aboutData = await getAboutData();
  const galleryImages = await getHomeGalleryImages();

  return (
    <main className="continer_main_for_home">
      
      <HeroSection />

      <HomeGallery images={galleryImages}/>

      <InfoSection />

      <div className="cards-section-header">
        <h2 className="cards-title">הסדנאות וההצגות</h2>
        <div className="cards-divider"></div>
        <p className="cards-subtitle">
            מגוון הצגות, סדנאות ומפגשים מרגשים לכל הגילאים. 
            <br/>
            לחצו על כרטיסייה לפרטים נוספים.
        </p>
      </div>

      <div id="shows-grid" className="continer_main_for_all">
        {homePageStructure.map((card) => {
          
          let linkHref = '';
          if (card.type === 'collection') {
             linkHref = `/collection/${card.id}`;
          } else {
             const targetId = card.linkedShowId || card.id;
             linkHref = `/show/${targetId}`;
          }

          return (
            <div key={card.id} className={`div_card ${card.priority ? `importance-${card.priority === 'featured' ? 'recommended' : 'accustomed'}` : ''}`}>
              <Link href={linkHref}>
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
            </div>
          );
        })}
      </div>
      <TestimonialsCarousel aboutData={aboutData}/>
    </main>
  );
}