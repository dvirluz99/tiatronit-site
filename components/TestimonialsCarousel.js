'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { aboutData } from '../data/presentations';

export default function TestimonialsCarousel() {
    const testimonials = aboutData.testimonials;
    const [currentIndex, setCurrentIndex] = useState(0);

    // --- משתנים לניהול המגע (Touch) ---
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // המרחק המינימלי (בפיקסלים) כדי שזה ייחשב כהחלקה
    const minSwipeDistance = 50;

    // 1. התחלת המגע
    const onTouchStart = (e) => {
        setTouchEnd(null); // איפוס סיום המגע הקודם
        setTouchStart(e.targetTouches[0].clientX); // שמירת מיקום ה-X ההתחלתי
    };

    // 2. הזזת האצבע
    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX); // עדכון מיקום ה-X הנוכחי
    };

    // 3. סיום המגע (חישוב הכיוון)
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide(); // החלקה שמאלה = הבא (בעברית זה הפוך לוגית אבל ויזואלית זה נכון)
        }
        if (isRightSwipe) {
            prevSlide(); // החלקה ימינה = הקודם
        }
    };
    // -----------------------------------

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            (prevIndex + 1) % testimonials.length
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            (prevIndex - 1 + testimonials.length) % testimonials.length
        );
    };

    const firstItem = testimonials[currentIndex];
    const secondIndex = (currentIndex + 1) % testimonials.length;
    const secondItem = testimonials[secondIndex];

    const visibleItems = [firstItem, secondItem];

    return (
        <section className="carousel-section">
            <h2 className="carousel-title">לקוחות מספרים</h2>
            
            <div 
                className="carousel-container"
                // הוספת המאזינים לאירועי המגע לאזור הקרוסלה
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* כפתור ימינה */}
                <button onClick={prevSlide} className="carousel-btn" aria-label="הקודם">
                    <i className="fas fa-chevron-right"></i>
                </button>

                {/* אזור הכרטיסים */}
                <div className="carousel-track">
                    {visibleItems.map((item, index) => (
                        <Link 
                            key={`${item.linkRecId}-${index}`} 
                            href={`/recommendation/${item.linkRecId}`}
                            className="carousel-card"
                        >
                            <div className="carousel-quote-icon">❝</div>
                            <p className="carousel-text">{item.text}</p>
                            <div>
                                <div className="carousel-author">{item.author}</div>
                                <span className="carousel-show-name">{item.fromPresention}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* כפתור שמאלה */}
                <button onClick={nextSlide} className="carousel-btn" aria-label="הבא">
                    <i className="fas fa-chevron-left"></i>
                </button>
            </div>
            
            {/* הוראה קטנה למשתמשים במובייל (אופציונלי) */}
            <p className="carousel-hint-mobile" style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', display: 'none' }}>
                החליקו לצדדים לעוד המלצות
            </p>
        </section>
    );
}