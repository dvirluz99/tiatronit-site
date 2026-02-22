import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyDgVii2X0447DHQb4gMrd3_x1YFUUoeqCs",
  authDomain: "teatronit-db.firebaseapp.com",
  projectId: "teatronit-db",
  storageBucket: "teatronit-db.firebasestorage.app",
  messagingSenderId: "176098529719",
  appId: "1:176098529719:web:2834d5b28615a5588c5832",
  measurementId: "G-MPGMFGXQY4"
};

// אתחול החיבור לפיירבייס
const app = initializeApp(firebaseConfig);

// ייצוא מסד הנתונים (db) ומערכת האימות (auth) כדי שנוכל להשתמש בהם בשאר האתר
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);