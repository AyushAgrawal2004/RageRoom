import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Zap, LayoutDashboard, BarChart3, Settings, LogOut, Plus, ChevronRight, Activity, Target, ShieldCheck, Clock, Award, ShieldAlert, Star, Trophy } from 'lucide-react';

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
          <div onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 text-slate-900 font-semibold rounded-xl cursor-pointer">
            <LayoutDashboard size={18} className="text-slate-700" />
            Overview
          </div>
          <div onClick={() => navigate('/scenarios')} className="flex items-center gap-3 px-4 py-2.5 text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-pointer">
            <Target size={18} />
            Scenarios
          </div>
          <div onClick={() => navigate('/leaderboard')} className="flex items-center gap-3 px-4 py-2.5 text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-pointer">
            <Trophy size={18} />
            Leaderboard
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-not-allowed opacity-60">
            <BarChart3 size={18} />
            Analytics <span className="ml-auto text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-400">PRO</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-not-allowed opacity-60">
            <Settings size={18} />
            Settings
          </div>
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
            onClick={() => navigate('/scenarios')}
            className="bg-gradient-to-b from-slate-800 to-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-[15px] shadow-[0_4px_0_#0f172a,0_10px_20px_rgba(0,0,0,0.1)] active:shadow-[0_0px_0_#0f172a,0_0px_0_rgba(0,0,0,0)] active:translate-y-[4px] hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> New Simulation
          </button>
        </header>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Metric 1 */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target size={64} className="text-indigo-600 transform group-hover:scale-110 transition-transform duration-500 translate-x-4 -translate-y-4" />
            </div>
            <div className="text-slate-500 font-bold text-sm mb-2 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" /> Total Simulations
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">
              {loading ? '-' : totalSimulations}
            </div>
          </div>
          
          {/* Metric 2 */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={64} className="text-emerald-600 transform group-hover:scale-110 transition-transform duration-500 translate-x-4 -translate-y-4" />
            </div>
            <div className="text-slate-500 font-bold text-sm mb-2 flex items-center gap-2">
              <Clock size={16} className="text-emerald-500" /> Avg Score
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">
              {loading ? '-' : avgScore}
            </div>
          </div>

          {/* Metric 3 - Premium Dark Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[32px] border-t border-slate-700 shadow-[0_8px_30px_rgba(15,23,42,0.2)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity z-10">
              <Award size={64} className="text-indigo-400 transform group-hover:scale-110 transition-transform duration-500 translate-x-4 -translate-y-4" />
            </div>
            <div className="text-indigo-200 font-bold text-sm mb-2 flex items-center gap-2 relative z-10">
              <Star size={16} className="text-indigo-400" /> Highest Score
            </div>
            <div className="text-4xl font-black text-white tracking-tight relative z-10">
              {loading ? '-' : highestScore}
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
                 onClick={() => navigate('/scenarios')}
                 className="bg-gradient-to-b from-indigo-500 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_4px_0_#3730a3,0_10px_20px_rgba(79,70,229,0.2)] active:shadow-[0_0px_0_#3730a3,0_0px_0_rgba(79,70,229,0)] active:translate-y-[4px] transition-all"
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
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
                        <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${s.personaUsed}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[16px] mb-1 group-hover:text-indigo-600 transition-colors capitalize">
                          {s.personaUsed.replace(/-/g, ' ')}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{s.messages?.length || 0} messages</span>
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
