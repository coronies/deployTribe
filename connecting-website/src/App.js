import React from 'react';
import Navbar from './homepage/Navbar';
import BasicInfo from './homepage/BasicInfo';
import Overview from './homepage/Overview';
import Events from './homepage/Events';
import FAQ from './homepage/FAQ';
import Demographics from './homepage/Demographics';
import Officers from './homepage/Officers';
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
