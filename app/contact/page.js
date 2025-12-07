export default function ContactPage() {
  return (
    <main className="continer_main_for_home">
       <div className="contact-page-container">
            <h2>יצירת קשר</h2>
            <p>
               אני כאן לכל שאלה, בקשה או הזמנה.
               <br />
               אפשר לבחור את הדרך הנוחה לך:
            </p>

            <div className="contact-options-grid">

                <a href="https://wa.me/972542043429" className="contact-card whatsapp" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-whatsapp"></i>
                    <h3>שליחת הודעה בוואטסאפ</h3>
                    <p>לשיחה מהירה ונוחה</p>
                </a>

                <a href="mailto:ronitluz@gmail.com" target="_blank" rel="noopener noreferrer" className="contact-card email">
                    <i className="far fa-envelope"></i>
                    <h3>שליחת אימייל</h3>
                    <p>לפניות מפורטות או רשמיות</p>
                </a>

                <a href="https://www.facebook.com/share/1G9yZBMfAP/" className="contact-card facebook" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f"></i>
                    <h3>עמוד הפייסבוק</h3>
                    <p>להישאר מעודכנים ולצפות בתמונות</p>
                </a>

            </div> 
        </div>
    </main>
  );
}