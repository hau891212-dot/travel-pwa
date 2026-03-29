import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJs5R7iSFSuIzOrn6VZbzkCuFtYS1q7Bo",
  authDomain: "travel-pwa-715a5.firebaseapp.com",
  projectId: "travel-pwa-715a5",
  storageBucket: "travel-pwa-715a5.firebasestorage.app",
  messagingSenderId: "59035879762",
  appId: "1:59035879762:web:d3b86ed2515ac354a0d28b",
  measurementId: "G-QDVL33PH12"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出資料庫大腦 (一定要寫這行，功能才接得通)
export const db = getFirestore(app);