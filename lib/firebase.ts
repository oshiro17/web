// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA5agHFtw_pY2dEaiAFPxO75Wtg-Rwft5U",
    authDomain: "my-site-425ca.firebaseapp.com",
    projectId: "my-site-425ca",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
