import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const SAMPLE_CLUBS = [
  {
    name: "Web Development Club",
    description: "Learn modern web development technologies and build real projects",
    tags: ["Technology:Web Development", "Technology:Software Development"],
    commitmentLevel: "Standard",
    experienceLevel: "Intermediate",
    meetingTimes: [
      { day: "monday", startTime: "16:00", endTime: "18:00" },
      { day: "wednesday", startTime: "16:00", endTime: "18:00" }
    ],
    university: "sample_university"
  },
  {
    name: "Mobile App Developers",
    description: "Create innovative mobile applications for iOS and Android",
    tags: ["Technology:Mobile Development", "Technology:Software Development"],
    commitmentLevel: "Dedicated",
    experienceLevel: "Advanced",
    meetingTimes: [
      { day: "tuesday", startTime: "17:00", endTime: "19:00" },
      { day: "thursday", startTime: "17:00", endTime: "19:00" }
    ],
    university: "sample_university"
  },
  {
    name: "UI/UX Design Club",
    description: "Explore user interface and experience design principles",
    tags: ["Technology:Web Development", "Arts:Design"],
    commitmentLevel: "Light",
    experienceLevel: "Beginner",
    meetingTimes: [
      { day: "friday", startTime: "15:00", endTime: "17:00" }
    ],
    university: "sample_university"
  },
  {
    name: "Data Science Society",
    description: "Dive into data analysis, machine learning, and AI",
    tags: ["Technology:Data Science", "Technology:AI"],
    commitmentLevel: "Standard",
    experienceLevel: "Intermediate",
    meetingTimes: [
      { day: "monday", startTime: "18:00", endTime: "20:00" },
      { day: "wednesday", startTime: "18:00", endTime: "20:00" }
    ],
    university: "sample_university"
  },
  {
    name: "Game Development Club",
    description: "Create games using modern engines and technologies",
    tags: ["Technology:Game Development", "Technology:Software Development"],
    commitmentLevel: "Standard",
    experienceLevel: "Intermediate",
    meetingTimes: [
      { day: "tuesday", startTime: "16:00", endTime: "18:00" },
      { day: "thursday", startTime: "16:00", endTime: "18:00" }
    ],
    university: "sample_university"
  }
];

export async function seedClubs() {
  try {
    console.log('Starting to seed clubs...');
    const clubsCollection = collection(db, 'clubs');
    
    for (const club of SAMPLE_CLUBS) {
      const docRef = await addDoc(clubsCollection, {
        ...club,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [],
        events: []
      });
      console.log(`Added club: ${club.name} with ID: ${docRef.id}`);
    }
    
    console.log('Successfully seeded all clubs!');
  } catch (error) {
    console.error('Error seeding clubs:', error);
    throw error;
  }
} 