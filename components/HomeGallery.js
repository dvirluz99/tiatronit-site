'use client';

import { useEffect } from 'react';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import styls from './homeGallery.module.css'; 

const galleryImages = [
  '/AllDir/תמונות כלליות והוספות/image1.jpg',
  '/AllDir/תמונות כלליות והוספות/image2.jpg',
  '/AllDir/תמונות כלליות והוספות/image3.jpg',
  '/AllDir/תמונות כלליות והוספות/image4.jpg',
  '/AllDir/תמונות כלליות והוספות/image5.jpg',
  '/AllDir/תמונות כלליות והוספות/image6.jpg',
  '/AllDir/תמונות כלליות והוספות/image7.jpg',
  '/AllDir/תמונות כלליות והוספות/image8.jpg',
  '/AllDir/תמונות כלליות והוספות/image9.jpg',
  '/AllDir/תמונות כלליות והוספות/image10.jpg',
  '/AllDir/תמונות כלליות והוספות/image11.jpeg',
  '/AllDir/תמונות כלליות והוספות/image12.jpeg',
  '/AllDir/תמונות כלליות והוספות/image13.jpeg',
  '/AllDir/תמונות כלליות והוספות/image14.jpeg',
  '/AllDir/תמונות כלליות והוספות/image15.jpeg',
  '/AllDir/תמונות כלליות והוספות/image16.jpeg',
  '/AllDir/תמונות כלליות והוספות/image17.jpeg',
];

export default function HomeGallery() {

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
  const infiniteImages = [...galleryImages, ...galleryImages];

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