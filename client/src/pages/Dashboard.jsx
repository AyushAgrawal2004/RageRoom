import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard({ user, logout }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5005/api/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessions(res.data);
      } catch (err) {
        console.error('Failed to fetch sessions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome, {user?.username}</h1>
            <p className="text-slate-500 mt-1">Review your past performance or start a new simulation.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/chat')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition"
            >
              + Start Training
            </button>
            <button 
              onClick={logout}
              className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </header>

        <section>
          <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Your Report Cards</h2>
          
          {loading ? (
            <p className="text-slate-500">Loading history...</p>
          ) : sessions.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
              You haven't completed any training sessions yet. Click "Start Training" to begin!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sessions.map(s => (
                <div key={s._id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-slate-800">{s.personaUsed}</span>
                    <span className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {s.reportCard ? (
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-slate-500">Score: </span>
                        <span className={'font-bold ' + (s.reportCard.overallScore >= 70 ? 'text-green-600' : 'text-red-600')}>
                          {s.reportCard.overallScore}/100
                        </span>
                      </div>
                      <button 
                        onClick={() => navigate(`/report/${s.sessionId}`)}
                        className="text-blue-600 text-sm font-semibold hover:underline"
                      >
                        View Report &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="mt-auto pt-4 border-t border-slate-100 text-sm text-slate-400 italic">
                      Incomplete or no report card generated.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
