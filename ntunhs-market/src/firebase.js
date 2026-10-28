import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB7GD0rvlWo3jQzcJqx2qEcP8pBkMHnpas",
  authDomain: "ntunhs-market.firebaseapp.com",
  projectId: "ntunhs-market",
  storageBucket: "ntunhs-market.firebasestorage.app",
  messagingSenderId: "309376473924",
  appId: "1:309376473924:web:df54b3d6ead6b5ac085511"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
