import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClubProfile from './clubprofile/ClubProfile';
import SearchPage from './bestmatch/SearchPage';
import ClubPOV from './clubpov/ClubPOV';
import Quiz from './quiz/Quiz';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClubProfile />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/clubpov" element={<ClubPOV />} />
        <Route path="/quiz" element={<Quiz />}/>
      </Routes>
    </Router>
  );
}

export default App;
