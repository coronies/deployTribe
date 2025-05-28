// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

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

// Connect to emulators in development with better error handling
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  try {
    // Connect to emulators with new ports
    connectAuthEmulator(auth, 'http://localhost:9090', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8090);
    connectStorageEmulator(storage, 'localhost', 9190);
    
    console.log('Connected to Firebase emulators on ports: Auth(9090), Firestore(8090), Storage(9190)');
  } catch (error) {
    console.warn('Failed to connect to emulators:', error);
    console.log('Using production Firebase services');
  }
}

// Initialize analytics only in production and if supported
let analytics = null;
const initAnalytics = async () => {
  try {
    if (process.env.NODE_ENV === 'production' && await isSupported()) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
};

initAnalytics();

export { auth, db, storage, analytics };
export default app; 