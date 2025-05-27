import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';

// Badge definitions and requirements
const BADGES = {
  'early-adopter': {
    name: 'Early Adopter',
    description: 'One of the first users to join the platform',
    icon: '🌟'
  },
  'social-butterfly': {
    name: 'Social Butterfly',
    description: 'Connected with 5 or more clubs',
    icon: '🦋',
    requirement: (stats) => stats.clubsApplied >= 5
  },
  'event-enthusiast': {
    name: 'Event Enthusiast',
    description: 'Attended 10 or more events',
    icon: '🎉',
    requirement: (stats) => stats.eventsAttended >= 10
  },
  'quiz-master': {
    name: 'Quiz Master',
    description: 'Completed the matching quiz',
    icon: '🎯'
  },
  'club-connector': {
    name: 'Club Connector',
    description: 'Successfully matched with a club',
    icon: '🤝'
  }
};

// Update user statistics
export async function updateUserStats(userId, action) {
  const userRef = doc(db, 'users', userId);
  
  try {
    const updates = {};
    
    switch (action.type) {
      case 'APPLY_CLUB':
        updates['stats.clubsApplied'] = increment(1);
        break;
      case 'SEND_MESSAGE':
        updates['stats.messagesSent'] = increment(1);
        break;
      case 'ATTEND_EVENT':
        updates['stats.eventsAttended'] = increment(1);
        break;
      case 'COMPLETE_QUIZ':
        await awardBadge(userId, 'quiz-master');
        break;
      case 'MATCH_CLUB':
        await awardBadge(userId, 'club-connector');
        break;
      default:
        break;
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(userRef, updates);
      await checkAndAwardBadges(userId);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}

// Award a badge to a user
export async function awardBadge(userId, badgeId) {
  if (!BADGES[badgeId]) return;

  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      badges: arrayUnion(badgeId)
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
}

// Check and award badges based on user stats
async function checkAndAwardBadges(userId) {
  const userRef = doc(db, 'users', userId);
  
  try {
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const stats = userData.stats || {};
    const currentBadges = userData.badges || [];

    for (const [badgeId, badge] of Object.entries(BADGES)) {
      if (badge.requirement && 
          !currentBadges.includes(badgeId) && 
          badge.requirement(stats)) {
        await awardBadge(userId, badgeId);
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}

// Get badge details
export function getBadgeDetails(badgeId) {
  return BADGES[badgeId] || null;
}

// Get all badge definitions
export function getAllBadges() {
  return BADGES;
}

// Get user leaderboard
export async function getLeaderboard(category = 'eventsAttended', limit = 10) {
  try {
    const snapshot = await db.collection('users')
      .orderBy(`stats.${category}`, 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      score: doc.data().stats?.[category] || 0
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
} 