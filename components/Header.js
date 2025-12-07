'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { homePageStructure } from '../data/presentations';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  const categories = homePageStructure.filter(item => item.type === 'collection');

 useEffect(() => {
    if (isOpen) {
      // נועלים גלילה גם ב-body וגם ב-html (חשוב למחשב)
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // משחררים את הנעילה (מסירים את ה-style כדי שה-CSS המקורי יחזור)
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // ניקוי ביציאה
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header className="site-header">
        {/* הוספתי inline style כדי לוודא שזה תופס 100% רוחב */}
        <div className="continer_header" style={{ width: '100%', maxWidth: '100%' }}>
            
            {/* 1. כפתור ההמבורגר - ראשון בקוד -> הולך לימין */}
            <button 
                className="hamburger-btn" 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="פתח תפריט"
            >
                {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
            </button>

            {/* 2. הלוגו - שני בקוד -> הולך לשמאל */}
            <div className="header-left">
                <Link href="/" onClick={closeMenu}>
                    <img src="/AllDir/לוגו/logo1.jpg" alt="Logo" className="img_item_header" />
                </Link>
            </div>

            {/* --- התפריט (נשאר אותו דבר) --- */}
            <nav className={`main-nav ${isOpen ? 'open' : ''}`}>
                <Link href="/" className="nav-link" onClick={closeMenu}>דף הבית</Link>
                <Link href="/about" className="nav-link" onClick={closeMenu}>קצת עלינו</Link>
                <hr className="nav-divider" />
                <span className="nav-label">הסדנאות שלנו:</span>
                {categories.map((cat) => (
                    <Link key={cat.id} href={`/collection/${cat.id}`} className="nav-link sub-link" onClick={closeMenu}>
                        • {cat.title}
                    </Link>
                ))}
                <hr className="nav-divider" />
                <Link href="/contact" className="nav-link contact-highlight" onClick={closeMenu}>צרו קשר</Link>
            </nav>

            {isOpen && <div className="menu-backdrop" onClick={closeMenu}></div>}

        </div>
    </header>
  );
}