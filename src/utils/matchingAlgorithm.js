// Categories and weights for matching
export const CATEGORIES = {
  interests: {
    options: {
      Technology: {
        label: 'Technology',
        subtags: [
          'Software Development',
          'Web Development',
          'AI',
          'Cybersecurity',
          'Data Science',
          'Mobile Development',
          'Game Development',
          'Art'
        ]
      },
      Business: {
        label: 'Business',
        subtags: [
          'Entrepreneurship',
          'Marketing',
          'Finance',
          'Management',
          'Consulting',
          'Investment'
        ]
      },
      Arts: {
        label: 'Arts & Culture',
        subtags: [
          'Music',
          'Dance',
          'Photography',
          'Painting',
          'Theater',
          'Film',
          'Design',
          'Creative Writing'
        ]
      },
      Science: {
        label: 'Science',
        subtags: [
          'Physics',
          'Chemistry',
          'Biology',
          'Environmental Science',
          'Astronomy',
          'Mathematics'
        ]
      },
      Social: {
        label: 'Social Impact',
        subtags: [
          'Community Service',
          'Environmental',
          'Social Justice',
          'Education',
          'Healthcare',
          'Mental Health'
        ]
      }
    }
  },
  commitment: {
    weight: 0.15,
    options: [
      'Low (1-2 hrs/week)',
      'Medium (3-5 hrs/week)',
      'High (6+ hrs/week)'
    ]
  },
  experience: {
    weight: 0.15,
    options: [
      'Beginner Friendly',
      'Some Experience Required',
      'Advanced Skills Needed'
    ]
  },
  timeMatch: {
    weight: 0.35, // Increased weight for time matching
    slots: {
      monday: Array.from({length: 24}, (_, i) => i), // 0-23 hours
      tuesday: Array.from({length: 24}, (_, i) => i),
      wednesday: Array.from({length: 24}, (_, i) => i),
      thursday: Array.from({length: 24}, (_, i) => i),
      friday: Array.from({length: 24}, (_, i) => i),
      saturday: Array.from({length: 24}, (_, i) => i),
      sunday: Array.from({length: 24}, (_, i) => i)
    }
  }
};

// Helper function to convert time string to hour number (24-hour format)
export function timeStringToHour(timeString) {
  const [time, period] = timeString.toLowerCase().split(' ');
  let [hours] = time.split(':').map(Number);
  
  if (period === 'pm' && hours !== 12) {
    hours += 12;
  } else if (period === 'am' && hours === 12) {
    hours = 0;
  }
  
  return hours;
}

// Helper function to check if two time ranges overlap
export const doTimeRangesOverlap = (range1, range2) => {
  const [start1, end1] = range1.split(' - ').map(time => {
    const [hours, minutes] = time.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  });
  
  const [start2, end2] = range2.split(' - ').map(time => {
    const [hours, minutes] = time.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  });

  return start1 < end2 && end1 > start2;
};

// Calculate match score between student and club
export const calculateMatchScore = (quizResults, club) => {
  if (!quizResults || !club) return { total: 0, details: {} };

  console.log('🔍 === Starting Match Calculation for Club:', club.name, '===');
  console.log('📊 Quiz Results:', quizResults);
  console.log('🏛️ Club Data:', club);
  
  const matchDetails = {
    interestMatch: 0,
    commitmentMatch: 0,
    experienceMatch: 0,
    availabilityMatch: 0
  };

  // Interest match (40%)
  const interestWeight = 0.4;
  const userTags = Array.isArray(quizResults.tags) 
    ? quizResults.tags.map(tag => tag.toLowerCase())
    : [];
  
  // Handle different club tag formats
  let clubTags = [];
  if (club.tags && Array.isArray(club.tags)) {
    clubTags = club.tags.map(tag => {
      // Handle "Category:Subtag" format
      if (typeof tag === 'string' && tag.includes(':')) {
        return tag.split(':')[1].toLowerCase();
      }
      return String(tag).toLowerCase();
    });
  } else if (club.displayedTags && Array.isArray(club.displayedTags)) {
    clubTags = club.displayedTags.map(tag => String(tag).toLowerCase());
  }
  
  console.log('🏷️ User Tags:', userTags);
  console.log('🏷️ Club Tags:', clubTags);
  
  const matchingTags = userTags.filter(userTag => 
    clubTags.some(clubTag => {
      const normalizedUserTag = String(userTag).toLowerCase();
      const normalizedClubTag = String(clubTag).toLowerCase();
      return normalizedClubTag.includes(normalizedUserTag) || 
             normalizedUserTag.includes(normalizedClubTag);
    })
  );
  
  matchDetails.interestMatch = clubTags.length > 0 
    ? (matchingTags.length / Math.max(clubTags.length, userTags.length)) * 100 
    : 0;
  console.log('🎯 Interest Match:', matchDetails.interestMatch + '%', 'Matching tags:', matchingTags);

  // Commitment match (25%)
  const commitmentWeight = 0.25;
  
  // Map quiz commitment levels to numbers
  const quizCommitmentMap = {
    'Light': 1,
    'Moderate': 2, 
    'Standard': 3,
    'Dedicated': 4,
    'Intensive': 5
  };
  
  // Map club commitment levels to numbers
  const clubCommitmentMap = {
    'Light': 1,
    'Moderate': 2,
    'Standard': 3, 
    'Dedicated': 4,
    'Intensive': 5
  };
  
  const userCommitment = quizCommitmentMap[quizResults.commitmentLevel] || 3;
  const clubCommitment = clubCommitmentMap[club.commitmentLevel] || 3;
  
  matchDetails.commitmentMatch = Math.max(0, (1 - Math.abs(userCommitment - clubCommitment) / 4)) * 100;
  console.log('⏰ Commitment Match:', matchDetails.commitmentMatch + '%', 
    `User: ${quizResults.commitmentLevel}(${userCommitment}) vs Club: ${club.commitmentLevel}(${clubCommitment})`);

  // Experience match (20%)
  const experienceWeight = 0.2;
  
  // Map quiz experience levels to numbers
  const quizExperienceMap = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3
  };
  
  // Map club experience levels to numbers  
  const clubExperienceMap = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3
  };
  
  const userExperience = quizExperienceMap[quizResults.experienceLevel] || 1;
  const clubExperience = clubExperienceMap[club.experienceLevel] || 1;
  
  // Give full points if user experience >= club requirement, partial if less
  matchDetails.experienceMatch = userExperience >= clubExperience ? 100 : 
    Math.max(0, (userExperience / clubExperience) * 70); // 70% max if under-qualified
  console.log('📚 Experience Match:', matchDetails.experienceMatch + '%',
    `User: ${quizResults.experienceLevel}(${userExperience}) vs Club: ${club.experienceLevel}(${clubExperience})`);

  // Time availability match (15%)
  const availabilityWeight = 0.15;
  const userAvailability = quizResults.availability || {};
  
  // Handle different club meeting time formats
  let clubMeetingTimes = {};
  if (club.meetingTimes && Array.isArray(club.meetingTimes)) {
    // Convert array format to object format
    club.meetingTimes.forEach(meeting => {
      if (meeting && meeting.day) {
        const day = meeting.day.toLowerCase();
        const timeSlot = `${meeting.startTime} - ${meeting.endTime}`;
        if (!clubMeetingTimes[day]) {
          clubMeetingTimes[day] = [];
        }
        clubMeetingTimes[day].push(timeSlot);
      }
    });
  } else if (club.meetingTimes && typeof club.meetingTimes === 'object') {
    clubMeetingTimes = club.meetingTimes;
  }
  
  let availabilityScore = 0;
  let totalTimeSlots = 0;
  
  Object.keys(clubMeetingTimes).forEach(day => {
    const clubTimes = clubMeetingTimes[day] || [];
    const userTimes = userAvailability[day] || [];
    
    clubTimes.forEach(clubTime => {
      if (clubTime) {
        totalTimeSlots++;
        // Check if user has any availability on this day
        if (userTimes.length > 0) {
          // For now, give partial credit if user is available on the same day
          availabilityScore += 0.5;
          
          // Check for exact time matches
          if (userTimes.includes(clubTime)) {
            availabilityScore += 0.5; // Full point for exact match
          }
        }
      }
    });
  });
  
  matchDetails.availabilityMatch = totalTimeSlots > 0 
    ? Math.min(100, (availabilityScore / totalTimeSlots) * 100)
    : 100; // If no meeting times specified, assume flexible
  console.log('📅 Availability Match:', matchDetails.availabilityMatch + '%');

  // Calculate total match score
  const totalScore = Math.round(
    (matchDetails.interestMatch * interestWeight) +
    (matchDetails.commitmentMatch * commitmentWeight) +
    (matchDetails.experienceMatch * experienceWeight) +
    (matchDetails.availabilityMatch * availabilityWeight)
  );

  console.log('🎉 Total Match Score:', totalScore + '%');
  console.log('=== End Match Calculation ===\n');

  return {
    total: Math.max(0, Math.min(100, totalScore)), // Ensure score is between 0-100
    details: matchDetails
  };
};

// Get recommended clubs for a student
export function getRecommendedClubs(studentProfile, clubs) {
  console.log('\n🔄 === Starting Club Recommendations ===');
  console.log('📊 Number of Clubs to Match:', clubs.length);
  console.log('👤 Student Profile:', studentProfile);

  const recommendations = clubs
    .map(club => {
      const matchDetails = calculateMatchScore(studentProfile, club);
      return {
        ...club,
        matchDetails
      };
    })
    .sort((a, b) => b.matchDetails.total - a.matchDetails.total);

  console.log('✨ Recommendations Generated:', recommendations.length);
  console.log('=== End Club Recommendations ===\n');

  return recommendations;
}

// Matching algorithm with university filtering
export const calculateMatch = (studentPreferences, club, weights = {
  interests: 0.35,
  timeCompatibility: 0.35,
  commitmentLevel: 0.15,
  experienceLevel: 0.15
}) => {
  // First check university match - if no match, return null
  if (studentPreferences.university !== club.university) {
    return null;
  }

  // Calculate interest match
  const interestScore = calculateInterestMatch(studentPreferences.interests, club.interests);

  // Calculate time compatibility
  const timeScore = calculateTimeCompatibility(studentPreferences.availability, club.meetingTimes);

  // Calculate commitment level match (scale of 1-5)
  const commitmentScore = 1 - Math.abs(studentPreferences.commitmentLevel - club.commitmentLevel) / 4;

  // Calculate experience level match (scale of 1-5)
  const experienceScore = 1 - Math.abs(studentPreferences.experienceLevel - club.experienceLevel) / 4;

  // Calculate weighted average
  const totalScore = (
    interestScore * weights.interests +
    timeScore * weights.timeCompatibility +
    commitmentScore * weights.commitmentLevel +
    experienceScore * weights.experienceLevel
  );

  return {
    overallMatch: totalScore,
    details: {
      interestMatch: interestScore,
      timeCompatibility: timeScore,
      commitmentMatch: commitmentScore,
      experienceMatch: experienceScore,
      university: studentPreferences.university
    }
  };
};

// Update the interest matching function to handle subtags
const calculateInterestMatch = (studentInterests, clubInterests) => {
  if (!studentInterests || !clubInterests || 
      studentInterests.length === 0 || clubInterests.length === 0) {
    return 0;
  }

  // Flatten student interests if they contain category:subtag format
  const flattenedStudentInterests = studentInterests.map(interest => {
    if (interest.includes(':')) {
      return interest.split(':')[1];
    }
    return interest;
  });

  // Flatten club interests if they contain category:subtag format
  const flattenedClubInterests = clubInterests.map(interest => {
    if (interest.includes(':')) {
      return interest.split(':')[1];
    }
    return interest;
  });

  const commonInterests = flattenedStudentInterests.filter(interest => 
    flattenedClubInterests.includes(interest)
  );

  return commonInterests.length / Math.max(flattenedStudentInterests.length, flattenedClubInterests.length);
};

// Helper function to calculate time compatibility
const calculateTimeCompatibility = (studentAvailability, clubMeetingTimes) => {
  if (!studentAvailability || !clubMeetingTimes || 
      Object.keys(studentAvailability).length === 0 || 
      clubMeetingTimes.length === 0) {
    return 0;
  }

  let compatibleSlots = 0;
  let totalClubSlots = 0;

  clubMeetingTimes.forEach(meeting => {
    const day = meeting.day.toLowerCase();
    const startHour = parseInt(meeting.startTime);
    const endHour = parseInt(meeting.endTime);

    if (studentAvailability[day]) {
      for (let hour = startHour; hour < endHour; hour++) {
        totalClubSlots++;
        if (studentAvailability[day].includes(hour)) {
          compatibleSlots++;
        }
      }
    }
  });

  return totalClubSlots > 0 ? compatibleSlots / totalClubSlots : 0;
}; 