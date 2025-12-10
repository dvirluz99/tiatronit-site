'use client';

import { useState } from 'react';
import Link from 'next/link';
import { homePageStructure, showData } from '../data/presentations';
import styles from './SideMenu.module.css';

export default function SideMenu({ isOpen, closeMenu }) {
  
  const [openSection, setOpenSection] = useState('');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  // --- סינון הנתונים ---
  // סדנאות (Collections)
  const workshops = homePageStructure.filter(item => item.type === 'collection');

  // המרת אובייקט ההצגות למערך כדי שנוכל לסנן
  const allShowsArray = Object.values(showData);
  
  // מיון לפי קטגוריות
  // וודא שבקובץ הדאטה שלך יש לכל הצגה את השדה category: 'kids' או 'adults'
  const kidsShows = allShowsArray.filter(show => show.category === 'kids');
  const adultsShows = allShowsArray.filter(show => show.category === 'adults');
  const youthShows = allShowsArray.filter(show => show.category === 'youth');

return (
    <>
      <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
        
        {/* === אזור עליון - נגלל === */}
        <div className={styles.scrollContainer}>
            
            <Link href="/" className={styles.link} onClick={closeMenu}>דף הבית</Link>
            <Link href="/about" className={styles.link} onClick={closeMenu}>קצת עלי</Link>

            <hr className={styles.divider} />

            {/* --- הצגות לילדים --- */}
            <button className={styles.accordionBtn} onClick={() => toggleSection('kids')}>
                <span>הצגות לילדים</span>
                <i className={`fas fa-chevron-down ${styles.arrow} ${openSection === 'kids' ? styles.rotate : ''}`}></i>
            </button>
            <div className={`${styles.submenu} ${openSection === 'kids' ? styles.submenuOpen : ''}`}>
                {/* הוספנו כאן מעטפת פנימית לאנימציה חלקה */}
                <div className={styles.submenuContent}>
                    {kidsShows.map((show) => (
                        <Link key={show.id} href={`/show/${show.id}`} className={styles.subLink} onClick={closeMenu}>
                            • {show.title}
                        </Link>
                    ))}
                </div>
            </div>

            {/* --- מבוגרים וגיל שלישי --- */}
            <button className={styles.accordionBtn} onClick={() => toggleSection('adults')}>
                <span>מבוגרים וגיל שלישי</span>
                <i className={`fas fa-chevron-down ${styles.arrow} ${openSection === 'adults' ? styles.rotate : ''}`}></i>
            </button>
            <div className={`${styles.submenu} ${openSection === 'adults' ? styles.submenuOpen : ''}`}>
                <div className={styles.submenuContent}>
                    {adultsShows.map((show) => (
                        <Link key={show.id} href={`/show/${show.id}`} className={styles.subLink} onClick={closeMenu}>
                            • {show.title}
                        </Link>
                    ))}
                </div>
            </div>

            <button className={styles.accordionBtn} onClick={() => toggleSection('youth')}>
                <span>הצגות לנוער</span>
                <i className={`fas fa-chevron-down ${styles.arrow} ${openSection === 'youth' ? styles.rotate : ''}`}></i>
            </button>
            <div className={`${styles.submenu} ${openSection === 'youth' ? styles.submenuOpen : ''}`}>
                <div className={styles.submenuContent}>
                    {youthShows.map((show) => (
                        <Link key={show.id} href={`/show/${show.id}`} className={styles.subLink} onClick={closeMenu}>
                            • {show.title}
                        </Link>
                    ))}
                </div>
            </div>

            {/* --- סדנאות --- */}
            <button className={styles.accordionBtn} onClick={() => toggleSection('workshops')}>
                <span>הסדנאות שלנו</span>
                <i className={`fas fa-chevron-down ${styles.arrow} ${openSection === 'workshops' ? styles.rotate : ''}`}></i>
            </button>
            <div className={`${styles.submenu} ${openSection === 'workshops' ? styles.submenuOpen : ''}`}>
                <div className={styles.submenuContent}>
                    {workshops.map((ws) => (
                        <Link key={ws.id} href={`/collection/${ws.id}`} className={styles.subLink} onClick={closeMenu}>
                            • {ws.title}
                        </Link>
                    ))}
                </div>
            </div>

            <hr className={styles.divider} />

            <Link href="/testimonials" className={styles.link} onClick={closeMenu}>
                המלצות
            </Link>
            
            {/* הגדלתי את הרווח בסוף כדי שהכפתור התחתון לא יסתיר כלום */}
            <div style={{ minHeight: '80px' }}></div> 

        </div>

        {/* === אזור תחתון - קבוע === */}
        <div className={styles.bottomSection}>
            <Link href="/contact" className={`${styles.link} ${styles.contactBtn}`} onClick={closeMenu}>
                צרו קשר
            </Link>
        </div>

      </nav>

      {isOpen && (
        <div 
            className={styles.backdrop} 
            onClick={closeMenu}
            onTouchMove={(e) => e.preventDefault()} 
        ></div>
      )}
    </>
  );
}