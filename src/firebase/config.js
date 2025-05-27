// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8VjiNaNz-6_gtbuWC2PAs69sImfHkWuM",
  authDomain: "convergent-db.firebaseapp.com",
  projectId: "convergent-db",
  storageBucket: "convergent-db.appspot.com",
  messagingSenderId: "162981524002",
  appId: "1:162981524002:web:e81c60c7ec382a7f5e507b",
  measurementId: "G-9EMDWQ3T4G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  connectStorageEmulator(storage, 'localhost', 9199);
}

// Initialize analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, db, storage, analytics };
export default app; 