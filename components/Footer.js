export default function Footer() {
  return (
    <footer>
        <div>
            <ul className="contact-links-list">
    
                <li className="contact-item">
                    <a href="mailto:ronitluz@gmail.com" target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-envelope"></i>
                        <span>ronitluz@gmail.com</span>
                    </a>
                </li>
                
                <li className="contact-item">
                    <a href="tel:+972542043429">
                        <i className="fas fa-phone"></i>
                        <span>054-2043429</span>
                    </a>
                </li>
                
                <li className="contact-item">
                    <a href="https://www.facebook.com/share/1G9yZBMfAP/" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook"></i>
                        <span>פייסבוק</span>
                    </a>
                </li>

                <li className="contact-item">
                    <a href="https://wa.me/972542043429?text=שלום,%20אשמח%20לפרטים%20על%20הצגות%20בובות" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-whatsapp"></i>
                        <span>וואטסאפ</span>
                    </a>
                </li>

            </ul>
        </div>
    </footer>
  );
}