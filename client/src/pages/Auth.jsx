import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, BarChart3, MessageSquare, Headphones, ShieldCheck, Zap } from 'lucide-react';

const MockCard = ({ type }) => {
  if (type === 'chart') {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] w-[240px] mb-6 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="h-3 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <BarChart3 size={12} className="text-indigo-600" />
          </div>
        </div>
        <div className="flex items-end gap-2 h-20 mt-2">
          {[40, 70, 45, 90, 65, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-indigo-500 rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (type === 'chat') {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] w-[240px] mb-6 flex-shrink-0">
        <div className="flex gap-3 items-center mb-3">
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <Headphones size={14} className="text-emerald-600" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-2 w-12 bg-gray-100 rounded-full"></div>
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <div className="bg-gray-100 p-2.5 rounded-xl rounded-tl-sm w-3/4">
            <div className="h-2 w-full bg-gray-300 rounded-full mb-1.5"></div>
            <div className="h-2 w-2/3 bg-gray-300 rounded-full"></div>
          </div>
          <div className="bg-indigo-600 p-2.5 rounded-xl rounded-tr-sm w-3/4 ml-auto">
            <div className="h-2 w-full bg-indigo-300 rounded-full mb-1.5"></div>
            <div className="h-2 w-1/2 bg-indigo-300 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] w-[240px] mb-6 flex-shrink-0">
      <div className="flex justify-between items-start mb-4">
        <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center">
          <ShieldCheck size={20} className="text-rose-500" />
        </div>
        <div className="h-4 w-12 bg-gray-100 rounded-full"></div>
      </div>
      <div className="h-3 w-3/4 bg-gray-200 rounded-full mb-2 mt-6"></div>
      <div className="h-3 w-1/2 bg-gray-200 rounded-full mb-4"></div>
      <div className="h-10 w-full bg-slate-900 rounded-xl mt-4"></div>
    </div>
  );
};

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

  // Generate lists of cards for the columns
  const col1 = ['chart', 'chat', 'default', 'chat', 'chart', 'default'];
  const col2 = ['default', 'chart', 'chat', 'default', 'chart', 'chat'];
  const col3 = ['chat', 'default', 'chart', 'chat', 'default', 'chart'];

  return (
    <div className="min-h-screen w-full flex bg-[#0A0A0A] overflow-hidden">
      
      {/* Left Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10 bg-[#0A0A0A]">
        <div className="max-w-md w-full mx-auto animate-slide-up">
          <div className="flex items-center gap-2 mb-12">
             <div className="bg-white p-1.5 rounded-lg">
               <Zap size={24} fill="black" stroke="none" />
             </div>
             <span className="text-white font-bold tracking-tight text-xl">RageRoom</span>
          </div>

          <h1 className="text-[36px] leading-[1.1] font-bold text-white mb-3 tracking-[-0.03em]">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-[#A1A1AA] text-[16px] mb-10">
            {isLogin ? 'Log in to continue your training sessions.' : 'Sign up to start simulating difficult customers.'}
          </p>
          
          {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium border border-red-500/20">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#18181B] border border-[#27272A] rounded-xl focus:ring-1 focus:ring-white focus:border-white focus:outline-none transition-all duration-200 text-white placeholder:text-[#52525B]"
                placeholder="Username"
              />
            </div>
            <div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#18181B] border border-[#27272A] rounded-xl focus:ring-1 focus:ring-white focus:border-white focus:outline-none transition-all duration-200 text-white placeholder:text-[#52525B]"
                placeholder="Password"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-4"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-[#A1A1AA]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-white font-medium hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Mobbin Floating Grid */}
      <div className="hidden lg:block w-1/2 bg-[#F3F4F6] relative overflow-hidden flex items-center justify-center">
        {/* Tilted container */}
        <div className="flex gap-6 transform -rotate-12 scale-110 h-[200vh]">
          
          {/* Column 1 (Scrolls Up) */}
          <div className="flex flex-col gap-6 animate-scroll-up pt-[100vh]">
             {[...col1, ...col1, ...col1].map((type, i) => <MockCard key={i} type={type} />)}
          </div>
          
          {/* Column 2 (Scrolls Down) */}
          <div className="flex flex-col gap-6 animate-scroll-down mt-[-50vh]">
             {[...col2, ...col2, ...col2].map((type, i) => <MockCard key={i} type={type} />)}
          </div>

          {/* Column 3 (Scrolls Up) */}
          <div className="flex flex-col gap-6 animate-scroll-up pt-[100vh]">
             {[...col3, ...col3, ...col3].map((type, i) => <MockCard key={i} type={type} />)}
          </div>

        </div>
        
        {/* Overlays to smooth out edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3F4F6] via-transparent to-[#F3F4F6] pointer-events-none opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#F3F4F6] pointer-events-none opacity-30"></div>
      </div>

    </div>
  );
}

export default Auth;
