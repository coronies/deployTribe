import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupProgress, setSetupProgress] = useState(null);

  // Function to refresh user data
  const refreshUserData = async (user) => {
    if (!user) {
      setCurrentUser(null);
      setSetupProgress(null);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        let clubData = null;

        if (userData.userType === 'club') {
          const clubDoc = await getDoc(doc(db, 'clubs', user.uid));
          if (clubDoc.exists()) {
            clubData = clubDoc.data();
            // Track setup progress
            if (!clubData.isSetupComplete && clubData.setupProgress) {
              setSetupProgress(clubData.setupProgress);
            }
          }
        }

        setCurrentUser({
          ...user,
          ...userData,
          ...(clubData && { clubData })
        });
      } else {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setCurrentUser(user);
    }
  };

  const updateSetupProgress = async (progress) => {
    if (!currentUser || currentUser.userType !== 'club') return;

    try {
      const clubRef = doc(db, 'clubs', currentUser.uid);
      await updateDoc(clubRef, {
        setupProgress: progress,
        updatedAt: serverTimestamp()
      });
      setSetupProgress(progress);
    } catch (error) {
      console.error('Error updating setup progress:', error);
    }
  };

  const completeSetup = async () => {
    if (!currentUser || currentUser.userType !== 'club') return;

    try {
      const clubRef = doc(db, 'clubs', currentUser.uid);
      await updateDoc(clubRef, {
        isSetupComplete: true,
        setupProgress: 100,
        updatedAt: serverTimestamp()
      });
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        isSetupComplete: true,
        updatedAt: serverTimestamp()
      });

      await refreshUserData(currentUser);
    } catch (error) {
      console.error('Error completing setup:', error);
    }
  };

  async function signup(email, password, userType, userData) {
    try {
      console.log('AuthContext: Starting signup process', { email, userType });
      
      // Step 1: Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('AuthContext: Auth user created successfully', user.uid);

      // Step 2: Prepare user data
      const userProfileData = {
        uid: user.uid,
        email: user.email,
        userType,
        university: userData.university,
        universityName: userData.universityName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isSetupComplete: userType === 'student',
        ...(userType === 'student' ? { 
          name: userData.name,
          interests: [],
          joinedClubs: []
        } : {
          clubName: userData.clubName,
          description: userData.description,
          categories: [],
          members: [user.uid],
          admins: [user.uid]
        })
      };

      console.log('AuthContext: Prepared user profile data', userProfileData);

      // Step 3: Update auth profile
      await updateProfile(user, {
        displayName: userType === 'student' ? userData.name : userData.clubName
      });
      console.log('AuthContext: Updated auth profile');

      // Step 4: Create user document
      await setDoc(doc(db, 'users', user.uid), userProfileData);
      console.log('AuthContext: Created user document');

      // Step 5: If club, create club document
      if (userType === 'club') {
        const clubData = {
          uid: user.uid,
          name: userData.clubName,
          description: userData.description,
          university: userData.university,
          universityName: userData.universityName,
          categories: [],
          tags: {
            interests: [],
            commitment: '',
            experience: []
          },
          members: [user.uid],
          admins: [user.uid],
          events: [],
          memberLimit: '',
          meetingTimes: {},
          profilePictureUrl: '',
          faqs: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isSetupComplete: false,
          setupProgress: 0,
          createdBy: user.uid
        };
        
        await setDoc(doc(db, 'clubs', user.uid), clubData);
        console.log('AuthContext: Created club document');
      }

      console.log('AuthContext: Signup completed successfully');
      
      return {
        ...user,
        ...userProfileData
      };
    } catch (error) {
      console.error('AuthContext: Signup error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Re-throw with more context
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user profile data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      
      // If club, get club data
      let clubData = null;
      if (userData.userType === 'club') {
        const clubDoc = await getDoc(doc(db, 'clubs', user.uid));
        if (clubDoc.exists()) {
          clubData = clubDoc.data();
        }
      }

      return {
        ...user,
        ...userData,
        ...(clubData && { clubData })
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      // Clean up state before signing out
      setCurrentUser(null);
      setSetupProgress(null);
      setLoading(true);
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Additional cleanup if needed
      setLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await refreshUserData(user);
        } else {
          setCurrentUser(null);
          setSetupProgress(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setCurrentUser(null);
        setSetupProgress(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    refreshUserData,
    setupProgress,
    updateSetupProgress,
    completeSetup
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 