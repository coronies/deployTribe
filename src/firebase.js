// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
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

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Set auth persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Create root storage reference
export const storageRef = ref(storage);

export default app; 