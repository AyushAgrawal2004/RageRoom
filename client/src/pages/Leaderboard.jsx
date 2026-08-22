import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Zap, Trophy, Medal, ArrowLeft } from 'lucide-react';

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/leaderboard`);
        setLeaders(res.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-amber-100 pb-20">
      
      {/* Navbar */}
      <nav className="sticky top-0 inset-x-0 bg-white/80 backdrop-blur-xl z-50 border-b border-slate-200/60">
        <div className="max-w-[800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-[#111] p-1.5 rounded-lg shadow-sm">
              <Zap size={18} fill="white" stroke="none" />
            </div>
            <span className="font-bold text-xl tracking-tight text-black">RageRoom</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-slate-600 hover:text-black flex items-center gap-1">
            <ArrowLeft size={16} /> Dashboard
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-[800px] mx-auto px-6 pt-16 pb-12 text-center animate-slide-up">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_10px_40px_rgba(245,158,11,0.3)]">
          <Trophy size={40} className="text-white" fill="currentColor" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#111111] mb-4">Global Leaderboard</h1>
        <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
          The best de-escalators on the platform. Ranked by the highest overall session scores on global personas.
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-[800px] mx-auto px-6">
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
          
          <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-4">User</div>
            <div className="col-span-4">Persona Defeated</div>
            <div className="col-span-2 text-right">Score</div>
          </div>

          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-full h-12 bg-slate-50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : leaders.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-medium">No sessions recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leaders.map((session, index) => (
                <div key={session._id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50/50 transition-colors">
                  
                  {/* Rank */}
                  <div className="col-span-2 flex justify-center">
                    {index === 0 ? <Medal size={28} className="text-amber-400" fill="currentColor" /> :
                     index === 1 ? <Medal size={28} className="text-slate-300" fill="currentColor" /> :
                     index === 2 ? <Medal size={28} className="text-amber-700" fill="currentColor" /> :
                     <span className="text-lg font-bold text-slate-400">#{index + 1}</span>}
                  </div>
                  
                  {/* User */}
                  <div className="col-span-4 font-bold text-slate-900 text-[15px]">
                    {session.userId?.username || 'Anonymous User'}
                  </div>
                  
                  {/* Persona */}
                  <div className="col-span-4 text-sm font-semibold text-slate-500">
                    {session.personaUsed}
                  </div>
                  
                  {/* Score */}
                  <div className="col-span-2 text-right flex justify-end">
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full font-black text-sm">
                      {session.reportCard.overallScore}
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
