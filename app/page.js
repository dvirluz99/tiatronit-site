import Link from 'next/link';
import { homePageStructure } from '../data/presentations';
import TestimonialsCarousel from '../components/TestimonialsCarousel';

export default function Home() {
  return (
    <main className="continer_main_for_home">
      
      {/* --- פסקת הפתיחה החדשה --- */}
      <div className="welcome-section">
        <p>
          בובהתרפיה זו חוויה יוצאת דופן בה סיפורי יהדות וסיפורים עכשוויים מקבלים מימד חדש על ידי הבובות.
          <br />
          חוויה זו מרוממת לכל הגילאים ועל ידם החוויה מועברת בצורה מפליאה.
        </p>
      </div>
      {/* ------------------------- */}

      <div className="continer_main_for_all">
        {homePageStructure.map((card) => {
          
          let linkHref = '';
          if (card.type === 'collection') {
             linkHref = `/collection/${card.id}`;
          } else {
             const targetId = card.linkedShowId || card.id;
             linkHref = `/show/${targetId}`;
          }

          return (
            <div key={card.id} className={`div_card ${card.importance ? `importance-${card.importance}` : ''}`}>
              <Link href={linkHref}>
                <figure>
                  <img 
                    src={`/${card.mainImg}`} 
                    alt={card.title} 
                    className="img_for_card" 
                  />
                  <figcaption className={card.importance === 'recommended' ? 'caption-highlight' : ''}>
                    {card.title}
                  </figcaption>
                </figure>
              </Link>
            </div>
          );
        })}
      </div>
      <TestimonialsCarousel />
    </main>
  );
}