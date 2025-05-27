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
import SetupRoute from './components/SetupRoute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="app">
            <Header />
            <Routes>
              {/* Public routes that don't need setup check */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes that require setup check */}
              <Route path="/" element={<SetupRoute><Landing /></SetupRoute>} />
              <Route path="/quiz" element={<SetupRoute><Quiz /></SetupRoute>} />
              <Route path="/clubs" element={<SetupRoute><Clubs /></SetupRoute>} />
              <Route path="/clubs/:clubId" element={<SetupRoute><ClubDetails /></SetupRoute>} />
              <Route path="/events" element={<SetupRoute><Events /></SetupRoute>} />
              <Route path="/opportunities" element={<SetupRoute><Opportunities /></SetupRoute>} />
              <Route path="/about" element={<SetupRoute><About /></SetupRoute>} />
              <Route path="/how-it-works" element={<SetupRoute><HowItWorks /></SetupRoute>} />
              <Route path="/club-setup" element={<SetupRoute><ClubSetup /></SetupRoute>} />
              <Route path="/student-dashboard" element={<SetupRoute><StudentDashboard /></SetupRoute>} />
              <Route path="/club-dashboard" element={<SetupRoute><ClubDashboard /></SetupRoute>} />
              <Route path="/profile" element={<SetupRoute><Profile /></SetupRoute>} />
              <Route path="/my-clubs" element={<SetupRoute><MyClubs /></SetupRoute>} />
              <Route path="/my-events" element={<SetupRoute><MyEvents /></SetupRoute>} />
              <Route path="/manage-events" element={<SetupRoute><ManageEvents /></SetupRoute>} />
              <Route path="/test" element={<SetupRoute><FirebaseTest /></SetupRoute>} />
              <Route path="/test-club" element={<SetupRoute><TestClub /></SetupRoute>} />
              <Route path="/seed" element={<SetupRoute><SeedData /></SetupRoute>} />
              <Route path="/admin" element={<SetupRoute><AdminTools /></SetupRoute>} />
              <Route path="/matching" element={<SetupRoute><Matching /></SetupRoute>} />
              
              {/* Management Routes */}
              <Route path="/manage" element={<SetupRoute><ManagementDashboard /></SetupRoute>} />
              <Route path="/manage/opportunities/create" element={<SetupRoute><CreateOpportunity /></SetupRoute>} />
              <Route path="/manage/events/create" element={<SetupRoute><CreateEvent /></SetupRoute>} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
