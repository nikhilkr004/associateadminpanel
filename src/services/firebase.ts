// Firebase Configuration
// Replace these values with your actual Firebase project configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCva0joVLtCyvUOPDoRLds-R9vpmRfdGlU",
  authDomain: "new-e70d7.firebaseapp.com",
  databaseURL: "https://new-e70d7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "new-e70d7",
  storageBucket: "new-e70d7.firebasestorage.app",
  messagingSenderId: "47406421196",
  appId: "1:47406421196:web:cc8d2fe93acf83cfe01e69",
  measurementId: "G-RENJRTB6M6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
