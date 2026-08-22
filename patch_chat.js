const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Chat.jsx', 'utf8');

// Header
code = code.replace(
  'className="bg-white border-b border-slate-200/60 px-6 h-16 flex justify-between items-center shrink-0 shadow-sm z-10 relative"',
  'className="bg-white/80 backdrop-blur-xl border-b border-white/60 px-6 h-16 flex justify-between items-center shrink-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] z-10 relative"'
);

// Sidebar
code = code.replace(
  'className="w-[320px] bg-white border-r border-slate-200/60 flex flex-col shrink-0 overflow-y-auto"',
  'className="w-[320px] bg-white/50 backdrop-blur-md border-r border-white/60 flex flex-col shrink-0 overflow-y-auto shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-10 relative"'
);

// User Bubble
code = code.replace(
  'msg.role === \'user\' \n                      ? \'bg-[#111] text-white rounded-tr-sm\' \n                      : \'bg-white text-slate-800 rounded-tl-sm border border-slate-200/60\'',
  'msg.role === \'user\' \n                      ? \'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-tr-[4px] shadow-[0_4px_14px_rgba(79,70,229,0.3)] border-t border-indigo-400\' \n                      : \'bg-white text-slate-800 rounded-tl-[4px] border border-white/60 shadow-[0_4px_14px_rgb(0,0,0,0.04)]\''
);

// Chat wrapper
code = code.replace(
  'className="flex-1 flex flex-col bg-[#F9FAFB] relative"',
  'className="flex-1 flex flex-col bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/30 via-[#F9FAFB] to-[#F9FAFB] relative"'
);

// Input wrapper
code = code.replace(
  'className="p-6 bg-white border-t border-slate-200/60 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] relative shrink-0"',
  'className="p-6 bg-white/80 backdrop-blur-xl border-t border-white/60 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] relative shrink-0 z-10"'
);

// Send button
code = code.replace(
  'className="px-8 py-4 bg-[#111] text-white font-bold rounded-full hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center gap-2"',
  'className="px-8 py-4 bg-gradient-to-b from-slate-800 to-slate-900 text-white font-bold rounded-full hover:brightness-110 transition-all shadow-[0_4px_0_#0f172a,0_10px_20px_rgba(0,0,0,0.1)] active:shadow-[0_0px_0_#0f172a,0_0px_0_rgba(0,0,0,0)] disabled:opacity-50 disabled:shadow-none active:translate-y-[4px] flex items-center gap-2"'
);

// Chat input
code = code.replace(
  'className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-50 transition-all shadow-inner font-medium text-[15px]"',
  'className="flex-1 px-6 py-4 bg-white/50 backdrop-blur-sm border border-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] font-medium text-[15px]"'
);

fs.writeFileSync('client/src/pages/Chat.jsx', code);
console.log('Fixed chat styles');
