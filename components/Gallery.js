'use client'; // חובה! זה אומר ל-Next.js שהקובץ הזה רץ בדפדפן

import { useEffect } from 'react';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css"; // הייבוא של ה-CSS של הספרייה

export default function Gallery({ images }) {
  
  // הפעלה של Fancybox ברגע שהגלריה מופיעה על המסך
  useEffect(() => {
    Fancybox.bind("[data-fancybox]", {
      // כאן אפשר להוסיף הגדרות אם רוצים
    });

    // ניקוי כשהרכיב יוצא מהמסך (חשוב ב-React!)
    return () => {
      Fancybox.destroy();
    };
  }, []);

  return (
    <div className="gallery-grid">
        {images.map((item, index) => (
            <a key={index} href={`/${item.img}`} data-fancybox="gallery">
                <img src={`/${item.img}`} alt={`תמונה ${index + 1}`} />
            </a>
        ))}
    </div>
  );
}