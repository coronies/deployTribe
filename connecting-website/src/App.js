import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClubProfile from './clubprofile/ClubProfile';
import SearchPage from './bestmatch/SearchPage';
import ClubPOV from './clubpov/ClubPOV';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClubProfile />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/clubpov" element={<ClubPOV />} />
      </Routes>
    </Router>
  );
}

export default App;
