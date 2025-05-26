// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
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

// Comment out emulator connections for now
// if (window.location.hostname === 'localhost') {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

// Initialize analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export { auth, db, storage };
export default app; 