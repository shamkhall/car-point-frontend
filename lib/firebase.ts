import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_-YOT5OTNSZNQ_SP7NDd6oes9WhXt8Pw",
  authDomain: "kapot-e3715.firebaseapp.com",
  projectId: "kapot-e3715",
  storageBucket: "kapot-e3715.firebasestorage.app",
  messagingSenderId: "529474359415",
  appId: "1:529474359415:web:3ba90660e0f2e0332f3672",
  measurementId: "G-HY9EWX8BTW",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");
