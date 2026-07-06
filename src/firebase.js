import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ค่าตรงนี้ก๊อปมาจาก Firebase Console > Project settings > Your apps
// ไม่ใช่ความลับ ฝังในเว็บฝั่ง client ได้ปกติ (ความปลอดภัยจริงๆ อยู่ที่ Firestore security rules)
const firebaseConfig = {
  apiKey: "AIzaSyB_NA3FTB7BBo6n10b1R1vqQcboA7gtn7I",
  authDomain: "soicex-cookierun-hub.firebaseapp.com",
  projectId: "soicex-cookierun-hub",
  storageBucket: "soicex-cookierun-hub.firebasestorage.app",
  messagingSenderId: "1055960368532",
  appId: "1:1055960368532:web:e658de5f2bc267aad0fb81",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
