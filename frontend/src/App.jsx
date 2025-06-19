import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadTest from './upload';
import DonateBlood from './donateBlood';
import RequestAmbulance from './requestAmbulance';
import './App.css';
import AuthPage from './pages/AuthPage';
import NavPage from './pages/NavPage';

function App() {
  return (
    <Router>
      <div>
      
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/nav" element={<NavPage />} />
          <Route path="/upload" element={<UploadTest />} />
          <Route path="/ambulance" element={<RequestAmbulance />} />
          <Route path="/blood" element={<DonateBlood />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;