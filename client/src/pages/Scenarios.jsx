import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Zap, Play, Plus, BrainCircuit, UserPlus, Flame, Shield, ArrowRight } from 'lucide-react';

function Scenarios({ user }) {
  const [globalPersonas, setGlobalPersonas] = useState([]);
  const [customPersonas, setCustomPersonas] = useState([]);
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Custom Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', backstory: '', initialMessage: '', frustration: 5 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [globalRes, customRes] = await Promise.all([
          axios.get('http://localhost:5005/api/personas'),
          user ? axios.get('http://localhost:5005/api/personas/custom', {
            headers: { Authorization: `Bearer ${localStorage.getItem('rageroom_token')}` }
          }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
        ]);
        
        setGlobalPersonas(globalRes.data);
        setCustomPersonas(customRes.data);
      } catch (err) {
        console.error("Failed to fetch scenarios", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleStart = (personaId) => {
    navigate('/chat', { state: { selectedPersonaId: personaId } });
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...formData,
        startingFactors: { frustration: Number(formData.frustration), patience: 5, trust: 5, loyalty: 5, satisfaction: 5 }
      };
      const res = await axios.post('http://localhost:5005/api/personas/custom', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('rageroom_token')}` }
      });
      setCustomPersonas([...customPersonas, res.data]);
      setShowForm(false);
      setFormData({ name: '', description: '', backstory: '', initialMessage: '', frustration: 5 });
    } catch (err) {
      console.error(err);
      alert("Failed to create custom scenario");
    } finally {
      setCreating(false);
    }
  };

  const PersonaCard = ({ p, isCustom }) => (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 shadow-inner">
          <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{p.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
              p.startingFactors.frustration >= 8 ? 'bg-rose-100 text-rose-700' :
              p.startingFactors.frustration >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              Frustration Level {p.startingFactors.frustration}
            </span>
            {isCustom && <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">Custom</span>}
          </div>
        </div>
      </div>
      
      <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-6 flex-1">
        {p.description || p.backstory}
      </p>

      <button 
        onClick={() => handleStart(p.id || p._id)}
        className="w-full py-3 bg-slate-50 hover:bg-[#111] text-slate-900 hover:text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 group-hover:bg-[#111] group-hover:text-white"
      >
        <Play size={16} className="fill-current" /> Play Scenario
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-indigo-100 pb-20">
      
      {/* Navbar */}
      <nav className="sticky top-0 inset-x-0 bg-white/80 backdrop-blur-xl z-50 border-b border-slate-200/60">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-[#111] p-1.5 rounded-lg shadow-sm">
              <Zap size={18} fill="white" stroke="none" />
            </div>
            <span className="font-bold text-xl tracking-tight text-black">RageRoom</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-slate-600 hover:text-black">
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 animate-slide-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#111111] mb-4">Choose your scenario.</h1>
            <p className="text-lg text-slate-500 font-medium max-w-xl">
              Select a predefined angry customer to practice your de-escalation skills, or create your own custom nightmare scenario.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-200/50 rounded-2xl w-max mb-10">
          <button 
            onClick={() => { setActiveTab('global'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'global' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BrainCircuit size={16} /> Global Library
          </button>
          <button 
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'custom' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UserPlus size={16} /> Custom Scenarios
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-3xl h-[280px] border border-slate-200/60 p-6 animate-pulse"></div>
            ))}
          </div>
        ) : activeTab === 'global' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {globalPersonas.map(p => <PersonaCard key={p.id} p={p} isCustom={false} />)}
          </div>
        ) : (
          <div className="space-y-10">
            {!user ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Log in to create custom scenarios</h3>
                <button onClick={() => navigate('/auth')} className="mt-4 bg-[#111] text-white px-8 py-3 rounded-full font-bold">Sign In</button>
              </div>
            ) : showForm ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-2xl shadow-sm">
                <h3 className="text-2xl font-bold mb-6">Create Custom Customer</h3>
                <form onSubmit={handleCreateCustom} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Customer Name</label>
                    <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Karen Smith" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <input required type="text" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Furious about a late delivery" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Backstory (System Prompt Context)</label>
                    <textarea required value={formData.backstory} onChange={e=>setFormData({...formData, backstory: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]" placeholder="Explain why they are angry and what happened..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Initial Message</label>
                    <textarea required value={formData.initialMessage} onChange={e=>setFormData({...formData, initialMessage: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]" placeholder="The first thing they say in the chat..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span>Starting Frustration (1-10)</span>
                      <span className="text-indigo-600 text-lg">{formData.frustration}</span>
                    </label>
                    <input type="range" min="1" max="10" value={formData.frustration} onChange={e=>setFormData({...formData, frustration: e.target.value})} className="w-full accent-indigo-600" />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={creating} className="flex-1 bg-[#111] text-white py-3.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50">
                      {creating ? 'Creating...' : 'Save & Generate Avatar'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <button 
                  onClick={() => setShowForm(true)}
                  className="mb-8 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                  <Plus size={18} /> Create New Customer
                </button>
                {customPersonas.length === 0 ? (
                  <div className="text-slate-500 font-medium">You haven't created any custom scenarios yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {customPersonas.map(p => <PersonaCard key={p._id} p={p} isCustom={true} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Scenarios;
