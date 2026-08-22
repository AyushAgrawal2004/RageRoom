const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Dashboard.jsx', 'utf8');

const startIdx = code.indexOf('{/* Top Metrics Cards */}');
const endIdx = code.indexOf('{/* Recent Sessions */}');

if (startIdx !== -1 && endIdx !== -1) {
  const newMetrics = `{/* Top Metrics Cards */}
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

        `;
  
  code = code.substring(0, startIdx) + newMetrics + code.substring(endIdx);
  fs.writeFileSync('client/src/pages/Dashboard.jsx', code);
  console.log('Fixed dashboard metrics');
}
