import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Scenarios from './pages/Scenarios';
import Session from './pages/Session';
import Report from './pages/Report';
import Leaderboard from './pages/Leaderboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('rageroom_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rageroom_token');
    localStorage.removeItem('rageroom_user');
    setUser(null);
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route 
            path="/" 
            element={<Landing user={user} />} 
          />
          <Route 
            path="/auth" 
            element={!user ? <Auth setUser={setUser} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} logout={handleLogout} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/scenarios" 
            element={user ? <Scenarios user={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/session" 
            element={user ? <Session user={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/report/:sessionId" 
            element={user ? <Report user={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/leaderboard" 
            element={<Leaderboard />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
