'use client';

import { useState } from 'react';
import { db, storage } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

export default function UpdateImagesPage() {
    const [status, setStatus] = useState('ממתין ללחיצה...');

    const cleanPath = (path) => {
        if (typeof path === 'string' && path.startsWith('/')) {
            return path.substring(1);
        }
        return path;
    };

    const runUpdate = async () => {
        setStatus('מתחיל לסרוק ולעדכן תמונות... נא לא לסגור את הדף! ⏳');
        try {
            let updatedCount = 0;

            // --- חלק 1: עדכון כל ההצגות (shows) ---
            const showsSnapshot = await getDocs(collection(db, 'shows'));
            
            for (const showDoc of showsSnapshot.docs) {
                const showData = showDoc.data();
                const updates = {};

                if (showData.mainImg && !showData.mainImg.startsWith('http')) {
                    try {
                        const fixedPath = cleanPath(showData.mainImg);
                        const imgRef = ref(storage, fixedPath); 
                        updates.mainImg = await getDownloadURL(imgRef);
                    } catch (e) {
                        console.error(`לא הצלחתי למצוא את התמונה ${showData.mainImg}`);
                    }
                }

                if (showData.arrayGallery && Array.isArray(showData.arrayGallery)) {
                    const newGallery = [];
                    
                    for (const item of showData.arrayGallery) {
                        if (item && item.img && !item.img.startsWith('http')) {
                            try {
                                const fixedPath = cleanPath(item.img);
                                const imgRef = ref(storage, fixedPath);
                                const url = await getDownloadURL(imgRef);
                                
                                newGallery.push({ ...item, img: url });
                            } catch (e) {
                                console.error(`לא הצלחתי למצוא את התמונה בנתיב: ${item.img}`);
                                newGallery.push(item); 
                            }
                        } else {
                            newGallery.push(item);
                        }
                    }
                    
                    if (newGallery.length > 0) {
                        updates.arrayGallery = newGallery;
                    }
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(doc(db, 'shows', showDoc.id), updates);
                    updatedCount++;
                }
            }

            // --- חלק 2: עדכון גלריית דף הבית (settings) ---
            const galleryDocRef = doc(db, 'settings', 'homeGallery');
            const gallerySnap = await getDoc(galleryDocRef);

            if (gallerySnap.exists()) {
                const { images } = gallerySnap.data();
                if (images && Array.isArray(images)) {
                    const updatedHomeGallery = [];
                    let galleryChanged = false;

                    for (const path of images) {
                        if (path && !path.startsWith('http')) {
                            try {
                                const fixedPath = cleanPath(path);
                                const imgRef = ref(storage, fixedPath);
                                const url = await getDownloadURL(imgRef);
                                updatedHomeGallery.push(url);
                                galleryChanged = true;
                            } catch (e) {
                                console.error(`לא מצאתי את ${path} בגלריית הבית`);
                                updatedHomeGallery.push(path);
                            }
                        } else {
                            updatedHomeGallery.push(path);
                        }
                    }

                    if (galleryChanged) {
                        await updateDoc(galleryDocRef, { images: updatedHomeGallery });
                        console.log("גלריית דף הבית עודכנה!");
                    }
                }
            }

            // --- חלק 3: עדכון קולקציית הכרטיסיות (collections) ---
            const collectionsSnapshot = await getDocs(collection(db, 'collections'));
            
            for (const cardDoc of collectionsSnapshot.docs) {
                const cardData = cardDoc.data();
                const updates = {};

                // 1. עדכון mainImg של הכרטיסיה
                if (cardData.mainImg && !cardData.mainImg.startsWith('http')) {
                    try {
                        const fixedPath = cleanPath(cardData.mainImg);
                        const imgRef = ref(storage, fixedPath);
                        updates.mainImg = await getDownloadURL(imgRef);
                    } catch (e) {
                        console.error(`לא הצלחתי למצוא את התמונה בכרטיסיה ${cardDoc.id}`);
                    }
                }

                // 2. עדכון collectionGallery בתוך הכרטיסיה
                if (cardData.collectionGallery && Array.isArray(cardData.collectionGallery)) {
                    const newCollectionGallery = [];
                    
                    for (const item of cardData.collectionGallery) {
                        if (item && item.img && !item.img.startsWith('http')) {
                            try {
                                const fixedPath = cleanPath(item.img);
                                const imgRef = ref(storage, fixedPath);
                                const url = await getDownloadURL(imgRef);
                                
                                newCollectionGallery.push({ ...item, img: url });
                            } catch (e) {
                                console.error(`לא הצלחתי למצוא את התמונה בגלריה של כרטיסיה ${cardDoc.id}: ${item.img}`);
                                newCollectionGallery.push(item); 
                            }
                        } else {
                            newCollectionGallery.push(item);
                        }
                    }
                    
                    if (newCollectionGallery.length > 0) {
                        updates.collectionGallery = newCollectionGallery;
                    }
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(doc(db, 'collections', cardDoc.id), updates);
                    updatedCount++;
                }
            }
            
            setStatus(`✅ סיום! עודכנו ${updatedCount} מסמכים (הצגות וכרטיסיות כולל גלריות) וגלריית הבית.`);
        } catch (error) {
            setStatus('❌ שגיאה: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>עדכון תמונות לענן ☁️</h1>
            <p>הסקריפט יסרוק את כל ההצגות, הכרטיסיות (כולל גלריות) וגלריית הבית ויחליף את הנתיבים הישנים בקישורים מ-Firebase Storage.</p>
            <button 
                onClick={runUpdate} 
                style={{ padding: '15px 30px', fontSize: '18px', background: '#2998f4', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' }}
            >
                עדכן קישורי תמונות 🚀
            </button>
            <h3 style={{ marginTop: '30px' }}>{status}</h3>
        </div>
    );
}