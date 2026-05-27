import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MenuPage from './pages/MenuPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import WelcomePage from './pages/WelcomePage';
import GameModePage from './pages/GameModePage';
import MatchmakingPage from './pages/MatchmakingPage';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#02030a] text-white">
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={user ? <Navigate to="/menu" /> : <LoginPage setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/menu" /> : <RegisterPage setUser={setUser} />} />
          <Route path="/menu" element={!user ? <Navigate to="/login" /> : <MenuPage user={user} setUser={setUser} />} />
          <Route path="/profile" element={!user ? <Navigate to="/login" /> : <ProfilePage user={user} setUser={setUser} />} />
          <Route path="/game-mode" element={!user ? <Navigate to="/login" /> : <GameModePage user={user} />} />
          <Route path="/matchmaking" element={!user ? <Navigate to="/login" /> : <MatchmakingPage user={user} />} />
          <Route path="/game" element={!user ? <Navigate to="/login" /> : <GamePage user={user} />} />
          <Route path="/" element={<Navigate to="/welcome" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
