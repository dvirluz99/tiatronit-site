'use client';

import { useState } from 'react';
import { db } from '../../../lib/firebase.js'; 
import { doc, setDoc } from 'firebase/firestore';


// הנתונים המעודכנים לפי שמות התיקיות ב-Storage
const homeGalleryData = {
  images: [
    'AllDir/general_photo/image1.jpg',
    'AllDir/general_photo/image2.jpg',
    'AllDir/general_photo/image3.jpg',
    'AllDir/general_photo/image4.jpg',
    'AllDir/general_photo/image5.jpg',
    'AllDir/general_photo/image6.jpg',
    'AllDir/general_photo/image7.jpg',
    'AllDir/general_photo/image8.jpg',
    'AllDir/general_photo/image9.jpg',
    'AllDir/general_photo/image10.jpg',
    'AllDir/general_photo/image11.jpeg',
    'AllDir/general_photo/image12.jpeg',
    'AllDir/general_photo/image13.jpeg',
    'AllDir/general_photo/image14.jpeg',
    'AllDir/general_photo/image15.jpeg',
    'AllDir/general_photo/image16.jpeg',
    'AllDir/general_photo/image17.jpeg',
    'AllDir/havale_shoah/image13.jpg',
    'AllDir/havale_shoah/image14.jpg',
    'AllDir/havale_shoah/image15.jpg',
    'AllDir/havale_shoah/image18.jpg',
    'AllDir/Kindergarden_and_preschool/imge5.jpg',
    'AllDir/Kindergarden_and_preschool/imge1.jpg',
    'AllDir/the_third_age/imge5.jpg',
  ]
};



export default function MigratePuppetsPage() {
    const [status, setStatus] = useState('ממתין...');

    const uploadHomeGallery = async () => {
    try {
        await setDoc(doc(db, 'settings', 'homeGallery'), homeGalleryData);
        alert('הגלריה עלתה בהצלחה!');
    } catch (error) {
        console.error("Error uploading gallery: ", error);
        alert('שגיאה בהעלאה');
    }
};

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <button onClick={uploadHomeGallery} style={{ padding: '15px', fontSize: '18px', background: '#2998f4', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                העלה את נתוני הבובות 🎭
            </button>
            <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</p>
        </div>
    );
}