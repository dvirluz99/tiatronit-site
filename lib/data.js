import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// 1. משיכת מבנה דף הבית (הכרטיסיות והאוספים)
export async function getHomePageStructure() {
    const querySnapshot = await getDocs(collection(db, 'collections'));
    const collections = [];
    
    querySnapshot.forEach((doc) => {
        collections.push({ id: doc.id, ...doc.data() });
    });
    
    // ממיין לפי ה-ID כדי לשמור על הסדר המקורי (card_1, card_2...)
    return collections.sort((a, b) => a.id.localeCompare(b.id));
}

// 2. משיכת כל ההצגות (מחזיר אובייקט בדיוק כמו showData שהיה לך)
export async function getAllShows() {
    const querySnapshot = await getDocs(collection(db, 'shows'));
    const shows = {};
    
    querySnapshot.forEach((doc) => {
        shows[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    return shows;
}

// 3. משיכת הצגה או סדנא בודדת לפי ID
export async function getShowById(showId) {
    const docRef = doc(db, 'shows', showId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}

// 4. משיכת עמוד אודות
export async function getAboutData() {
    const docRef = doc(db, 'pages', 'about');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

// 5. משיכת ההמלצות
export async function getRecommendations() {
    const querySnapshot = await getDocs(collection(db, 'recommendations'));
    const recommendations = {};
    
    querySnapshot.forEach((doc) => {
        recommendations[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    return recommendations;
}

// משיכת נתוני עמוד הבובות
export async function getPuppetsData() {
    const docRef = doc(db, 'pages', 'puppets');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

// משיכת תמונות לגלריית דף הבית
export async function getHomeGalleryImages() {
    const docRef = doc(db, 'settings', 'homeGallery');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return docSnap.data().images || [];
    }
    return [];
}