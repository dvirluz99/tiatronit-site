'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { homePageStructure } from '../data/presentations';
import SideMenu from './SideMenu'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  const categories = homePageStructure.filter(item => item.type === 'collection');

 useEffect(() => {
    if (isOpen) {
      // נועלים את הגלילה
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // מבטלים תגובות מגע מיותרות על הגוף
      document.body.style.touchAction = 'none';
    } else {
      // משחררים
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
                    <img src="/AllDir/לוגו/logo1.jpg" alt="Logo" className="img_item_header" />
                </Link>
            </div>

            <SideMenu isOpen={isOpen} closeMenu={closeMenu} />

        </div>
    </header>
  );
}