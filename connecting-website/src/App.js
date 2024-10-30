import React from 'react';
import Navbar from './components/Navbar';
import BasicInfo from './components/BasicInfo';
import Overview from './components/Overview';
import Events from './components/Events';
import FAQ from './components/FAQ';
import Demographics from './components/Demographics';
import Officers from './components/Officers';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <header className="header">
        <h1>Organization Name</h1>
        <div className="tags">
          <span className="tag">Tag Info</span>
          <span className="tag">Tag Info</span>
          <span className="tag">Tag Info</span>
        </div>
      </header>
      <div className="content">
        <BasicInfo />
        <Overview />
        <Events />
        <FAQ />
        <Demographics />
        <Officers />
      </div>
    </div>
  );
}

export default App;
