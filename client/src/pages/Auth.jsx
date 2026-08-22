import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await axios.post(`http://localhost:5005${endpoint}`, { username, password });
      localStorage.setItem('rageroom_token', res.data.token);
      localStorage.setItem('rageroom_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E7EB] animate-slide-up">
        <h1 className="text-[28px] leading-[1.2] font-semibold text-[#111111] text-center mb-8 tracking-[-0.02em]">
          {isLogin ? 'Log in to RageRoom' : 'Create an Account'}
        </h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#6B6B6B] mb-1.5">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent focus:outline-none transition-all duration-200 text-[#111111] placeholder:text-[#9CA3AF]"
              placeholder="agent_smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B6B6B] mb-1.5">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent focus:outline-none transition-all duration-200 text-[#111111] placeholder:text-[#9CA3AF]"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium py-3.5 rounded-xl shadow-[0_2px_4px_rgba(79,70,229,0.1)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2"
          >
            {loading ? 'Processing...' : (isLogin ? 'Continue' : 'Create Account')}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-[#6B6B6B]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-[var(--color-accent)] font-medium hover:underline focus:outline-none"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
