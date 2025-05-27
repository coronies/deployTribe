# Tribe - Student Club Networking Platform

## 📋 Project Description

**Tribe** is a comprehensive student networking platform designed to connect university students with clubs, events, and opportunities that match their interests and career goals. The platform features intelligent matching algorithms, event management, profile customization, and real-time recommendations to help students build meaningful connections and enhance their university experience.

## 🚀 Key Features

### 🎯 **Smart Matching System**

- Intelligent algorithm that matches students with relevant clubs and opportunities
- Personalized recommendations based on interests, skills, and academic background
- Similarity scoring for finding like-minded students

### 👤 **Enhanced Profile Management**

- Customizable user profiles with profile picture upload/management
- Resume upload and download functionality
- Social media integration with modern icon support
- Skills and interests tracking
- Academic information management

### 🎪 **Club Management**

- Comprehensive club profiles with detailed information
- Club dashboard for administrators
- Member management and application processing
- Internal club communication tools

### 📅 **Event System**

- Event creation and management tools
- Virtual event support
- Calendar integration
- RSVP and attendance tracking
- Event recommendations

### 🔍 **Discovery & Search**

- Advanced search functionality for clubs and events
- Filter by interests, categories, and preferences
- Trending and popular content sections

### 🎮 **Interactive Elements**

- Onboarding quiz for initial preference setting
- Gamification elements with badges and achievements
- Real-time notifications and updates

## 🛠️ Technology Stack

### **Frontend**

- **React 18.3.1** - Modern UI library with hooks and functional components
- **React Router DOM 6.28.0** - Client-side routing and navigation
- **React Icons 4.12.0** - Comprehensive icon library
- **React Calendar 5.1.0** - Interactive calendar component
- **React Select 5.8.3** - Enhanced select components

### **Backend & Database**

- **Firebase 10.8.0** - Backend-as-a-Service platform
  - **Firestore** - NoSQL document database
  - **Firebase Auth** - Authentication service
  - **Firebase Storage** - File storage for images and documents
  - **Firebase Hosting** - Web hosting service

### **Development Tools**

- **React Scripts 5.0.1** - Build tools and development server
- **Create React App** - Project bootstrapping
- **ESLint** - Code linting and quality assurance

### **Additional Libraries**

- **Axios 1.7.7** - HTTP client for API requests
- **Web Vitals 2.1.4** - Performance monitoring

## 📦 Dependencies

```json
{
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.7.7",
    "firebase": "^10.8.0",
    "react": "^18.3.1",
    "react-calendar": "^5.1.0",
    "react-dom": "^18.3.1",
    "react-icons": "^4.12.0",
    "react-router-dom": "^6.28.0",
    "react-scripts": "5.0.1",
    "react-select": "^5.8.3",
    "web-vitals": "^2.1.4"
  }
}
```

## 🚦 Getting Started

### **Prerequisites**

- **Node.js** (version 14.0 or higher)
- **npm** or **yarn** package manager
- **Firebase** account and project setup
- **Git** for version control

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/rafayb28/Tribe.git
   cd tribe
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Firebase Setup**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage services
   - Copy your Firebase configuration
   - Update `src/firebase/config.js` with your Firebase credentials

4. **Environment Configuration**
   - Create a `.env` file in the root directory
   - Add your Firebase configuration variables:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### **Development**

1. **Start the development server**

   ```bash
   npm start
   ```

   The application will open at `http://localhost:3001`

2. **Start Firebase Emulators (Optional)**
   ```bash
   firebase emulators:start
   ```
   - Emulator UI: `http://127.0.0.1:4000/`
   - Authentication: `127.0.0.1:9099`
   - Firestore: `127.0.0.1:8080`
   - Storage: `127.0.0.1:9199`
   - Hosting: `127.0.0.1:5002`

### **Building for Production**

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### **Deployment**

```bash
firebase deploy
```

## 📁 Project Structure

```
tribe/
├── public/                 # Static files
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── Profile.js     # Enhanced profile management
│   │   ├── ClubDashboard.js # Club management
│   │   ├── Events.js      # Event system
│   │   ├── Quiz.js        # Onboarding quiz
│   │   └── ...           # Other components
│   ├── contexts/         # React contexts
│   │   └── AuthContext.js # Authentication context
│   ├── firebase/         # Firebase configuration
│   │   └── config.js     # Firebase setup
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── styles/          # CSS stylesheets
│   ├── utils/           # Utility functions
│   └── App.js           # Main application component
├── firebase.json        # Firebase configuration
├── firestore.rules     # Firestore security rules
├── storage.rules       # Storage security rules
└── package.json        # Project dependencies
```

## 🔧 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (irreversible)

## 🔒 Firebase Security Rules

The project includes security rules for:

- **Firestore**: Secure database access patterns
- **Storage**: File upload and access permissions

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with responsive layouts
- **Modern Styling**: Contemporary design with smooth animations
- **Loading States**: Interactive loading indicators and spinners
- **Error Handling**: Comprehensive error messages and validation
- **Accessibility**: ARIA labels and keyboard navigation support

## 🔄 State Management

- **React Context**: Global state management for authentication
- **Local State**: Component-level state for UI interactions
- **Firebase Integration**: Real-time data synchronization

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 👥 Authors

- **Development Team** - Initial work and ongoing development

## 🐛 Known Issues

- Firebase emulator warnings related to deprecated methods (non-critical)
- ESLint warnings for unused imports in some components

## 🔮 Future Enhancements

- Mobile application development
- Advanced analytics dashboard
- Machine learning-powered recommendations
- Integration with university systems
- Real-time chat functionality
- Advanced notification system

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for the student community**
