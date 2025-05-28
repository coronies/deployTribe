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
  updateDoc,
  collection,
  query,
  where,
  getDocs
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
          // Query clubs collection to find the club associated with this user
          const clubsQuery = query(
            collection(db, 'clubs'),
            where('createdBy', '==', user.uid)
          );
          const clubSnapshot = await getDocs(clubsQuery);
          
          if (!clubSnapshot.empty) {
            const clubDoc = clubSnapshot.docs[0];
            clubData = { id: clubDoc.id, ...clubDoc.data() };
            
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
      // Find the club document
      const clubsQuery = query(
        collection(db, 'clubs'),
        where('createdBy', '==', currentUser.uid)
      );
      const clubSnapshot = await getDocs(clubsQuery);
      
      if (!clubSnapshot.empty) {
        const clubDoc = clubSnapshot.docs[0];
        await updateDoc(doc(db, 'clubs', clubDoc.id), {
          setupProgress: progress,
          updatedAt: serverTimestamp()
        });
        setSetupProgress(progress);
      }
    } catch (error) {
      console.error('Error updating setup progress:', error);
    }
  };

  const completeSetup = async () => {
    if (!currentUser || currentUser.userType !== 'club') return;

    try {
      // Find the club document
      const clubsQuery = query(
        collection(db, 'clubs'),
        where('createdBy', '==', currentUser.uid)
      );
      const clubSnapshot = await getDocs(clubsQuery);
      
      if (!clubSnapshot.empty) {
        const clubDoc = clubSnapshot.docs[0];
        await updateDoc(doc(db, 'clubs', clubDoc.id), {
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
      }
    } catch (error) {
      console.error('Error completing setup:', error);
      throw error;
    }
  };

  async function signup(email, password, userType, userData) {
    try {
      // Step 1: Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Prepare user data
      const userProfileData = {
        uid: user.uid,
        email: user.email,
        userType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isSetupComplete: userType === 'student',
        university: userData.university,
        universityName: userData.universityName,
        ...(userType === 'student' ? { 
          name: userData.name,
          interests: [],
          joinedClubs: []
        } : {
          clubName: userData.clubName
        })
      };

      // Step 3: Update auth profile
      await updateProfile(user, {
        displayName: userType === 'student' ? userData.name : userData.clubName
      });

      // Step 4: Create user document
      await setDoc(doc(db, 'users', user.uid), userProfileData);

      // Step 5: If club, create initial club document
      if (userType === 'club') {
        const clubData = {
          name: userData.clubName,
          description: userData.description,
          createdBy: user.uid,
          university: userData.university,
          universityName: userData.universityName,
          members: [user.uid],
          admins: [user.uid],
          categories: [],
          tags: {
            interests: [],
            commitment: '',
            experience: []
          },
          memberLimit: '',
          meetingTimes: {},
          events: [],
          applications: [],
          recentActivity: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isSetupComplete: false,
          setupProgress: 0
        };
        
        const clubRef = doc(collection(db, 'clubs'));
        await setDoc(clubRef, clubData);
      }

      // Step 6: Refresh user data to include all information
      await refreshUserData(user);

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
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
        const clubsQuery = query(
          collection(db, 'clubs'),
          where('createdBy', '==', user.uid)
        );
        const clubSnapshot = await getDocs(clubsQuery);
        
        if (!clubSnapshot.empty) {
          const clubDoc = clubSnapshot.docs[0];
          clubData = { id: clubDoc.id, ...clubDoc.data() };
        }
      }

      const fullUserData = {
        ...user,
        ...userData,
        ...(clubData && { clubData })
      };

      setCurrentUser(fullUserData);
      return fullUserData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      setCurrentUser(null);
      setSetupProgress(null);
      setLoading(true);
      await signOut(auth);
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