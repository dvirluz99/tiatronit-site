'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SideMenu from './SideMenu';

// 1. הוספנו את קבלת הנתונים כפרופס
export default function Header({ homePageStructure, showData }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  return (
    <header className="site-header">
        <div className="continer_header" style={{ width: '100%', maxWidth: '100%' }}>
            
            <button 
                className="hamburger-btn" 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="פתח תפריט"
            >
                {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
            </button>

            <h1 className="header-title">
             ברוכים הבאים לתיאטרונית!  
            </h1>

            <div className="header-left">
                <Link href="/" onClick={closeMenu}>
                    <img src="/logo2.jpeg" alt="Logo" className="img_item_header" />
                </Link>
            </div>

            {/* 2. אנחנו מעבירים את הנתונים שקיבלנו הלאה לתפריט */}
            <SideMenu 
                isOpen={isOpen} 
                closeMenu={closeMenu} 
                homePageStructure={homePageStructure}
                showData={showData}
            />

        </div>
    </header>
  );
}