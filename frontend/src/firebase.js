// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmF5cp_m-4Ey8B5g1jr6wj1z_--jTkjgI",
  authDomain: "stats-aa44f.firebaseapp.com",
  projectId: "stats-aa44f",
  storageBucket: "stats-aa44f.firebasestorage.app",
  messagingSenderId: "885723741752",
  appId: "1:885723741752:web:8f7f6969ebc17c3692f0cd",
  measurementId: "G-TSLF9E9WC4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

