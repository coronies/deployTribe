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

const SAMPLE_OPPORTUNITIES = [
  {
    title: "Frontend Developer Intern",
    organization: "TechStart Inc.",
    organizationLogo: "",
    description: "Join our team to build modern web applications using React and TypeScript. Perfect for students looking to gain real-world experience in frontend development.",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    location: "San Francisco, CA",
    mode: "hybrid",
    compensation: "$20/hour",
    compensationType: "paid",
    commitment: "Part-time (20 hrs/week)",
    tags: ["Technology", "Web Development", "React", "Frontend"],
    requiredSkills: ["JavaScript", "React", "HTML/CSS"],
    accessibilityInfo: ["Remote work available", "Flexible hours"],
    ctaText: "Apply Now",
    ctaLink: "https://example.com/apply/frontend-intern",
    applicantCount: 0
  },
  {
    title: "UX Research Assistant",
    organization: "Design Studio Pro",
    organizationLogo: "",
    description: "Help conduct user research studies and analyze user behavior data. Great opportunity to learn UX research methodologies.",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    location: "Remote",
    mode: "remote",
    compensation: "Unpaid (Academic Credit Available)",
    compensationType: "unpaid",
    commitment: "Part-time (15 hrs/week)",
    tags: ["Design", "Research", "UX", "Psychology"],
    requiredSkills: ["Research Methods", "Data Analysis", "Communication"],
    accessibilityInfo: ["Fully remote", "Flexible schedule"],
    ctaText: "Learn More",
    ctaLink: "https://example.com/apply/ux-research",
    applicantCount: 0
  },
  {
    title: "Marketing Content Creator",
    organization: "StartupHub",
    organizationLogo: "",
    description: "Create engaging content for social media and blog posts. Help build brand awareness for emerging startups.",
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
    location: "Austin, TX",
    mode: "in-person",
    compensation: "$15/hour",
    compensationType: "paid",
    commitment: "Part-time (10-15 hrs/week)",
    tags: ["Marketing", "Content Creation", "Social Media", "Writing"],
    requiredSkills: ["Content Writing", "Social Media", "Adobe Creative Suite"],
    accessibilityInfo: ["Public transit accessible", "Parking available"],
    ctaText: "Apply Today",
    ctaLink: "https://example.com/apply/marketing-content",
    applicantCount: 0
  },
  {
    title: "Data Analysis Volunteer",
    organization: "Non-Profit Analytics",
    organizationLogo: "",
    description: "Help analyze data for local non-profit organizations. Make a real impact while building your data science portfolio.",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    location: "Boston, MA",
    mode: "hybrid",
    compensation: "Volunteer (Portfolio Building)",
    compensationType: "unpaid",
    commitment: "Part-time (8-12 hrs/week)",
    tags: ["Data Science", "Analytics", "Non-Profit", "Social Impact"],
    requiredSkills: ["Python", "SQL", "Data Visualization", "Statistics"],
    accessibilityInfo: ["Hybrid work model", "Mentorship provided"],
    ctaText: "Join Us",
    ctaLink: "https://example.com/apply/data-volunteer",
    applicantCount: 0
  },
  {
    title: "Mobile App Development Intern",
    organization: "AppCraft Solutions",
    organizationLogo: "",
    description: "Work on cutting-edge mobile applications for iOS and Android. Learn from experienced developers in a collaborative environment.",
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days from now
    location: "Seattle, WA",
    mode: "in-person",
    compensation: "$22/hour",
    compensationType: "paid",
    commitment: "Full-time (40 hrs/week) - Summer",
    tags: ["Technology", "Mobile Development", "iOS", "Android"],
    requiredSkills: ["Swift", "Kotlin", "React Native", "Mobile UI/UX"],
    accessibilityInfo: ["Mentorship program", "Learning stipend provided"],
    ctaText: "Apply Now",
    ctaLink: "https://example.com/apply/mobile-intern",
    applicantCount: 0
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

export async function seedOpportunities() {
  try {
    console.log('Starting to seed opportunities...');
    const opportunitiesCollection = collection(db, 'opportunities');
    
    for (const opportunity of SAMPLE_OPPORTUNITIES) {
      const docRef = await addDoc(opportunitiesCollection, {
        ...opportunity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Added opportunity: ${opportunity.title} with ID: ${docRef.id}`);
    }
    
    console.log('Successfully seeded all opportunities!');
  } catch (error) {
    console.error('Error seeding opportunities:', error);
    throw error;
  }
}

export async function seedAllData() {
  try {
    await seedClubs();
    await seedOpportunities();
    console.log('Successfully seeded all data!');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
} 