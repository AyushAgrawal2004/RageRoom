import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Mic, MessageSquare, Send, StopCircle, ArrowLeft, BrainCircuit } from 'lucide-react';
import '../App.css'; 

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SILENCE_THRESHOLD = 2500; 
const TOTAL_SILENCE_TIMEOUT = 10000; 

function Chat({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPersonaId = location.state?.selectedPersonaId;

  const [persona, setPersona] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [crmData, setCrmData] = useState(null);
  
  const [inputMode, setInputMode] = useState('chat');
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [autoMessage, setAutoMessage] = useState(null);
  
  const [currentFactors, setCurrentFactors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnding, setIsEnding] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const inputModeRef = useRef(inputMode);
  const transcriptRef = useRef('');
  const lastSpeechTimestamp = useRef(0);
  const silenceCheckIntervalRef = useRef(null);
  const totalSilenceTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!selectedPersonaId) {
      navigate('/scenarios');
    } else {
      startSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPersonaId]);

  useEffect(() => {
    inputModeRef.current = inputMode;
  }, [inputMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
      clearInterval(silenceCheckIntervalRef.current);
      clearTimeout(totalSilenceTimeoutRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        if (inputModeRef.current === 'voice' && !isRecording && SpeechRecognition) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (err) {
              if (err.name === 'InvalidStateError') setIsRecording(true);
            }
          }, 400); 
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const startSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('rageroom_token');
      const response = await axios.post('http://localhost:5005/api/start', {
        personaId: selectedPersonaId,
        userId: user ? user.id || user._id : null
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setPersona(response.data.persona);
      setSessionId(response.data.sessionId);
      setMessages([response.data.message]);
      setCurrentFactors(response.data.message.factors);
      setCrmData(response.data.crmData);
      setSessionActive(true);
      speakText(response.data.message.content);
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount < 3) {
      const confirmEnd = window.confirm(`You've only sent ${userMessageCount} message(s). Ending the session this early will negatively impact your Problem Solving score. Are you sure you want to end?`);
      if (!confirmEnd) return;
    }

    window.speechSynthesis.cancel();
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    
    setIsEnding(true);
    try {
      await axios.post('http://localhost:5005/api/end', { sessionId });
      navigate(`/report/${sessionId}`);
    } catch (err) {
      console.error('Failed to generate report card:', err);
      alert('Failed to generate report card. The session is over, but grading failed.');
      navigate('/dashboard');
    }
  };

  const toggleRecording = () => {
    if (!SpeechRecognition) {
      setError("Your browser does not support Speech Recognition. Please use Chrome or fall back to Chat Mode.");
      return;
    }
    setError(null);
    setAutoMessage(null);
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        if (err.name === 'InvalidStateError') setIsRecording(true);
      }
    }
  };

  const handleSendForm = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim(), 'chat');
    setInput('');
  };

  const sendMessage = async (userMsg, modeUsed) => {
    if (!userMsg) return;
    
    const newMessages = [...messages, { role: 'user', content: userMsg, inputMode: modeUsed }];
    setMessages(newMessages);
    setLoading(true);
    setError(null);
    
    window.speechSynthesis.cancel();
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    try {
      const response = await axios.post('http://localhost:5005/api/chat', {
        sessionId,
        personaId: selectedPersonaId,
        currentFactors: currentFactors,
        conversationHistory: newMessages.slice(0, -1),
        userMessage: userMsg,
        inputMode: modeUsed,
        crmData: crmData
      });

      const assistantMsg = response.data;
      setMessages([...newMessages, assistantMsg]);
      setCurrentFactors(assistantMsg.factors);
      
      if (assistantMsg.category === 'escalate' || assistantMsg.category === 'hangup') {
        alert(assistantMsg.category === 'hangup' ? "The customer hung up on you!" : "The customer demanded to speak to a manager!");
        endSession();
        return;
      }
      
      speakText(assistantMsg.content);

    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to send message. Please try again.');
      setMessages(messages); // Revert on failure
    } finally {
      setLoading(false);
    }
  };

  // --- Speech Recognition Setup ---
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
      isSubmittingRef.current = false;
      transcriptRef.current = '';
      lastSpeechTimestamp.current = Date.now();

      totalSilenceTimeoutRef.current = setTimeout(() => {
        if (isRecording && transcriptRef.current.trim() === '') {
          setAutoMessage("Session paused. Take your time.");
          recognition.stop();
        }
      }, TOTAL_SILENCE_TIMEOUT);

      silenceCheckIntervalRef.current = setInterval(() => {
        if (isSubmittingRef.current || !isRecording) return;
        
        const now = Date.now();
        const timeSinceLastSpeech = now - lastSpeechTimestamp.current;
        const currentTranscript = transcriptRef.current.trim();
        
        if (timeSinceLastSpeech > SILENCE_THRESHOLD && currentTranscript.length > 0) {
          isSubmittingRef.current = true;
          recognition.stop();
          sendMessage(currentTranscript, 'voice');
          transcriptRef.current = '';
        }
      }, 500);
    };

    recognition.onresult = (event) => {
      lastSpeechTimestamp.current = Date.now();
      
      if (totalSilenceTimeoutRef.current) {
        clearTimeout(totalSilenceTimeoutRef.current);
        totalSilenceTimeoutRef.current = null;
      }

      let interimTranscript = '';
      let finalTranscriptChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptChunk += transcriptSegment + ' ';
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      if (finalTranscriptChunk) {
        transcriptRef.current += finalTranscriptChunk;
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      clearInterval(silenceCheckIntervalRef.current);
      clearTimeout(totalSilenceTimeoutRef.current);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (event.error !== 'no-speech') {
        setIsRecording(false);
      }
    };

  }, [sessionId]); 
  // --- End Speech Recognition Setup ---

  const getFactorColor = (factor, value) => {
    if (factor === 'frustration') {
      if (value >= 8) return 'bg-rose-500';
      if (value >= 5) return 'bg-amber-400';
      return 'bg-emerald-500';
    } else {
      if (value <= 3) return 'bg-rose-500';
      if (value <= 6) return 'bg-amber-400';
      return 'bg-emerald-500';
    }
  };

  const formatDelta = (val) => {
    if (val > 0) return '+' + val;
    if (val < 0) return val.toString();
    return '0';
  };

  if (loading && !sessionActive) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60 px-6 h-16 flex justify-between items-center shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/scenarios')} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shadow-inner border border-slate-200">
              {persona?.avatarUrl && <img src={persona.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />}
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">{persona?.name || 'Customer'}</h1>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Simulation Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner">
            <button 
              onClick={() => setInputMode('chat')}
              className={'px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ' + (inputMode === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900')}
            >
              <MessageSquare size={14} /> Text
            </button>
            <button 
              onClick={() => setInputMode('voice')}
              className={'px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ' + (inputMode === 'voice' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900')}
            >
              <Mic size={14} /> Voice
            </button>
          </div>

          <button 
            onClick={endSession}
            disabled={isEnding}
            className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isEnding ? 'Grading...' : <><StopCircle size={14}/> End Session</>}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (CRM Data & Factors) */}
        <aside className="w-[320px] bg-white border-r border-slate-200/60 flex flex-col shrink-0 overflow-y-auto">
          
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Customer Status</h3>
            <div className="space-y-4">
              {Object.entries(currentFactors).map(([factor, value]) => (
                <div key={factor}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="capitalize text-slate-700">{factor}</span>
                    <span className="text-slate-900">{value}/10</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${getFactorColor(factor, value)}`} 
                      style={{ width: `${(value / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">CRM Profile</h3>
            {crmData && (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
                {Object.entries(crmData).map(([key, val]) => (
                  <div key={key}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="text-sm font-semibold text-slate-900">{val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#F9FAFB] relative">
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}>
                
                {msg.role === 'assistant' && idx > 0 && (
                  <div className="flex items-center gap-2 mb-2 ml-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                       {persona?.avatarUrl && <img src={persona.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-xs font-bold text-slate-500">{persona?.name}</span>
                  </div>
                )}

                <div 
                  className={`max-w-[75%] rounded-[24px] px-6 py-4 shadow-sm text-[15px] font-medium leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#111] text-white rounded-tr-sm' 
                      : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200/60'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {/* AI Classifier Badges */}
                {msg.role === 'assistant' && msg.category && msg.category !== 'initial' && (
                  <div className="mt-3 bg-white border border-slate-200 rounded-[16px] shadow-sm max-w-[75%] overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                      <BrainCircuit size={14} className="text-indigo-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Behavior Logic:</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{msg.category}</span>
                    </div>
                    {msg.deltas && Object.keys(msg.deltas).length > 0 && (
                      <div className="px-4 py-2.5 flex flex-wrap gap-4 bg-white">
                        {Object.values(msg.deltas).every(v => v === 0) ? (
                          <span className="text-xs font-semibold text-slate-400">Limits reached. No effect.</span>
                        ) : (
                          Object.entries(msg.deltas).map(([f, change], i) => {
                            if (change === 0) return null;
                            const isPositive = change > 0;
                            const isFrustration = f === 'frustration';
                            const isGood = isFrustration ? !isPositive : isPositive;
                            return (
                              <div key={i} className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${isGood ? 'text-emerald-600' : 'text-rose-500'}`}>
                                <span>{f}</span>
                                <span className={`px-1.5 py-0.5 rounded-md ${isGood ? 'bg-emerald-50' : 'bg-rose-50'}`}>{formatDelta(change)}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start animate-slide-up">
                <div className="bg-white border border-slate-200 rounded-[24px] rounded-tl-sm px-6 py-5 w-2/3 max-w-[300px] flex flex-col gap-3 shadow-sm">
                  <div className="h-3 w-full bg-slate-100 rounded-full animate-pulse"></div>
                  <div className="h-3 w-5/6 bg-slate-100 rounded-full animate-pulse"></div>
                  <div className="h-3 w-4/6 bg-slate-100 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-[16px] text-center text-sm font-bold border border-rose-200 shadow-sm mx-auto max-w-lg">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-6 bg-white border-t border-slate-200/60 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] relative shrink-0">
            
            {autoMessage && (
              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl animate-bounce">
                {autoMessage}
              </div>
            )}

            {inputMode === 'chat' ? (
              <form onSubmit={handleSendForm} className="flex gap-4 max-w-4xl mx-auto">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your reply to the customer..."
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-50 transition-all shadow-inner font-medium text-[15px]"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-8 py-4 bg-[#111] text-white font-bold rounded-full hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center gap-2"
                >
                  Send <Send size={16} />
                </button>
              </form>
            ) : (
              <div className="flex justify-center items-center py-2 max-w-4xl mx-auto">
                {!SpeechRecognition ? (
                  <div className="text-rose-600 font-bold bg-rose-50 px-6 py-3 rounded-full border border-rose-200 text-sm">
                    Voice input is not supported in this browser. Please use Text Mode.
                  </div>
                ) : (
                  <button
                    onClick={toggleRecording}
                    disabled={loading || isSubmittingRef.current}
                    className={`relative flex items-center justify-center gap-3 px-12 py-4 rounded-full font-bold text-white transition-all shadow-xl ${
                      isRecording 
                        ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' 
                        : 'bg-[#111] hover:bg-black shadow-black/10'
                    } ${(loading || isSubmittingRef.current) ? 'opacity-50 cursor-not-allowed scale-100' : 'active:scale-95'}`}
                  >
                    {isRecording && (
                      <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>
                    )}
                    {isRecording ? (
                      <>
                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                        Listening... (Auto-submits on pause)
                      </>
                    ) : (
                      <>
                        <Mic size={18} />
                        {loading ? 'Sending...' : 'Tap to Start Listening'}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
