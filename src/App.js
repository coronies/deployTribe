import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import ClubSetup from './components/ClubSetup';
import StudentDashboard from './components/StudentDashboard';
import ClubDashboard from './components/ClubDashboard';
import Profile from './components/Profile';
import Landing from './components/Landing';
import Quiz from './components/Quiz';
import Events from './components/Events';
import Clubs from './components/Clubs';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import MyClubs from './components/MyClubs';
import MyEvents from './components/MyEvents';
import ManageEvents from './components/ManageEvents';
import LoadingScreen from './components/LoadingScreen';
import ClubCard from './components/ClubCard';
import FirebaseTest from './components/FirebaseTest';
import TestClub from './components/TestClub';
import SeedData from './components/SeedData';
import AdminTools from './components/AdminTools';
import Matching from './components/Matching';
import ClubDetails from './components/ClubDetails';
import Opportunities from './pages/Opportunities';
import ManagementDashboard from './components/ManagementDashboard';
import CreateOpportunity from './components/CreateOpportunity';
import CreateEvent from './components/CreateEvent';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="app">
            <Header />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/clubs/:clubId" element={<ClubDetails />} />
              <Route path="/events" element={<Events />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/club-setup" element={<ClubSetup />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/club-dashboard" element={<ClubDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-clubs" element={<MyClubs />} />
              <Route path="/my-events" element={<MyEvents />} />
              <Route path="/manage-events" element={<ManageEvents />} />
              <Route path="/test" element={<FirebaseTest />} />
              <Route path="/test-club" element={<TestClub />} />
              <Route path="/seed" element={<SeedData />} />
              <Route path="/admin" element={<AdminTools />} />
              <Route path="/matching" element={<Matching />} />
              
              {/* Management Routes */}
              <Route path="/manage" element={<ManagementDashboard />} />
              <Route path="/manage/opportunities/create" element={<CreateOpportunity />} />
              <Route path="/manage/events/create" element={<CreateEvent />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
