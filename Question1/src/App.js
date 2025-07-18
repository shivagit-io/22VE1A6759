import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ShortenPage from './pages/ShortenPage';
import RedirectHandler from './pages/RedirectHandler';
import StatsPage from './pages/StatsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/shorten" replace />} />
      <Route path="/shorten" element={<ShortenPage />} />
      <Route path="/:shortcode" element={<RedirectHandler />} />
      <Route path="/stats" element={<StatsPage />} />
    </Routes>
  );
}

export default App;
