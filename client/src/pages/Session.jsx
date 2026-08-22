import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Mic, MessageSquare, Send, StopCircle, ArrowLeft, BrainCircuit, PhoneCall } from 'lucide-react';
import '../App.css'; 

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SILENCE_THRESHOLD = 1500; 
const TOTAL_SILENCE_TIMEOUT = 10000; 

function Session({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPersonaId = location.state?.selectedPersonaId;
  const mode = location.state?.mode || 'chat';

  const [persona, setPersona] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [crmData, setCrmData] = useState(null);
  
  const [inputMode, setInputMode] = useState(location.state?.mode || 'chat');
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [autoMessage, setAutoMessage] = useState(null);
  
  const [currentFactors, setCurrentFactors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnding, setIsEnding] = useState(false);
  const [isCustomerSpeaking, setIsCustomerSpeaking] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const inputModeRef = useRef(inputMode);
  const transcriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const lastSpeechTimestamp = useRef(0);
  const silenceCheckIntervalRef = useRef(null);
  const totalSilenceTimeoutRef = useRef(null);
    const isSubmittingRef = useRef(false);
  
  const sendMessageRef = useRef(null);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

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
      // // window.speechSynthesis.cancel(); removed to prevent Chrome freezing bug removed to prevent Chrome freezing bug
    };
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // window.speechSynthesis.cancel(); removed to prevent Chrome freezing bug
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => setIsCustomerSpeaking(true);
      
      utterance.onend = () => {
        setIsCustomerSpeaking(false);
        if (inputModeRef.current === 'call' && !isRecording && SpeechRecognition) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (err) {
              if (err.name === 'InvalidStateError') {
                setIsRecording(true);
              }
            }
          }, 400); 
        }
      };

      // Fix for GC bug, just safely keep reference
      window.currentUtterance = utterance;
      
      // Removed the custom voice selection that might be breaking it
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
      // TTS is only used for Voice Call mode, which is triggered via handleAcceptCall
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

    // window.speechSynthesis.cancel(); removed to prevent Chrome freezing bug
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

  
  const handleAcceptCall = () => {
    setIsCallAccepted(true);
    if (messages.length > 0) {
      speakText(messages[0].content);
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
    
    // window.speechSynthesis.cancel(); removed to prevent Chrome freezing bug
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

      const assistantMsg = {
        role: 'assistant',
        content: response.data.reply,
        factors: response.data.factors,
        category: response.data.category,
        deltas: response.data.deltas
      };
      setMessages([...newMessages, assistantMsg]);
      setCurrentFactors(assistantMsg.factors);
      
      if (assistantMsg.category === 'escalate' || assistantMsg.category === 'hangup') {
        alert(assistantMsg.category === 'hangup' ? "The customer hung up on you!" : "The customer demanded to speak to a manager!");
        endSession();
        return;
      }
      
      if (inputModeRef.current === 'call') {
        speakText(assistantMsg.content);
      }

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
      interimTranscriptRef.current = '';
      lastSpeechTimestamp.current = Date.now();

      totalSilenceTimeoutRef.current = setTimeout(() => {
        if (isRecording && transcriptRef.current.trim() === '') {
          setAutoMessage("Session paused. Take your time.");
          recognition.stop();
        }
      }, TOTAL_SILENCE_TIMEOUT);

      silenceCheckIntervalRef.current = setInterval(() => {
        if (isSubmittingRef.current) return; // Removed stale closure check for isRecording
        
        const now = Date.now();
        const timeSinceLastSpeech = now - lastSpeechTimestamp.current;
        const currentTranscript = (transcriptRef.current + ' ' + (interimTranscriptRef.current || '')).trim();
        
        if (timeSinceLastSpeech > SILENCE_THRESHOLD && currentTranscript.length > 0) {
          isSubmittingRef.current = true;
          recognition.stop();
          if (sendMessageRef.current) sendMessageRef.current(currentTranscript, 'call');
          transcriptRef.current = '';
          interimTranscriptRef.current = '';
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

      interimTranscriptRef.current = interimTranscript;
      
      if (finalTranscriptChunk) {
        transcriptRef.current += finalTranscriptChunk;
        interimTranscriptRef.current = '';
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
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/60 px-6 h-16 flex justify-between items-center shrink-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] z-10 relative">
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
          <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 shadow-inner flex items-center gap-2">
            {mode === 'call' ? <><PhoneCall size={14}/> Voice Call Active</> : <><MessageSquare size={14}/> Text Chat Active</>}
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
        <aside className="w-[320px] bg-white/50 backdrop-blur-md border-r border-white/60 flex flex-col shrink-0 overflow-y-auto shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-10 relative">
          
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

        {/* Main Interaction Area */}
        <div className="flex-1 flex flex-col bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/30 via-[#F9FAFB] to-[#F9FAFB] relative overflow-hidden">
          
          {mode === 'call' ? (
            // ==========================================
            // VOICE CALL UI
            // ==========================================
            <div className="flex-1 flex flex-col items-center justify-center relative p-8">
              
              
              {!isCallAccepted ? (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md rounded-3xl m-4">
                  <div className={`w-32 h-32 rounded-full overflow-hidden border-[6px] border-white shadow-2xl mb-6 bg-white ${!loading ? 'animate-bounce' : ''}`}>
                    {persona?.avatarUrl ? <img src={persona?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200"></div>}
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{loading ? 'Connecting...' : 'Incoming Call...'}</h2>
                  <p className="text-slate-200 font-bold mb-12">{persona?.name}</p>
                  
                  <button 
                    onClick={handleAcceptCall}
                    disabled={loading}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${loading ? 'bg-slate-500 cursor-not-allowed opacity-50' : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-110 active:scale-95'} text-white`}
                  >
                    <PhoneCall size={32} />
                  </button>
                  <p className={`font-bold mt-4 uppercase tracking-widest text-xs ${loading ? 'text-slate-300' : 'text-emerald-400'}`}>{loading ? 'Dialing...' : 'Accept'}</p>
                </div>
              ) : null}
              {/* Pulsing rings when speaking */}
              <div className="relative flex items-center justify-center">
                {isCustomerSpeaking && (
                  <>
                    <div className="absolute w-[300px] h-[300px] bg-indigo-500/20 rounded-full animate-ping"></div>
                    <div className="absolute w-[400px] h-[400px] bg-indigo-500/10 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  </>
                )}
                
                <div className="relative z-10 w-[200px] h-[200px] rounded-full overflow-hidden bg-white border-[8px] border-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] mb-8">
                   {persona?.avatarUrl ? <img src={persona.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200"></div>}
                </div>
              </div>

              <div className="text-center z-10">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">{persona?.name}</h2>
                <div className="h-8 flex items-center justify-center">
                  {isCustomerSpeaking ? (
                    <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-sm uppercase">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                      Speaking...
                    </div>
                  ) : loading ? (
                    <div className="flex items-center gap-2 text-slate-400 font-bold tracking-widest text-sm uppercase">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                      Thinking...
                    </div>
                  ) : (
                    <div className="text-slate-400 font-bold tracking-widest text-sm uppercase">
                      Listening
                    </div>
                  )}
                </div>
              </div>

              {/* Call Controls */}
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-10 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                
                <button
                  onClick={toggleRecording}
                  disabled={loading || isSubmittingRef.current || isCustomerSpeaking}
                  className={`relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.2),0_10px_20px_rgba(0,0,0,0.1)] active:shadow-[0_0px_0_rgba(0,0,0,0)] active:translate-y-[4px] transition-all ${
                    isRecording 
                      ? 'bg-gradient-to-b from-rose-400 to-rose-500 text-white shadow-[0_4px_0_#9f1239,0_10px_20px_rgba(225,29,72,0.3)]' 
                      : 'bg-gradient-to-b from-slate-100 to-slate-200 text-slate-700 shadow-[0_4px_0_#cbd5e1,0_10px_20px_rgba(0,0,0,0.05)]'
                  } ${(loading || isSubmittingRef.current || isCustomerSpeaking) ? 'opacity-50 cursor-not-allowed scale-100' : 'hover:brightness-110'}`}
                >
                  {isRecording && <div className="absolute inset-0 rounded-2xl border-[3px] border-rose-400 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>}
                  <Mic size={32} />
                </button>

                <button 
                  onClick={endSession}
                  disabled={isEnding}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_4px_0_#9f1239,0_10px_20px_rgba(225,29,72,0.3)] active:shadow-[0_0px_0_#9f1239,0_0px_0_rgba(0,0,0,0)] active:translate-y-[4px] hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isEnding ? <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <PhoneCall size={32} className="rotate-[135deg]" />}
                </button>
              </div>

              {error && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-rose-50 text-rose-600 px-6 py-3 rounded-full text-sm font-bold border border-rose-200 shadow-sm">
                  {error}
                </div>
              )}
            </div>

          ) : (

            // ==========================================
            // TEXT CHAT UI
            // ==========================================
            <>
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
                      className={`max-w-[75%] rounded-[24px] px-6 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.04)] text-[15px] font-medium leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-tr-[4px] border-t border-indigo-400' 
                          : 'bg-white text-slate-800 rounded-tl-[4px] border border-white/60'
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
                    <div className="bg-white border border-slate-200 rounded-[24px] rounded-tl-sm px-6 py-5 w-2/3 max-w-[300px] flex flex-col gap-3 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
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
              <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-white/60 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] relative shrink-0 z-10">
                <form onSubmit={handleSendForm} className="flex gap-4 max-w-4xl mx-auto">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your reply to the customer..."
                    disabled={loading}
                    className="flex-1 px-6 py-4 bg-white/50 backdrop-blur-sm border border-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] font-medium text-[15px]"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="px-8 py-4 bg-gradient-to-b from-slate-800 to-slate-900 text-white font-bold rounded-full hover:brightness-110 transition-all shadow-[0_4px_0_#0f172a,0_10px_20px_rgba(0,0,0,0.1)] active:shadow-[0_0px_0_#0f172a,0_0px_0_rgba(0,0,0,0)] disabled:opacity-50 disabled:shadow-none active:translate-y-[4px] flex items-center gap-2"
                  >
                    Send <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Session;
