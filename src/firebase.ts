import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQSHaJvwRJKmC1WwnYkTs9x-T2Yf1UV0k",
  authDomain: "mls-site-941f6.firebaseapp.com",
  projectId: "mls-site-941f6",
  storageBucket: "mls-site-941f6.firebasestorage.app",
  messagingSenderId: "48541288894",
  appId: "1:48541288894:web:d421e53a4cd97573c111ef",
  measurementId: "G-WKFNLQ67BF",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
