'use client'; // חובה כי יש פה אינטראקציה (לחיצות)

import { useState } from 'react';
import Link from 'next/link';
import { aboutData } from '../data/presentations';

export default function TestimonialsCarousel() {
    const testimonials = aboutData.testimonials;
    const [currentIndex, setCurrentIndex] = useState(0);

    // פונקציה למעבר להמלצה הבאה
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            (prevIndex + 1) % testimonials.length
        );
    };

    // פונקציה למעבר להמלצה הקודמת
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            (prevIndex - 1 + testimonials.length) % testimonials.length
        );
    };

    // חישוב אילו כרטיסים להציג (הנוכחי והבא אחריו)
    // אנו משתמשים במודולו (%) כדי ליצור מעגליות (אחרי האחרון חוזרים לראשון)
    const firstItem = testimonials[currentIndex];
    const secondIndex = (currentIndex + 1) % testimonials.length;
    const secondItem = testimonials[secondIndex];

    const visibleItems = [firstItem, secondItem];

    return (
        <section className="carousel-section">
            <h2 className="carousel-title">לקוחות מספרים</h2>
            
            <div className="carousel-container">
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
        </section>
    );
}