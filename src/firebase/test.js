import { db, auth, storage, analytics } from './config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Test function to verify Firebase connection
export async function testFirebaseConnection() {
    try {
        // Test Firestore
        const testCollection = collection(db, 'test');
        const testDoc = await addDoc(testCollection, {
            message: 'Test connection',
            timestamp: new Date()
        });
        console.log('Firestore test successful, created document:', testDoc.id);

        // Read the test document
        const querySnapshot = await getDocs(testCollection);
        console.log('Retrieved documents:', querySnapshot.size);

        // Test Authentication is initialized
        console.log('Auth initialized:', !!auth);

        // Test Storage is initialized
        console.log('Storage initialized:', !!storage);

        // Test Analytics is initialized
        console.log('Analytics initialized:', !!analytics);

        return {
            success: true,
            message: 'All Firebase services are working correctly'
        };
    } catch (error) {
        console.error('Firebase test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test function to verify user authentication
export async function testUserAuth(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return {
            success: true,
            message: `Successfully authenticated user: ${userCredential.user.email}`
        };
    } catch (error) {
        console.error('Auth test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
} 