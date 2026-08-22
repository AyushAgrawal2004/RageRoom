import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Zap, Heart, Search, User, Menu, Home, Bell, Settings, Share, Image as ImageIcon, MessageCircle } from 'lucide-react';

// Reusable mobile screen skeleton
const MobileScreen = ({ children, bg = "bg-white" }) => (
  <div className={`${bg} rounded-[32px] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-[6px] border-slate-100 w-[240px] h-[520px] mb-6 flex-shrink-0 flex flex-col overflow-hidden relative`}>
    <div className="absolute top-0 inset-x-0 h-6 flex justify-center items-start pt-2">
      <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
    </div>
    <div className="mt-6 flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

const MockFeedScreen = () => (
  <MobileScreen>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">For You</h2>
      <Search size={20} className="text-slate-400" />
    </div>
    <div className="flex-1 flex flex-col gap-5">
      {[1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100"></div>
            <div className="w-24 h-3 bg-slate-200 rounded-full"></div>
          </div>
          <div className="w-full h-40 bg-slate-100 rounded-2xl flex items-center justify-center">
            <ImageIcon size={32} className="text-slate-300" />
          </div>
          <div className="w-3/4 h-3 bg-slate-200 rounded-full"></div>
          <div className="w-1/2 h-3 bg-slate-200 rounded-full"></div>
        </div>
      ))}
    </div>
    <div className="h-12 w-full bg-slate-50 mt-auto rounded-full flex justify-around items-center px-2">
       <Home size={20} className="text-slate-800" />
       <Search size={20} className="text-slate-400" />
       <Heart size={20} className="text-slate-400" />
       <User size={20} className="text-slate-400" />
    </div>
  </MobileScreen>
);

const MockChatScreen = () => (
  <MobileScreen bg="bg-slate-50">
    <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-rose-600 font-bold">AK</span>
        </div>
        <div className="w-20 h-3 bg-slate-200 rounded-full"></div>
      </div>
      <Menu size={20} className="text-slate-400" />
    </div>
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      <div className="self-start max-w-[80%] bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm">
        <div className="w-32 h-2 bg-slate-200 rounded-full mb-2"></div>
        <div className="w-24 h-2 bg-slate-200 rounded-full"></div>
      </div>
      <div className="self-end max-w-[80%] bg-indigo-600 p-3 rounded-2xl rounded-tr-sm shadow-sm">
        <div className="w-36 h-2 bg-indigo-200 rounded-full mb-2"></div>
        <div className="w-20 h-2 bg-indigo-200 rounded-full"></div>
      </div>
      <div className="self-start max-w-[80%] bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm">
        <div className="w-40 h-2 bg-slate-200 rounded-full mb-2"></div>
        <div className="w-32 h-2 bg-slate-200 rounded-full mb-2"></div>
        <div className="w-16 h-2 bg-slate-200 rounded-full"></div>
      </div>
    </div>
    <div className="h-12 w-full bg-white mt-auto rounded-full shadow-sm flex items-center px-4">
      <div className="w-full h-3 bg-slate-100 rounded-full"></div>
    </div>
  </MobileScreen>
);

const MockProfileScreen = () => (
  <MobileScreen>
    <div className="flex justify-between items-center mb-6">
      <Settings size={20} className="text-slate-800" />
      <Share size={20} className="text-slate-800" />
    </div>
    <div className="flex flex-col items-center mb-6">
      <div className="w-24 h-24 rounded-full bg-emerald-100 mb-4"></div>
      <div className="w-32 h-4 bg-slate-800 rounded-full mb-2"></div>
      <div className="w-20 h-3 bg-slate-400 rounded-full"></div>
    </div>
    <div className="flex justify-center gap-8 mb-8">
      <div className="text-center"><div className="w-8 h-4 bg-slate-800 rounded-full mb-1 mx-auto"></div><div className="w-12 h-2 bg-slate-300 rounded-full"></div></div>
      <div className="text-center"><div className="w-8 h-4 bg-slate-800 rounded-full mb-1 mx-auto"></div><div className="w-12 h-2 bg-slate-300 rounded-full"></div></div>
      <div className="text-center"><div className="w-8 h-4 bg-slate-800 rounded-full mb-1 mx-auto"></div><div className="w-12 h-2 bg-slate-300 rounded-full"></div></div>
    </div>
    <div className="w-full h-12 bg-slate-900 rounded-xl mb-4"></div>
    <div className="w-full h-12 bg-slate-100 rounded-xl"></div>
  </MobileScreen>
);

const MockAnalyticsScreen = () => (
  <MobileScreen bg="bg-indigo-900">
    <div className="flex justify-between items-center mb-8">
      <div className="w-8 h-8 rounded-full bg-indigo-800"></div>
      <Bell size={20} className="text-indigo-200" />
    </div>
    <div className="w-24 h-3 bg-indigo-300 rounded-full mb-2"></div>
    <div className="w-40 h-8 bg-white rounded-full mb-8"></div>
    
    <div className="flex items-end gap-2 h-32 mb-8 border-b border-indigo-800 pb-2">
      {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
        <div key={i} className="flex-1 bg-indigo-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
      ))}
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-indigo-800 p-4 rounded-2xl">
        <div className="w-8 h-8 bg-indigo-700 rounded-full mb-2"></div>
        <div className="w-16 h-2 bg-indigo-300 rounded-full"></div>
      </div>
      <div className="bg-indigo-800 p-4 rounded-2xl">
        <div className="w-8 h-8 bg-indigo-700 rounded-full mb-2"></div>
        <div className="w-16 h-2 bg-indigo-300 rounded-full"></div>
      </div>
    </div>
  </MobileScreen>
);

function Auth({ setAuthToken }) {
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
      const res = await axios.post(`http://localhost:5005${endpoint}`, { username, password });
      
      const token = res.data.token;
      localStorage.setItem('rageroom_token', token);
      setAuthToken(token);
      navigate('/dashboard');
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
        
        {/* Soft Vignette Overlays for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-[#FAFAFA] opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0A0A0A] opacity-20"></div>
      </div>

    </div>
  );
}

export default Auth;
