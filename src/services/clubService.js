import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

// Create or update a club
export async function createClub(clubData, logoFile) {
  try {
    const clubRef = doc(collection(db, 'clubs'));
    let logoUrl = '';

    if (logoFile) {
      const storageRef = ref(storage, `club-logos/${clubRef.id}`);
      await uploadBytes(storageRef, logoFile);
      logoUrl = await getDownloadURL(storageRef);
    }

    await setDoc(clubRef, {
      ...clubData,
      logoUrl,
      createdAt: new Date().toISOString(),
      members: [],
      events: [],
      analytics: {
        totalViews: 0,
        totalMembers: 0,
        eventAttendance: []
      }
    });

    return clubRef.id;
  } catch (error) {
    throw error;
  }
}

// Get club details
export async function getClub(clubId) {
  const clubDoc = await getDoc(doc(db, 'clubs', clubId));
  return clubDoc.data();
}

// Join a club
export async function joinClub(clubId, userId) {
  const clubRef = doc(db, 'clubs', clubId);
  await updateDoc(clubRef, {
    members: arrayUnion(userId)
  });
}

// Leave a club
export async function leaveClub(clubId, userId) {
  const clubRef = doc(db, 'clubs', clubId);
  await updateDoc(clubRef, {
    members: arrayRemove(userId)
  });
}

// Create a club event
export async function createEvent(clubId, eventData) {
  const eventRef = doc(collection(db, 'events'));
  await setDoc(eventRef, {
    ...eventData,
    clubId,
    createdAt: new Date().toISOString(),
    attendees: [],
    isVirtual: eventData.isVirtual || false,
    virtualMeetingUrl: eventData.virtualMeetingUrl || null
  });

  // Update club's events array
  const clubRef = doc(db, 'clubs', clubId);
  await updateDoc(clubRef, {
    events: arrayUnion(eventRef.id)
  });

  return eventRef.id;
}

// Get club recommendations based on user interests
export async function getRecommendedClubs(userInterests) {
  const clubsRef = collection(db, 'clubs');
  const q = query(clubsRef, where('tags', 'array-contains-any', userInterests));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Get club analytics
export async function getClubAnalytics(clubId) {
  const clubDoc = await getDoc(doc(db, 'clubs', clubId));
  return clubDoc.data()?.analytics || {};
}

// Update club analytics
export async function updateClubAnalytics(clubId, analyticsData) {
  const clubRef = doc(db, 'clubs', clubId);
  await updateDoc(clubRef, {
    'analytics': analyticsData
  });
}

// Get all upcoming events
export async function getUpcomingEvents(filters = {}) {
  const eventsRef = collection(db, 'events');
  let q = query(eventsRef, where('date', '>=', new Date().toISOString()));
  
  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }
  
  if (filters.isVirtual !== undefined) {
    q = query(q, where('isVirtual', '==', filters.isVirtual));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Get sponsorship opportunities
export async function getSponsorshipOpportunities() {
  const sponsorshipsRef = collection(db, 'sponsorships');
  const querySnapshot = await getDocs(sponsorshipsRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Apply for sponsorship
export async function applyForSponsorship(clubId, sponsorshipId, applicationData) {
  const applicationRef = doc(collection(db, 'sponsorshipApplications'));
  await setDoc(applicationRef, {
    clubId,
    sponsorshipId,
    ...applicationData,
    status: 'pending',
    submittedAt: new Date().toISOString()
  });
  return applicationRef.id;
} 