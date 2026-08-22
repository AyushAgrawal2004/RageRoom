import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Zap, ShieldAlert, TrendingUp, Users, MessageSquare, Award, BrainCircuit, Activity } from 'lucide-react';

const MockCard = ({ title, subtitle, icon: Icon, colorClass, bgClass }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] w-[260px] mb-6 flex-shrink-0 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`h-12 w-12 rounded-xl ${bgClass} flex items-center justify-center`}>
          <Icon size={24} className={colorClass} />
        </div>
      </div>
      <h3 className="font-bold text-[#111111] text-[16px] mb-1 leading-tight">{title}</h3>
      <p className="text-[#6B6B6B] text-[13px] leading-relaxed">{subtitle}</p>
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

  const cardsInfo = [
    { title: "Master De-escalation", subtitle: "Practice calming down highly irate customers safely.", icon: ShieldAlert, colorClass: "text-rose-600", bgClass: "bg-rose-100" },
    { title: "AI Behavior Judge", subtitle: "Get graded instantly on empathy and problem-solving.", icon: Award, colorClass: "text-indigo-600", bgClass: "bg-indigo-100" },
    { title: "Realistic Roleplay", subtitle: "Powered by deep LLMs trained on actual support tickets.", icon: BrainCircuit, colorClass: "text-emerald-600", bgClass: "bg-emerald-100" },
    { title: "Track Performance", subtitle: "Review your report cards and watch your metrics soar.", icon: TrendingUp, colorClass: "text-blue-600", bgClass: "bg-blue-100" },
    { title: "Voice Mode", subtitle: "Use your real microphone to practice your vocal tone.", icon: Activity, colorClass: "text-amber-600", bgClass: "bg-amber-100" },
    { title: "Infinite Scenarios", subtitle: "From broken blenders to missing software licenses.", icon: Users, colorClass: "text-purple-600", bgClass: "bg-purple-100" }
  ];

  const col1 = [cardsInfo[0], cardsInfo[1], cardsInfo[2]];
  const col2 = [cardsInfo[3], cardsInfo[4], cardsInfo[5]];
  const col3 = [cardsInfo[2], cardsInfo[5], cardsInfo[0]];

  return (
    <div className="h-screen w-full flex bg-[#0A0A0A] overflow-hidden fixed inset-0">
      
      {/* Left Panel - Auth Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10 bg-[#0A0A0A] overflow-y-auto">
        <div className="max-w-md w-full mx-auto animate-slide-up py-12">
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
      <div className="hidden lg:block w-1/2 h-full bg-[#F3F4F6] relative overflow-hidden flex items-center justify-center pointer-events-none">
        {/* Tilted container */}
        <div className="flex gap-6 transform -rotate-12 scale-110 h-[200vh]">
          
          {/* Column 1 (Scrolls Up) */}
          <div className="flex flex-col gap-6 animate-scroll-up pt-[100vh]">
             {[...col1, ...col1, ...col1, ...col1].map((card, i) => <MockCard key={i} {...card} />)}
          </div>
          
          {/* Column 2 (Scrolls Down) */}
          <div className="flex flex-col gap-6 animate-scroll-down mt-[-50vh]">
             {[...col2, ...col2, ...col2, ...col2].map((card, i) => <MockCard key={i} {...card} />)}
          </div>

          {/* Column 3 (Scrolls Up) */}
          <div className="flex flex-col gap-6 animate-scroll-up pt-[100vh]">
             {[...col3, ...col3, ...col3, ...col3].map((card, i) => <MockCard key={i} {...card} />)}
          </div>

        </div>
        
        {/* Overlays to smooth out edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3F4F6] via-transparent to-[#F3F4F6] opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#F3F4F6] opacity-40"></div>
      </div>

    </div>
  );
}

export default Auth;
