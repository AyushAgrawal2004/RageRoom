import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Zap, Heart, Search, User, Menu, Home, Bell, Settings, Share, Image as ImageIcon, MessageCircle } from 'lucide-react';

// Reusable mobile screen skeleton
const MobileScreen = ({ children, bg = "bg-white", title }) => (
  <div className={`${bg} rounded-[32px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-[8px] border-[#18181B] w-[260px] h-[540px] mb-6 flex-shrink-0 flex flex-col overflow-hidden relative`}>
    {/* iOS Notch Mockup */}
    <div className="absolute top-0 inset-x-0 h-7 flex justify-center items-start bg-[#18181B] rounded-b-xl w-[120px] mx-auto z-10"></div>
    <div className="mt-4 flex-1 flex flex-col relative z-0">
      {children}
    </div>
  </div>
);

const MockFeedScreen = () => (
  <MobileScreen>
    <div className="flex justify-between items-center mb-6 mt-2">
      <h2 className="text-[22px] font-black text-slate-900 tracking-tight">Active Tickets</h2>
      <Search size={22} className="text-slate-400" />
    </div>
    <div className="flex-1 flex flex-col gap-4">
      {[{ name: "John Doe", issue: "Refund denied!", time: "2m ago" }, { name: "Angry User", issue: "Account locked", time: "15m ago" }].map((t, i) => (
        <div key={i} className="flex flex-col gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
          <div className="flex justify-between items-center">
            <span className="font-bold text-red-900">{t.name}</span>
            <span className="text-xs font-semibold text-red-400">{t.time}</span>
          </div>
          <p className="text-sm text-red-700 font-medium">"{t.issue}"</p>
          <div className="w-full h-10 bg-red-600 rounded-xl mt-2 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            Handle Ticket
          </div>
        </div>
      ))}
    </div>
    <div className="h-14 w-full bg-slate-100 mt-auto rounded-[20px] flex justify-around items-center px-2">
       <Home size={22} className="text-slate-800" />
       <MessageCircle size={22} className="text-slate-400" />
       <Bell size={22} className="text-slate-400" />
       <User size={22} className="text-slate-400" />
    </div>
  </MobileScreen>
);

const MockChatScreen = () => (
  <MobileScreen bg="bg-slate-50">
    <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mt-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-rose-600 font-bold text-lg">🤬</span>
        </div>
        <div>
          <div className="font-bold text-slate-900">Karen M.</div>
          <div className="text-xs font-bold text-rose-500 uppercase tracking-wider">Level 10 Irate</div>
        </div>
      </div>
    </div>
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      <div className="self-start max-w-[85%] bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-800">I HAVE BEEN WAITING FOR 40 MINUTES! THIS IS UNACCEPTABLE!</p>
      </div>
      <div className="self-end max-w-[85%] bg-indigo-600 p-4 rounded-2xl rounded-tr-sm shadow-md text-white">
        <p className="text-sm font-medium">I sincerely apologize for the delay. Let me fix this right now.</p>
      </div>
      <div className="self-center my-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
        Empathy +15
      </div>
      <div className="self-start max-w-[85%] bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-800">You better! I want to speak to your manager!</p>
      </div>
    </div>
    <div className="h-14 w-full bg-white mt-auto rounded-full shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center px-5 gap-3 border border-slate-100">
      <span className="text-xl">🎤</span>
      <div className="w-full h-4 bg-slate-100 rounded-full"></div>
    </div>
  </MobileScreen>
);

const MockProfileScreen = () => (
  <MobileScreen>
    <div className="flex justify-between items-center mb-8 mt-2">
      <h2 className="text-[22px] font-black text-slate-900 tracking-tight">Report Card</h2>
      <Share size={22} className="text-slate-800" />
    </div>
    <div className="flex flex-col items-center mb-8">
      <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mb-4">
        <span className="text-4xl font-black text-emerald-500">A+</span>
      </div>
      <div className="text-xl font-bold text-slate-900 mb-1">Session #402</div>
      <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Passed Simulation</div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-auto">
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
        <div className="text-2xl font-black text-indigo-600">9/10</div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Empathy</div>
      </div>
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
        <div className="text-2xl font-black text-indigo-600">8/10</div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Patience</div>
      </div>
    </div>
    <div className="w-full bg-slate-900 text-white font-bold rounded-xl py-4 text-center mt-4 shadow-lg shadow-slate-900/20">
      Start Next Level
    </div>
  </MobileScreen>
);

const MockAnalyticsScreen = () => (
  <MobileScreen bg="bg-indigo-900">
    <div className="flex justify-between items-center mb-8 mt-2">
      <h2 className="text-[22px] font-black text-white tracking-tight">Analytics</h2>
      <Bell size={22} className="text-indigo-200" />
    </div>
    <div className="text-indigo-200 text-sm font-semibold mb-1 uppercase tracking-wider">Total Score</div>
    <div className="text-5xl font-black text-white mb-8">89.4<span className="text-2xl text-indigo-400">/100</span></div>
    
    <div className="flex items-end gap-3 h-32 mb-8 border-b border-indigo-800/50 pb-4">
      {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
        <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-sm relative group">
           {h === 100 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-md">Max</div>}
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-indigo-800/50 p-4 rounded-2xl backdrop-blur-sm border border-indigo-700/50">
        <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">Simulations</div>
        <div className="text-2xl font-black text-white">1,428</div>
      </div>
      <div className="bg-indigo-800/50 p-4 rounded-2xl backdrop-blur-sm border border-indigo-700/50">
        <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">Win Rate</div>
        <div className="text-2xl font-black text-emerald-400">92%</div>
      </div>
    </div>
  </MobileScreen>
);

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}${endpoint}`, { username, password });
      
      localStorage.setItem('rageroom_token', res.data.token);
      localStorage.setItem('rageroom_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const screens = [MockFeedScreen, MockChatScreen, MockProfileScreen, MockAnalyticsScreen];
  
  // Randomize columns
  const getCol = (offset) => {
    return Array(6).fill(null).map((_, i) => {
      const Comp = screens[(i + offset) % screens.length];
      return <Comp key={i} />;
    });
  };

  return (
    <div className="h-screen w-full flex bg-[#0A0A0A] overflow-hidden fixed inset-0 font-sans">
      
      {/* Left Panel - Auth Form */}
      <div className="w-full lg:w-5/12 h-full flex flex-col justify-center px-8 sm:px-16 lg:px-20 relative z-10 bg-[#0A0A0A] overflow-y-auto border-r border-[#27272A]">
        <div className="max-w-sm w-full mx-auto animate-slide-up py-12">
          <div className="flex items-center gap-2 mb-16">
             <div className="bg-white p-1 rounded-md">
               <Zap size={20} fill="black" stroke="none" />
             </div>
             <span className="text-white font-bold tracking-tight text-xl">RageRoom</span>
          </div>

          <h1 className="text-[32px] leading-[1.1] font-bold text-white mb-3 tracking-tight">
            {isLogin ? 'Log in to your account' : 'Create an account'}
          </h1>
          <p className="text-[#A1A1AA] text-[15px] mb-10">
            {isLogin ? 'Welcome back! Please enter your details.' : 'Join the ultimate customer support training simulator.'}
          </p>
          
          {error && <div className="bg-red-500/10 text-red-400 p-3.5 rounded-xl mb-6 text-sm font-medium border border-red-500/20">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#A1A1AA] text-sm font-medium mb-1.5">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[#18181B] border border-[#3F3F46] rounded-xl focus:ring-1 focus:ring-white focus:border-white focus:outline-none transition-all duration-200 text-white placeholder:text-[#52525B]"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-[#A1A1AA] text-sm font-medium mb-1.5">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#18181B] border border-[#3F3F46] rounded-xl focus:ring-1 focus:ring-white focus:border-white focus:outline-none transition-all duration-200 text-white placeholder:text-[#52525B]"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              {loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up')}
            </button>
          </form>
          
          <div className="mt-8 text-center text-[14px] text-[#A1A1AA]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-white font-semibold hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Mobbin Floating Grid */}
      <div className="hidden lg:block w-7/12 h-full bg-[#FAFAFA] relative overflow-hidden flex items-center justify-center pointer-events-none">
        
        {/* The rotating viewport to hold the grid */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-6 transform -rotate-12 scale-[1.15] w-[150vw] h-[250vh] justify-center pt-[50vh]">
            
            {/* 4 Columns for density */}
            <div className="flex flex-col gap-6 animate-scroll-up" style={{ animationDuration: '60s' }}>
               {getCol(0)}
               {getCol(0)}
            </div>
            
            <div className="flex flex-col gap-6 animate-scroll-down" style={{ animationDuration: '70s', marginTop: '-50vh' }}>
               {getCol(1)}
               {getCol(1)}
            </div>

            <div className="flex flex-col gap-6 animate-scroll-up" style={{ animationDuration: '65s' }}>
               {getCol(2)}
               {getCol(2)}
            </div>

            <div className="flex flex-col gap-6 animate-scroll-down" style={{ animationDuration: '75s', marginTop: '-25vh' }}>
               {getCol(3)}
               {getCol(3)}
            </div>
            
          </div>
        </div>
        
        {/* Top and Bottom fade overlays to hide raw edges */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
        {/* Left fade to blend with black section */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0A0A0A] to-transparent opacity-10 z-10 pointer-events-none"></div>
      </div>

    </div>
  );
}

export default Auth;
