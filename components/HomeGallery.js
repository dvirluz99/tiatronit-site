'use client';

import { useEffect } from 'react';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import styls from './homeGallery.module.css'; 


export default function HomeGallery({ images }) {

  // 1. הפעלת Fancybox
  useEffect(() => {
    Fancybox.bind('[data-fancybox="home-gallery"]', {
      // הגדרות אופציונליות:
      loop: true, // מאפשר לגלול בתוך המודל במעגל
      Toolbar: {
        display: {
          left: [],
          middle: [],
          right: ["close"],
        },
      },
    });

    return () => {
      Fancybox.destroy();
    };
  }, []);

  // שכפול התמונות ליצירת לופ אינסופי באנימציה
  const infiniteImages = [...images, ...images];

  return (
    <section className={styls.homeGallerySection}>
      <div className={styls.galleryTrack}>
        {infiniteImages.map((src, index) => (
          <a 
              key={index} 
              href={src} // הנתיב לתמונה הגדולה
              data-fancybox="home-gallery" // שם הקבוצה (כדי שיוכלו לדפדף ביניהן)
              className={styls.galleryItem}
          >
            <img 
                src={src} 
                alt={`Gallery item ${index}`} 
                className={styls.galleryImg} 
            />
          </a>
        ))}
      </div>
    </section>
  );
}