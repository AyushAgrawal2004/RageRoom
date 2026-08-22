import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Zap, LayoutDashboard, BarChart3, Settings, LogOut, Plus, ChevronRight, Activity, Target, ShieldCheck, Clock, Award, ShieldAlert, Star } from 'lucide-react';

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
        // Sort sessions by date (newest first) if not already sorted
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSessions(sorted);
      } catch (err) {
        console.error('Failed to fetch sessions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Calculate Metrics
  const completedSessions = sessions.filter(s => s.reportCard);
  const totalSimulations = completedSessions.length;
  const avgScore = totalSimulations > 0 
    ? Math.round(completedSessions.reduce((acc, curr) => acc + (curr.reportCard.overallScore || 0), 0) / totalSimulations) 
    : 0;
  const highestScore = totalSimulations > 0 
    ? Math.max(...completedSessions.map(s => s.reportCard.overallScore || 0)) 
    : 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* Premium Sidebar Layout */}
      <aside className="w-[260px] bg-white border-r border-slate-200/60 fixed inset-y-0 left-0 z-10 flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center px-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-[#111] p-1.5 rounded-lg shadow-sm">
            <Zap size={18} fill="white" stroke="none" />
          </div>
          <span className="font-bold text-xl tracking-tight text-black ml-3">RageRoom</span>
        </div>
        
        {/* Navigation */}
        <nav className="px-4 flex-1 space-y-1.5 mt-4">
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 text-slate-900 font-semibold rounded-xl">
            <LayoutDashboard size={18} className="text-slate-700" />
            Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-not-allowed opacity-60">
            <BarChart3 size={18} />
            Analytics <span className="ml-auto text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-400">PRO</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-not-allowed opacity-60">
            <Settings size={18} />
            Settings
          </a>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 mb-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                {user?.username?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm truncate">{user?.username}</div>
                <div className="text-xs text-slate-500 font-medium truncate">Free Plan</div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] flex-1 p-12 max-w-[1200px] animate-slide-up">
        
        {/* Header */}
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#111111] mb-1">Dashboard</h1>
            <p className="text-slate-500 font-medium text-[15px]">Welcome back. Here is your training overview.</p>
          </div>
          <button 
            onClick={() => navigate('/chat')}
            className="bg-[#111] hover:bg-black text-white px-6 py-3 rounded-full font-semibold text-[15px] shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> New Simulation
          </button>
        </header>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Metric 1 */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target size={64} className="text-indigo-600 transform translate-x-4 -translate-y-4" />
            </div>
            <div className="text-slate-500 font-semibold text-sm mb-2 flex items-center gap-2">
              <Activity size={16} /> Total Simulations
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">
              {loading ? '-' : totalSimulations}
            </div>
          </div>
          
          {/* Metric 2 */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={64} className="text-emerald-600 transform translate-x-4 -translate-y-4" />
            </div>
            <div className="text-slate-500 font-semibold text-sm mb-2 flex items-center gap-2">
              <Award size={16} /> Average Score
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              {loading ? '-' : avgScore} <span className="text-lg text-slate-400 font-bold">/100</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-[#111] text-white p-6 rounded-[24px] shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <Star size={64} className="text-amber-400 transform translate-x-4 -translate-y-4" />
            </div>
            <div className="relative z-10 text-slate-400 font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" /> Highest Score
            </div>
            <div className="relative z-10 text-4xl font-black tracking-tight flex items-baseline gap-1">
              {loading ? '-' : highestScore} <span className="text-lg text-white/30 font-bold">/100</span>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Sessions</h2>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View all</button>
          </div>

          {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-full h-20 bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
                ))}
             </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-dashed border-slate-300 p-16 text-center shadow-sm">
               <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <ShieldAlert size={32} className="text-indigo-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No simulations yet</h3>
               <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
                 You haven't completed any training sessions. Jump in and test your de-escalation skills.
               </p>
               <button 
                 onClick={() => navigate('/chat')}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
               >
                 Start Your First Session
               </button>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden">
               {sessions.map((s, index) => (
                  <div 
                    key={s._id} 
                    onClick={() => s.reportCard && navigate(`/report/${s.sessionId}`)}
                    className={`group flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer ${index !== sessions.length - 1 ? 'border-b border-slate-100' : ''} ${!s.reportCard && 'opacity-60 pointer-events-none'}`}
                  >
                    
                    {/* Left: Persona & Date */}
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl shadow-inner">
                        {s.personaUsed.includes('Karen') ? '🤬' : s.personaUsed.includes('Kevin') ? '🔥' : '😤'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[15px] mb-0.5 group-hover:text-indigo-600 transition-colors">
                          {s.personaUsed}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <Clock size={12} />
                          {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Score & Arrow */}
                    {s.reportCard ? (
                      <div className="flex items-center gap-6">
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          s.reportCard.overallScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          s.reportCard.overallScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          Score: {s.reportCard.overallScore}
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-1" />
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full">
                        Incomplete
                      </div>
                    )}
                    
                  </div>
               ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
