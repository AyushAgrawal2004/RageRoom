const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Scenarios.jsx', 'utf8');

// Add MessageSquare and PhoneCall to lucide imports
if (!code.includes('PhoneCall')) {
  code = code.replace("Play, Plus, BrainCircuit, UserPlus, Flame, Shield, ArrowRight", "Play, Plus, BrainCircuit, UserPlus, Flame, Shield, ArrowRight, MessageSquare, PhoneCall");
}

// Modify handleStart to accept mode
code = code.replace(
  "const handleStart = (personaId) => {\n    navigate('/chat', { state: { selectedPersonaId: personaId } });\n  };",
  "const handleStart = (personaId, mode) => {\n    navigate('/session', { state: { selectedPersonaId: personaId, mode } });\n  };"
);

// Replace the single button with a two-button flex container
const oldButton = `<button 
        onClick={() => handleStart(p.id || p._id)}
        className="w-full py-3.5 bg-gradient-to-b from-slate-800 to-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_0_#0f172a,0_10px_20px_rgba(0,0,0,0.1)] active:shadow-[0_0px_0_#0f172a,0_0px_0_rgba(0,0,0,0)] active:translate-y-[4px] hover:brightness-110 transition-all group-hover:from-indigo-600 group-hover:to-indigo-700 group-hover:shadow-[0_4px_0_#3730a3,0_10px_20px_rgba(79,70,229,0.2)]"
      >
        <Play size={16} className="fill-current" /> Play Scenario
      </button>`;

const newButtons = `<div className="flex gap-3">
        <button 
          onClick={() => handleStart(p.id || p._id, 'chat')}
          className="flex-1 py-3 bg-gradient-to-b from-slate-100 to-slate-200 text-slate-800 border-t border-white border-b border-slate-300 rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-[0_4px_0_#cbd5e1,0_10px_15px_rgba(0,0,0,0.05)] active:shadow-[0_0px_0_#cbd5e1,0_0px_0_rgba(0,0,0,0)] active:translate-y-[4px] hover:brightness-105 transition-all group-hover:text-indigo-700 group-hover:from-indigo-50 group-hover:to-indigo-100 group-hover:border-indigo-200 group-hover:shadow-[0_4px_0_#c7d2fe,0_10px_15px_rgba(79,70,229,0.1)]"
        >
          <MessageSquare size={16} /> <span className="text-[11px] uppercase tracking-widest">Text Chat</span>
        </button>
        <button 
          onClick={() => handleStart(p.id || p._id, 'call')}
          className="flex-1 py-3 bg-gradient-to-b from-slate-800 to-slate-900 text-white border-t border-slate-700 border-b border-black rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-[0_4px_0_#0f172a,0_10px_15px_rgba(0,0,0,0.1)] active:shadow-[0_0px_0_#0f172a,0_0px_0_rgba(0,0,0,0)] active:translate-y-[4px] hover:brightness-110 transition-all group-hover:from-indigo-600 group-hover:to-indigo-700 group-hover:border-indigo-500 group-hover:shadow-[0_4px_0_#3730a3,0_10px_15px_rgba(79,70,229,0.2)]"
        >
          <PhoneCall size={16} /> <span className="text-[11px] uppercase tracking-widest">Voice Call</span>
        </button>
      </div>`;

code = code.replace(oldButton, newButtons);
fs.writeFileSync('client/src/pages/Scenarios.jsx', code);
console.log('Scenarios.jsx patched');
