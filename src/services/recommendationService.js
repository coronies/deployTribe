import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Calculate similarity score between user interests and club tags
function calculateSimilarityScore(userInterests, clubTags) {
  const intersection = userInterests.filter(interest => clubTags.includes(interest));
  return intersection.length / Math.sqrt(userInterests.length * clubTags.length);
}

// Get personalized club recommendations
export async function getPersonalizedRecommendations(userId) {
  try {
    // Get user profile and interests
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const userInterests = userData.interests || [];
    
    // Get user's academic info and activities
    const academicInterests = userData.academicInterests || [];
    const previousActivities = userData.previousActivities || [];
    
    // Get all clubs
    const clubsSnapshot = await getDocs(collection(db, 'clubs'));
    const clubs = clubsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate recommendation scores
    const recommendedClubs = clubs.map(club => {
      const similarityScore = calculateSimilarityScore(userInterests, club.tags);
      const academicScore = calculateSimilarityScore(academicInterests, club.academicFocus || []);
      const activityScore = previousActivities.some(activity => 
        club.activities?.includes(activity)
      ) ? 0.5 : 0;
      
      return {
        ...club,
        score: similarityScore * 0.5 + academicScore * 0.3 + activityScore * 0.2
      };
    });
    
    // Sort by score and return top recommendations
    return recommendedClubs
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

// Get event recommendations
export async function getEventRecommendations(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    // Get upcoming events
    const eventsRef = collection(db, 'events');
    const upcomingEvents = query(
      eventsRef,
      where('date', '>=', new Date().toISOString())
    );
    
    const eventsSnapshot = await getDocs(upcomingEvents);
    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Score events based on user preferences
    const scoredEvents = events.map(event => {
      let score = 0;
      
      // Score based on category match
      if (userData.interests.includes(event.category)) {
        score += 0.4;
      }
      
      // Score based on previous attendance
      if (userData.attendedEvents?.includes(event.id)) {
        score += 0.2;
      }
      
      // Score based on friends' attendance
      const friendsAttending = event.attendees?.filter(
        attendee => userData.friends?.includes(attendee)
      ).length || 0;
      score += Math.min(friendsAttending * 0.1, 0.4);
      
      return {
        ...event,
        score
      };
    });
    
    // Return top scored events
    return scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch (error) {
    console.error('Error getting event recommendations:', error);
    throw error;
  }
}

// Predict club trends
export async function predictClubTrends() {
  try {
    const clubsSnapshot = await getDocs(collection(db, 'clubs'));
    const clubs = clubsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate trend scores based on various metrics
    const clubTrends = clubs.map(club => {
      const memberGrowthRate = calculateGrowthRate(club.memberHistory || []);
      const eventAttendanceRate = calculateAttendanceRate(club.events || []);
      const engagementScore = calculateEngagementScore(club);
      
      return {
        id: club.id,
        name: club.name,
        trendScore: memberGrowthRate * 0.4 + eventAttendanceRate * 0.3 + engagementScore * 0.3,
        metrics: {
          memberGrowthRate,
          eventAttendanceRate,
          engagementScore
        }
      };
    });
    
    return clubTrends.sort((a, b) => b.trendScore - a.trendScore);
  } catch (error) {
    console.error('Error predicting club trends:', error);
    throw error;
  }
}

// Helper functions for trend analysis
function calculateGrowthRate(memberHistory) {
  if (memberHistory.length < 2) return 0;
  const recent = memberHistory[memberHistory.length - 1].count;
  const previous = memberHistory[memberHistory.length - 2].count;
  return (recent - previous) / previous;
}

function calculateAttendanceRate(events) {
  if (events.length === 0) return 0;
  const totalAttendance = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
  return totalAttendance / events.length;
}

function calculateEngagementScore(club) {
  const eventFrequency = (club.events?.length || 0) / 30; // Events per month
  const commentActivity = (club.comments?.length || 0) / (club.members?.length || 1);
  const socialMediaMentions = club.socialMetrics?.mentions || 0;
  
  return (eventFrequency * 0.4 + commentActivity * 0.3 + socialMediaMentions * 0.3);
} 