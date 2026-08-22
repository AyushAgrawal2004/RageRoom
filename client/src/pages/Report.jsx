import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Report() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Just call end again, if it has a report it will return it immediately
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-semibold text-slate-500 animate-pulse">Loading Your Report Card...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-semibold text-red-500">Failed to load report.</div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-3xl mx-auto animate-slide-up">
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-[#6B6B6B] hover:text-[#111111] font-medium flex items-center gap-2 mb-6 transition-colors"
        >
          &larr; Back to Dashboard
        </button>
        
        <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E7EB] overflow-hidden">
          <div className="p-8 text-center border-b border-[#F3F4F6]">
            <h1 className="text-[28px] leading-[1.2] font-semibold text-[#111111] mb-2 tracking-[-0.02em]">Performance Review</h1>
            <p className="text-[14px] text-[#9CA3AF]">Session ID: {sessionId}</p>
          </div>

          <div className="p-10">
            <div className="flex flex-col items-center mb-12">
              <span className="text-[13px] text-[#6B6B6B] font-medium tracking-wide uppercase mb-3">Overall Score</span>
              <div className="flex items-baseline">
                <span className={`text-[64px] leading-none font-bold tracking-tight ${report.overallScore >= 70 ? 'text-emerald-500' : report.overallScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {report.overallScore}
                </span>
                <span className="text-[24px] text-[#9CA3AF] font-medium ml-1">/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E5E7EB]">
                <div className="text-[13px] text-[#6B6B6B] font-medium mb-2">Professionalism</div>
                <div className={'text-[28px] leading-none font-semibold tracking-tight ' + getScoreColor(report.professionalism)}>{report.professionalism}<span className="text-[16px] text-[#9CA3AF] font-normal">/10</span></div>
              </div>
              <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E5E7EB]">
                <div className="text-[13px] text-[#6B6B6B] font-medium mb-2">De-Escalation</div>
                <div className={'text-[28px] leading-none font-semibold tracking-tight ' + getScoreColor(report.deEscalation)}>{report.deEscalation}<span className="text-[16px] text-[#9CA3AF] font-normal">/10</span></div>
              </div>
              <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E5E7EB]">
                <div className="text-[13px] text-[#6B6B6B] font-medium mb-2">Problem Solving</div>
                <div className={'text-[28px] leading-none font-semibold tracking-tight ' + getScoreColor(report.problemSolving)}>{report.problemSolving}<span className="text-[16px] text-[#9CA3AF] font-normal">/10</span></div>
              </div>
              <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E5E7EB]">
                <div className="text-[13px] text-[#6B6B6B] font-medium mb-2">Empathy</div>
                <div className={'text-[28px] leading-none font-semibold tracking-tight ' + getScoreColor(report.empathy)}>{report.empathy}<span className="text-[16px] text-[#9CA3AF] font-normal">/10</span></div>
              </div>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-[16px]">
              <h3 className="text-[14px] font-semibold text-indigo-900 mb-2 uppercase tracking-wide">
                Judge's Feedback
              </h3>
              <p className="text-[15px] text-indigo-900/80 leading-[1.6]">
                {report.feedback}
              </p>
            </div>
            
            <div className="mt-10 flex justify-center">
               <button 
                  onClick={() => navigate('/chat')}
                  className="px-8 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-[12px] shadow-[0_2px_4px_rgba(79,70,229,0.1)] transition-all duration-200 active:scale-[0.98]"
                >
                  Start Another Simulation
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
