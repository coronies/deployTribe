import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const opportunities = [
  {
    title: "Summer Research Program in AI Ethics",
    organization: "Tech Ethics Institute",
    organizationLogo: "https://via.placeholder.com/150?text=TEI",
    tags: ["Research", "AI", "Ethics"],
    description: "Join our 10-week summer research program exploring ethical implications of AI development. Work alongside leading researchers and contribute to cutting-edge discussions in AI ethics.",
    deadline: "2024-05-15",
    location: "Cambridge, MA",
    mode: "hybrid",
    compensation: "Paid - $6000 stipend",
    compensationType: "paid",
    commitment: "40 hrs/week",
    requiredSkills: ["AI/ML Knowledge", "Research Methods", "Critical Thinking"],
    applicantCount: 78,
    accessibilityInfo: ["Wheelchair accessible", "Screen reader support"],
    ctaText: "Apply Now",
    ctaLink: "/opportunities/ai-ethics"
  },
  {
    title: "Global Student Innovation Challenge",
    organization: "World Innovation Network",
    organizationLogo: "https://via.placeholder.com/150?text=WIN",
    tags: ["Competitions", "Innovation", "Technology"],
    description: "Present your innovative solutions to global challenges. Winners receive mentorship, funding, and networking opportunities with industry leaders.",
    deadline: "2024-06-30",
    location: "Virtual",
    mode: "virtual",
    compensation: "Prize pool $50,000",
    compensationType: "paid",
    commitment: "Flexible",
    requiredSkills: ["Problem Solving", "Innovation", "Presentation"],
    applicantCount: 245,
    accessibilityInfo: ["Virtual participation", "Closed captions"],
    ctaText: "Register Now",
    ctaLink: "/opportunities/innovation-challenge"
  },
  {
    title: "Community Education Leadership Program",
    organization: "EduReach Foundation",
    organizationLogo: "https://via.placeholder.com/150?text=ERF",
    tags: ["Leadership", "Education", "Volunteering"],
    description: "Lead educational initiatives in underserved communities. Develop leadership skills while making a real impact in education accessibility.",
    deadline: "2024-04-20",
    location: "Multiple Locations",
    mode: "in-person",
    compensation: "Course credit available",
    compensationType: "credit",
    commitment: "10 hrs/week",
    requiredSkills: ["Teaching", "Leadership", "Communication"],
    applicantCount: 56,
    accessibilityInfo: ["Flexible schedule", "Transportation provided"],
    ctaText: "Join Program",
    ctaLink: "/opportunities/edu-leadership"
  },
  {
    title: "Data Science Workshop Series",
    organization: "DataMinds Academy",
    organizationLogo: "https://via.placeholder.com/150?text=DMA",
    tags: ["Workshops", "Data Science", "Programming"],
    description: "Eight-week intensive workshop series covering data analysis, machine learning, and practical applications. Perfect for students looking to enter the field of data science.",
    deadline: "2024-05-01",
    location: "Online",
    mode: "virtual",
    compensation: "Free workshop series",
    compensationType: "unpaid",
    commitment: "4 hrs/week",
    requiredSkills: ["Basic Python", "Statistics", "Math"],
    applicantCount: 132,
    accessibilityInfo: ["Recorded sessions", "Flexible timing"],
    ctaText: "Enroll Now",
    ctaLink: "/opportunities/data-workshop"
  },
  {
    title: "Sustainable Design Internship",
    organization: "GreenTech Solutions",
    organizationLogo: "https://via.placeholder.com/150?text=GTS",
    tags: ["Internships", "Engineering", "Sustainability"],
    description: "Work on real-world sustainable design projects. Gain hands-on experience in green technology and sustainable engineering practices.",
    deadline: "2024-05-30",
    location: "San Francisco, CA",
    mode: "hybrid",
    compensation: "Paid - $25/hr",
    compensationType: "paid",
    commitment: "20 hrs/week",
    requiredSkills: ["CAD", "Sustainable Design", "Project Management"],
    applicantCount: 94,
    accessibilityInfo: ["Flexible hours", "Remote work options"],
    ctaText: "Apply Now",
    ctaLink: "/opportunities/green-internship"
  },
  {
    title: "Peer Tutoring Program",
    organization: "Academic Success Center",
    organizationLogo: "https://via.placeholder.com/150?text=ASC",
    tags: ["Volunteering", "Education", "Leadership"],
    description: "Help fellow students succeed in their academic journey. Develop teaching and leadership skills while making a difference in your community.",
    deadline: "2024-04-15",
    location: "Campus-wide",
    mode: "in-person",
    compensation: "Volunteer experience",
    compensationType: "unpaid",
    commitment: "5-10 hrs/week",
    requiredSkills: ["Subject Expertise", "Communication", "Patience"],
    applicantCount: 42,
    accessibilityInfo: ["Flexible scheduling", "Training provided"],
    ctaText: "Volunteer Now",
    ctaLink: "/opportunities/peer-tutoring"
  }
];

export const seedOpportunities = async () => {
  try {
    const opportunitiesRef = collection(db, 'opportunities');
    
    for (const opportunity of opportunities) {
      await addDoc(opportunitiesRef, {
        ...opportunity,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('Successfully seeded opportunities data!');
    return true;
  } catch (error) {
    console.error('Error seeding opportunities:', error);
    throw error;
  }
}; 