import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Report from './pages/Report';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rageroom_token');
    const storedUser = localStorage.getItem('rageroom_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rageroom_token');
    localStorage.removeItem('rageroom_user');
    setUser(null);
  };

  if (loading) return null;

  return (
    <Router>
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
          path="/chat" 
          element={user ? <Chat user={user} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/report/:sessionId" 
          element={user ? <Report /> : <Navigate to="/auth" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
