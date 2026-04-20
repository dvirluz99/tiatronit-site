'use client';

import { useEffect } from 'react';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import styles from './homeGallery.module.css';


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

  // duplicate for seamless looping marquee
  const loop = [...images, ...images];

  return (
    <section className={styles.section} aria-label="גלריית תמונות מהצגות וסדנאות">
      <div className={styles.track}>
        {loop.map((src, index) => (
          <a
            key={index}
            href={src}
            data-fancybox="home-gallery"
            className={styles.item}
          >
            <img src={src} alt={`תמונה מהפעילויות ${(index % images.length) + 1}`} className={styles.img} loading="lazy" />
          </a>
        ))}
      </div>
    </section>
  );
}