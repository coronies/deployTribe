import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';

// Mock data for demonstration - in production, this would come from the database
const sampleMembers = [
  {
    id: 'member1',
    fullName: 'Alex Johnson',
    major: 'Computer Science',
    graduationYear: 2025,
    bio: 'Full-stack developer passionate about building innovative solutions. Currently working on AI-powered applications and machine learning projects.',
    email: 'alex.johnson@university.edu',
    status: 'active',
    memberSince: new Date('2023-08-15'),
    lastActive: new Date(),
    socialLinks: {
      linkedin: 'https://linkedin.com/in/alexjohnson',
      github: 'https://github.com/alexjohnson'
    },
    socialLinksCount: 2,
    hasResume: true,
    isProfileComplete: true,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'member2',
    fullName: 'Sarah Chen',
    major: 'Data Science',
    graduationYear: 2024,
    bio: 'ML engineer with experience in deep learning and computer vision. Love working on challenging data problems and research projects.',
    email: 'sarah.chen@university.edu',
    status: 'active',
    memberSince: new Date('2023-09-01'),
    lastActive: new Date(Date.now() - 86400000), // 1 day ago
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahchen',
      github: 'https://github.com/sarahchen',
      portfolio: 'https://sarahchen.dev'
    },
    socialLinksCount: 3,
    hasResume: true,
    isProfileComplete: true,
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'member3',
    fullName: 'Marcus Williams',
    major: 'Software Engineering',
    graduationYear: 2023,
    bio: 'Recent graduate now working at Google. Still actively mentoring new members and contributing to open source projects.',
    email: 'marcus.williams@university.edu',
    status: 'alumni',
    memberSince: new Date('2022-08-20'),
    lastActive: new Date(Date.now() - 604800000), // 1 week ago
    socialLinks: {
      linkedin: 'https://linkedin.com/in/marcuswilliams',
      github: 'https://github.com/marcuswilliams'
    },
    socialLinksCount: 2,
    hasResume: true,
    isProfileComplete: true,
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'member4',
    fullName: 'Emily Rodriguez',
    major: 'Information Systems',
    graduationYear: 2025,
    bio: 'Cybersecurity enthusiast focusing on network security and ethical hacking. Passionate about protecting digital infrastructure.',
    email: 'emily.rodriguez@university.edu',
    status: 'inactive',
    memberSince: new Date('2023-01-15'),
    lastActive: new Date(Date.now() - 2592000000), // 1 month ago
    socialLinks: {
      linkedin: 'https://linkedin.com/in/emilyrodriguez'
    },
    socialLinksCount: 1,
    hasResume: false,
    isProfileComplete: true,
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'member5',
    fullName: 'David Park',
    major: 'Computer Engineering',
    graduationYear: 2024,
    bio: 'Hardware and software integration specialist. Working on IoT projects and embedded systems with a focus on sustainable technology.',
    email: 'david.park@university.edu',
    status: 'active',
    memberSince: new Date('2023-07-10'),
    lastActive: new Date(Date.now() - 43200000), // 12 hours ago
    socialLinks: {
      linkedin: 'https://linkedin.com/in/davidpark',
      github: 'https://github.com/davidpark',
      twitter: 'https://twitter.com/davidpark_dev'
    },
    socialLinksCount: 3,
    hasResume: true,
    isProfileComplete: true,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'member6',
    fullName: 'Jessica Thompson',
    major: 'Computer Science',
    graduationYear: 2022,
    bio: 'Senior Software Engineer at Microsoft. Alumni mentor and guest speaker. Specializes in cloud architecture and distributed systems.',
    email: 'jessica.thompson@university.edu',
    status: 'alumni',
    memberSince: new Date('2021-08-25'),
    lastActive: new Date(Date.now() - 1209600000), // 2 weeks ago
    socialLinks: {
      linkedin: 'https://linkedin.com/in/jessicathompson',
      github: 'https://github.com/jessicathompson',
      portfolio: 'https://jessicathompson.dev'
    },
    socialLinksCount: 3,
    hasResume: true,
    isProfileComplete: true,
    profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
  }
];

// Get all members of a specific club
export const getClubMembers = async (clubId) => {
  try {
    // For demonstration, return sample data
    // In production, this would query the actual database
    if (clubId === 'software-dev-club' || clubId === 'data-science-society') {
      return sampleMembers;
    }

    const membersQuery = query(
      collection(db, 'users'),
      where('joinedClubs', 'array-contains', clubId),
      orderBy('lastActive', 'desc')
    );
    
    const membersSnapshot = await getDocs(membersQuery);
    const members = [];
    
    membersSnapshot.forEach((doc) => {
      const data = doc.data();
      // Get profile image from localStorage if available
      const profileKey = `profile_image_${doc.id}`;
      const localProfileImage = localStorage.getItem(profileKey);
      
      members.push({
        id: doc.id,
        ...data,
        status: data.status || 'active', // Default to active if not set
        // Prioritize localStorage image for display
        profileImage: localProfileImage || data.profileImage || null
      });
    });
    
    return members;
  } catch (error) {
    console.error('Error fetching club members:', error);
    return sampleMembers; // Fallback to sample data
  }
};

// Get member data for a specific user
export const getMemberData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Get profile image from localStorage if available
      const profileKey = `profile_image_${userId}`;
      const localProfileImage = localStorage.getItem(profileKey);
      
      return {
        id: userDoc.id,
        ...data,
        // Prioritize localStorage image for display
        profileImage: localProfileImage || data.profileImage || null
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching member data:', error);
    return null;
  }
};

// Get all users with complete profiles (for general member displays)
export const getAllMembers = async () => {
  try {
    const membersQuery = query(
      collection(db, 'users'),
      where('isProfileComplete', '==', true),
      orderBy('lastActive', 'desc')
    );
    
    const membersSnapshot = await getDocs(membersQuery);
    const members = [];
    
    membersSnapshot.forEach((doc) => {
      const data = doc.data();
      // Get profile image from localStorage if available
      const profileKey = `profile_image_${doc.id}`;
      const localProfileImage = localStorage.getItem(profileKey);
      
      members.push({
        id: doc.id,
        ...data,
        // Prioritize localStorage image for display
        profileImage: localProfileImage || data.profileImage || null
      });
    });
    
    return members;
  } catch (error) {
    console.error('Error fetching all members:', error);
    return [];
  }
};

// Search members by name, major, or bio
export const searchMembers = async (searchTerm) => {
  try {
    // Note: This is a simple implementation. For production, you'd want to use
    // a more sophisticated search like Algolia or implement full-text search
    const allMembers = await getAllMembers();
    
    const filteredMembers = allMembers.filter(member => {
      const searchLower = searchTerm.toLowerCase();
      return (
        member.fullName?.toLowerCase().includes(searchLower) ||
        member.major?.toLowerCase().includes(searchLower) ||
        member.bio?.toLowerCase().includes(searchLower)
      );
    });
    
    return filteredMembers;
  } catch (error) {
    console.error('Error searching members:', error);
    return [];
  }
};

// Format member data for card display
export const formatMemberForCard = (member) => {
  if (!member) return null;
  
  return {
    id: member.id,
    name: member.fullName || member.displayName || 'Unknown Member',
    major: member.major || 'No major specified',
    graduationYear: member.graduationYear || null,
    bio: member.bio || 'No bio available',
    profileImage: member.profileImage,
    socialLinks: member.socialLinks || {},
    socialLinksCount: member.socialLinksCount || 0,
    hasResume: member.hasResume || false,
    memberSince: member.memberSince,
    lastActive: member.lastActive,
    isProfileComplete: member.isProfileComplete || false,
    email: member.email,
    status: member.status || 'active' // Add status field
  };
}; 