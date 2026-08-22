const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Report.jsx', 'utf8');

const newReport = `import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShieldCheck, Zap, Activity, BrainCircuit, Heart, BarChart2, Star, TrendingUp, AlertTriangle } from 'lucide-react';

function Report() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.post('http://localhost:5005/api/end', { sessionId });
        setReport(res.data.reportCard);
      } catch (err) {
        console.error('Failed to load report', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
        <div className="text-xl font-bold text-slate-300 animate-pulse">Generating Report Card...</div>
        <p className="text-slate-500 mt-2">Analyzing your de-escalation tactics</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-xl font-bold text-rose-500">Failed to load report.</div>
      </div>
    );
  }

  const getScoreColor = (score, outOf = 10) => {
    const percent = score / outOf;
    if (percent >= 0.8) return 'text-emerald-400';
    if (percent >= 0.5) return 'text-amber-400';
    return 'text-rose-400';
  };
  
  const getBadgeColor = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 50) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const getIcon = (score) => {
    if (score >= 80) return <Star size={24} className="text-emerald-400" />;
    if (score >= 50) return <TrendingUp size={24} className="text-amber-400" />;
    return <AlertTriangle size={24} className="text-rose-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 animate-[fadeIn_0.5s_ease-out]">
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white font-medium mb-8 transition-colors group bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 w-max"
        >
          <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/10 overflow-hidden">
          
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                  <ShieldCheck className="text-indigo-500" size={36} />
                  Mission Debriefing
                </h1>
                <p className="text-slate-400 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  Session ID: <span className="font-mono text-slate-300">{sessionId.split('-')[0]}</span>
                </p>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-2">Overall Score</span>
                <div className="flex items-center gap-4">
                  <div className="text-6xl font-black tracking-tighter flex items-baseline">
                    <span className={getScoreColor(report.overallScore, 100)}>{report.overallScore}</span>
                    <span className="text-2xl text-slate-600 font-bold ml-1">/100</span>
                  </div>
                  <div className={\`w-14 h-14 rounded-2xl flex items-center justify-center \${getBadgeColor(report.overallScore)}\`}>
                    {getIcon(report.overallScore)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            
            {/* Core Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <MetricCard 
                icon={<Activity size={20} />} 
                title="Professionalism" 
                score={report.professionalism} 
                color={getScoreColor(report.professionalism)} 
              />
              <MetricCard 
                icon={<Zap size={20} />} 
                title="De-Escalation" 
                score={report.deEscalation} 
                color={getScoreColor(report.deEscalation)} 
              />
              <MetricCard 
                icon={<BrainCircuit size={20} />} 
                title="Problem Solving" 
                score={report.problemSolving} 
                color={getScoreColor(report.problemSolving)} 
              />
              <MetricCard 
                icon={<Heart size={20} />} 
                title="Empathy" 
                score={report.empathy} 
                color={getScoreColor(report.empathy)} 
              />
            </div>

            {/* AI Feedback Box */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-8 rounded-[24px] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">
                <BarChart2 size={16} /> Evaluation Summary
              </h3>
              <p className="text-lg text-indigo-100/90 leading-relaxed font-medium">
                {report.feedback}
              </p>
            </div>
            
            <div className="mt-12 flex justify-center">
               <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-2xl font-bold shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                >
                  <ArrowLeft size={20} /> Return to Base
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, score, color }) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-[24px] border border-white/5 hover:bg-slate-800 transition-colors group">
      <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mb-4 group-hover:text-slate-300 transition-colors">
        {icon}
        {title}
      </div>
      <div className="flex items-baseline">
        <div className={\`text-4xl font-black \${color}\`}>{score}</div>
        <div className="text-lg font-bold text-slate-600 ml-1">/10</div>
      </div>
    </div>
  );
}

export default Report;
`;

fs.writeFileSync('client/src/pages/Report.jsx', newReport);
console.log('Patched Report UI');
