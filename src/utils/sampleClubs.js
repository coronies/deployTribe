import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const SAMPLE_CLUBS = [
  {
    name: "Software Development Club",
    description: "A community of passionate developers working on exciting projects",
    tags: ["Technology:Software Development", "Technology:Web Development"],
    commitmentLevel: "Standard",
    experienceLevel: "Intermediate",
    meetingTimes: [
      { day: "Monday", startTime: "18:00", endTime: "20:00" },
      { day: "Wednesday", startTime: "18:00", endTime: "20:00" }
    ]
  },
  {
    name: "Web Design & Art Club",
    description: "Combining creativity with technology",
    tags: ["Technology:Web Development", "Technology:Art", "Design:UI/UX"],
    commitmentLevel: "Light",
    experienceLevel: "Beginner",
    meetingTimes: [
      { day: "Tuesday", startTime: "17:00", endTime: "19:00" }
    ]
  },
  {
    name: "Tech Innovation Hub",
    description: "Exploring cutting-edge technologies and their applications",
    tags: ["Technology:Software Development", "Technology:AI", "Innovation"],
    commitmentLevel: "Intensive",
    experienceLevel: "Advanced",
    meetingTimes: [
      { day: "Friday", startTime: "16:00", endTime: "19:00" }
    ]
  }
];

export const addSampleClubs = async () => {
  try {
    console.log('Starting to add sample clubs...');
    const clubsCollection = collection(db, 'clubs');
    
    for (const club of SAMPLE_CLUBS) {
      await addDoc(clubsCollection, club);
      console.log(`Added club: ${club.name}`);
    }
    
    console.log('Successfully added all sample clubs!');
  } catch (error) {
    console.error('Error adding sample clubs:', error);
  }
};

export default SAMPLE_CLUBS; 