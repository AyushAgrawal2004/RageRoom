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
        const token = localStorage.getItem('rageroom_token');
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
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-5xl mx-auto animate-slide-up">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-[32px] leading-[1.2] font-semibold text-[#111111] tracking-[-0.02em]">Welcome, {user?.username}</h1>
            <p className="text-[#6B6B6B] mt-2 text-[15px]">Review your past performance or start a new simulation.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate('/chat')}
              className="flex-1 md:flex-none px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl shadow-[0_2px_4px_rgba(79,70,229,0.1)] transition-all duration-200 active:scale-[0.98]"
            >
              Start Training
            </button>
            <button 
              onClick={logout}
              className="px-6 py-2.5 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#111111] font-medium rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 active:scale-[0.98]"
            >
              Logout
            </button>
          </div>
        </header>

        <section>
          <h2 className="text-[20px] font-semibold text-[#111111] mb-6 tracking-[-0.01em]">Your Report Cards</h2>
          
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] h-[140px] flex flex-col justify-between">
                  <div className="skeleton h-5 w-2/3 rounded"></div>
                  <div className="skeleton h-4 w-1/3 rounded"></div>
                  <div className="skeleton h-8 w-full rounded mt-4"></div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white p-12 rounded-[16px] border border-dashed border-[#E5E7EB] text-center">
              <p className="text-[#6B6B6B] text-[15px]">You haven't completed any training sessions yet.</p>
              <button 
                onClick={() => navigate('/chat')}
                className="mt-4 px-5 py-2 text-[var(--color-accent)] font-medium bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Start your first session
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map(s => (
                <div key={s._id} className="bg-white p-6 rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer border border-transparent hover:border-[#E5E7EB]" onClick={() => s.reportCard && navigate(`/report/${s.sessionId}`)}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-medium text-[#111111] leading-tight">{s.personaUsed}</span>
                    <span className="text-[12px] text-[#9CA3AF] whitespace-nowrap ml-3">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {s.reportCard ? (
                    <div className="mt-auto pt-4 border-t border-[#F3F4F6] flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded-full text-[12px] font-medium ${
                          s.reportCard.overallScore >= 70 ? 'bg-emerald-50 text-emerald-700' : 
                          s.reportCard.overallScore >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          Score: {s.reportCard.overallScore}/100
                        </div>
                      </div>
                      <span className="text-[var(--color-accent)] text-[13px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View &rarr;
                      </span>
                    </div>
                  ) : (
                    <div className="mt-auto pt-4 border-t border-[#F3F4F6] text-[13px] text-[#9CA3AF]">
                      Incomplete session
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
