import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. 補上這行

// 你的金鑰（請確認這部分維持你原本的內容）
const firebaseConfig = {
  apiKey: "AIzaSyDJs5R7iSFSuIzOrn6VZbzkCuFtYS1q7Bo",
  authDomain: "travel-pwa-715a5.firebaseapp.com",
  projectId: "travel-pwa-715a5",
  storageBucket: "travel-pwa-715a5.firebasestorage.app",
  messagingSenderId: "59035879762",
  appId: "1:59035879762:web:d3b86ed2515ac354a0d28b",
  measurementId: "G-QDVL33PH12"
};

const app = initializeApp(firebaseConfig);

// 2. 補上這兩行，並確保有 export
export const db = getFirestore(app);
export const storage = getStorage(app); // 這是關鍵，沒這行記帳模組會壞掉