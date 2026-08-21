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
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-800 p-8 text-center text-white relative">
          <button 
            onClick={() => navigate('/dashboard')}
            className="absolute top-4 left-4 text-slate-300 hover:text-white font-semibold flex items-center gap-1"
          >
            &larr; Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">Simulation Report Card</h1>
          <p className="text-slate-300">Session ID: {sessionId}</p>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-10 border-b pb-8">
            <span className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Overall Score</span>
            <div className={'text-6xl font-black ' + (report.overallScore >= 70 ? 'text-green-500' : 'text-red-500')}>
              {report.overallScore}<span className="text-3xl text-slate-300">/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 p-4 rounded-xl border">
              <div className="text-sm text-slate-500 font-semibold mb-1">Professionalism</div>
              <div className={'text-3xl font-bold ' + getScoreColor(report.professionalism)}>{report.professionalism}/10</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border">
              <div className="text-sm text-slate-500 font-semibold mb-1">De-Escalation</div>
              <div className={'text-3xl font-bold ' + getScoreColor(report.deEscalation)}>{report.deEscalation}/10</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border">
              <div className="text-sm text-slate-500 font-semibold mb-1">Problem Solving</div>
              <div className={'text-3xl font-bold ' + getScoreColor(report.problemSolving)}>{report.problemSolving}/10</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border">
              <div className="text-sm text-slate-500 font-semibold mb-1">Empathy</div>
              <div className={'text-3xl font-bold ' + getScoreColor(report.empathy)}>{report.empathy}/10</div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="text-xl">🤖</span> Judge's Feedback
            </h3>
            <p className="text-indigo-800 leading-relaxed">
              {report.feedback}
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
             <button 
                onClick={() => navigate('/chat')}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-md transition"
              >
                Start Another Simulation
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
