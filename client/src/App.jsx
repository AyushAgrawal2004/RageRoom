import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Report from './pages/Report';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={!user ? <Auth setUser={setUser} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} logout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/chat" 
          element={user ? <Chat user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/report/:sessionId" 
          element={user ? <Report /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
