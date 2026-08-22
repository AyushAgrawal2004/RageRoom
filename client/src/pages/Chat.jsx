import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; 

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SILENCE_THRESHOLD = 2500; 
const TOTAL_SILENCE_TIMEOUT = 10000; 

function Chat({ user }) {
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [customFactors, setCustomFactors] = useState(null);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [crmData, setCrmData] = useState(null);
  
  const [inputMode, setInputMode] = useState('chat');
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [autoMessage, setAutoMessage] = useState(null);
  
  const [currentFactors, setCurrentFactors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEnding, setIsEnding] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  
  const inputModeRef = useRef(inputMode);
  const transcriptRef = useRef('');
  const lastSpeechTimestamp = useRef(0);
  const silenceCheckIntervalRef = useRef(null);
  const totalSilenceTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    inputModeRef.current = inputMode;
  }, [inputMode]);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await axios.get('http://localhost:5005/api/personas');
        setPersonas(res.data);
        if (res.data.length > 0) {
          setSelectedPersona(res.data[0]);
          setCustomFactors({...res.data[0].startingFactors});
        }
      } catch (err) {
        console.error('Failed to load personas:', err);
        setError('Could not load personas from server.');
      }
    };
    fetchPersonas();

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }

    return () => {
      if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
      if (totalSilenceTimeoutRef.current) clearTimeout(totalSilenceTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        transcriptRef.current = '';
        isSubmittingRef.current = false;
        lastSpeechTimestamp.current = Date.now();
        setAutoMessage(null);

        if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
        if (totalSilenceTimeoutRef.current) clearTimeout(totalSilenceTimeoutRef.current);

        totalSilenceTimeoutRef.current = setTimeout(() => {
          if (transcriptRef.current.trim() === '') {
            recognitionRef.current.stop();
            setAutoMessage("Didn't catch that — tap the mic to try again");
          }
        }, TOTAL_SILENCE_TIMEOUT);

        silenceCheckIntervalRef.current = setInterval(() => {
          if (transcriptRef.current.trim() !== '') {
            if (Date.now() - lastSpeechTimestamp.current > SILENCE_THRESHOLD) {
              clearInterval(silenceCheckIntervalRef.current);
              setAutoMessage("Silence detected, sending...");
              recognitionRef.current.stop();
              
              if (!isSubmittingRef.current) {
                isSubmittingRef.current = true;
                sendMessage(transcriptRef.current, 'voice');
              }
            }
          }
        }, 500);
      };

      recognitionRef.current.onresult = (event) => {
        lastSpeechTimestamp.current = Date.now();
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }
        transcriptRef.current = fullTranscript;
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
        if (totalSilenceTimeoutRef.current) clearTimeout(totalSilenceTimeoutRef.current);
        
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setError('Microphone error: ' + event.error);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
        if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
        if (totalSilenceTimeoutRef.current) clearTimeout(totalSilenceTimeoutRef.current);

        if (!isSubmittingRef.current && transcriptRef.current.trim() !== '') {
          isSubmittingRef.current = true;
          sendMessage(transcriptRef.current, 'voice');
        }
      };
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
              if (err.name === 'InvalidStateError') {
                setIsRecording(true);
              }
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
      const response = await axios.post('http://localhost:5005/api/start', {
        personaId: selectedPersona.id,
        customFactors: customFactors,
        userId: user ? user.id : null
      });
      setSessionId(response.data.sessionId);
      setMessages([response.data.message]);
      setCurrentFactors(response.data.message.factors);
      setCrmData(response.data.crmData); // Save generated CRM data
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
        console.error("Failed to start recording:", err);
        if (err.name === 'InvalidStateError') {
          setIsRecording(true);
        }
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
    setError(null);
    setAutoMessage(null);

    const newMessages = [...messages, { role: 'user', content: userMsg, inputMode: modeUsed }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5005/api/chat', {
        sessionId,
        personaId: selectedPersona.id,
        currentFactors: currentFactors,
        conversationHistory: newMessages.slice(0, -1),
        userMessage: userMsg,
        inputMode: modeUsed,
        crmData: crmData // Pass CRM data to backend so AI can reference it
      });

      const aiReply = response.data.reply;
      const aiFactors = response.data.factors;
      const aiCategory = response.data.category;
      const aiDeltas = response.data.deltas;

      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: aiReply, 
          factors: aiFactors, 
          category: aiCategory,
          deltas: aiDeltas 
        }
      ]);
      setCurrentFactors(aiFactors);
      speakText(aiReply);
    } catch (err) {
      console.error('Error sending message:', err);
      const apiError = err.response?.data?.details || err.response?.data?.error || err.message;
      setError('Failed to get a response: ' + apiError);
    } finally {
      setLoading(false);
    }
  };

  const handleFactorChange = (factor, value) => {
    setCustomFactors(prev => ({
      ...prev,
      [factor]: parseInt(value, 10)
    }));
  };

  const handlePersonaSelect = (p) => {
    setSelectedPersona(p);
    setCustomFactors({...p.startingFactors});
  };

  const getFactorColor = (factor, value) => {
    if (factor === 'frustration') {
      if (value >= 8) return 'bg-red-500';
      if (value >= 5) return 'bg-yellow-400';
      return 'bg-green-500';
    } else {
      if (value <= 3) return 'bg-red-500';
      if (value <= 6) return 'bg-yellow-400';
      return 'bg-green-500';
    }
  };

  const formatDelta = (val) => {
    if (val > 0) return '+' + val;
    if (val < 0) return val.toString();
    return '0';
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col p-4">
      {/* Header */}
      <header className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center rounded-xl shadow-md mb-4 shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-3">
          <span className="text-2xl">⚡️</span> 
          Difficult Customer Simulator
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-700 rounded-lg p-1">
            <button 
              onClick={() => setInputMode('chat')}
              className={'px-4 py-1.5 text-sm rounded-md transition ' + (inputMode === 'chat' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-300 hover:text-white')}
            >
              Chat Mode
            </button>
            <button 
              onClick={() => setInputMode('voice')}
              className={'px-4 py-1.5 text-sm rounded-md transition ' + (inputMode === 'voice' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-300 hover:text-white')}
            >
              Voice Mode
            </button>
          </div>

          {sessionActive ? (
            <button 
              onClick={endSession}
              disabled={isEnding}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow transition disabled:opacity-50"
            >
              {isEnding ? 'Grading...' : 'End Session'}
            </button>
          ) : (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-bold shadow transition"
            >
              &larr; Dashboard
            </button>
          )}
        </div>
      </header>

      {!sessionActive ? (
        <div className="flex-1 flex flex-col items-center justify-center">
           <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">Setup Training Scenario</h2>
              {error && <div className="text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg mb-6 text-center">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-700 border-b pb-2">1. Choose Persona</h3>
                  {personas.length === 0 ? (
                    <p className="text-slate-500">Loading personas...</p>
                  ) : (
                    <div className="space-y-3">
                      {personas.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => handlePersonaSelect(p)}
                          className={'p-4 border rounded-xl cursor-pointer transition ' + (selectedPersona?.id === p.id ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' : 'hover:bg-slate-50')}
                        >
                          <h4 className="font-bold text-slate-800">{p.name}</h4>
                          <p className="text-sm text-slate-600 mt-1">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-700 border-b pb-2">2. Customize Starting State</h3>
                  {selectedPersona && customFactors ? (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner space-y-5">
                      {Object.keys(customFactors).map(factor => (
                        <div key={factor} className="flex flex-col gap-2">
                          <div className="flex justify-between text-sm font-bold text-slate-700 capitalize">
                            <span>{factor}</span>
                            <span className="bg-white px-2 py-0.5 rounded shadow-sm">{customFactors[factor]}/10</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" max="10" 
                            value={customFactors[factor]}
                            onChange={(e) => handleFactorChange(factor, e.target.value)}
                            className="w-full accent-blue-600"
                          />
                        </div>
                      ))}
                      
                      <button 
                        onClick={startSession}
                        disabled={loading}
                        className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg shadow-lg transition disabled:opacity-50"
                      >
                        {loading ? 'Generating Customer...' : 'Start Session'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Select a persona first.</p>
                  )}
                </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden">
          
          {/* CRM Dashboard Sidebar */}
          <div className="w-80 bg-white rounded-xl shadow-lg flex flex-col shrink-0 border border-slate-200">
            <div className="bg-slate-100 p-4 border-b border-slate-200 rounded-t-xl">
              <h2 className="font-black text-slate-700 flex items-center gap-2">
                <span className="text-blue-600">📊</span> CRM Dashboard
              </h2>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              {crmData ? (
                Object.entries(crmData).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-slate-800 font-semibold">{value}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400 italic">No CRM data available.</div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden border border-slate-200 relative">
            
            {/* Factors Top Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 shrink-0 shadow-sm z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-slate-800 text-lg">{selectedPersona.name}</span>
                <span className="text-[10px] text-white bg-slate-800 px-2 py-1 rounded uppercase tracking-widest font-bold">Live Emotional State</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Object.keys(currentFactors).map(factor => (
                  <div key={factor} className="flex flex-col gap-1.5 bg-white p-2.5 rounded-lg shadow-sm border border-slate-100">
                    <div className="flex justify-between text-[11px] font-black text-slate-500 capitalize tracking-wide">
                      <span>{factor}</span>
                      <span>{currentFactors[factor]}/10</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={'h-full transition-all duration-1000 ease-out ' + getFactorColor(factor, currentFactors[factor])}
                        style={{ width: (currentFactors[factor] * 10) + '%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={'flex flex-col ' + (msg.role === 'user' ? 'items-end' : 'items-start')}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {msg.role === 'user' && msg.inputMode === 'voice' && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm border border-blue-200">
                        🎤 Voice Match
                      </span>
                    )}
                  </div>
                  <div 
                    className={'max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-[15px] ' + (
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  
                  {/* Classifier & Deltas Badge */}
                  {msg.role === 'assistant' && msg.category && msg.category !== 'initial' && (
                    <div className="mt-2 text-xs bg-white border border-slate-200 rounded-lg shadow-sm max-w-[75%] overflow-hidden">
                      <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100 font-semibold text-slate-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm"></span>
                        Behavior logic: <span className="font-black text-indigo-700 uppercase tracking-wider">{msg.category}</span>
                      </div>
                      {msg.deltas && Object.keys(msg.deltas).length > 0 && (
                        <div className="px-3 py-2 flex flex-wrap gap-3 text-[11px] uppercase tracking-wider">
                          {Object.values(msg.deltas).every(v => v === 0) ? (
                            <span className="text-slate-400 italic normal-case tracking-normal">Max/Min limits reached (or neutral). No effect.</span>
                          ) : (
                            Object.entries(msg.deltas).map(([f, change], i) => {
                              if (change === 0) return null;
                              const isPositive = change > 0;
                              const isFrustration = f === 'frustration';
                              const isGood = isFrustration ? !isPositive : isPositive;
                              return (
                                <div key={i} className={'flex items-center gap-1 font-black ' + (isGood ? 'text-emerald-600' : 'text-rose-500')}>
                                  <span className="capitalize">{f}</span>
                                  <span>{formatDelta(change)}</span>
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
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-400 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex gap-1.5 items-center">
                    <span className="animate-bounce h-2 w-2 bg-slate-300 rounded-full"></span>
                    <span className="animate-bounce h-2 w-2 bg-slate-300 rounded-full" style={{ animationDelay: '0.2s' }}></span>
                    <span className="animate-bounce h-2 w-2 bg-slate-300 rounded-full" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-200 shadow-sm mx-auto max-w-lg">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_15px_rgba(0,0,0,0.02)] relative shrink-0">
              
              {/* Auto Message Pill */}
              {autoMessage && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg animate-bounce tracking-wide">
                  {autoMessage}
                </div>
              )}

              {inputMode === 'chat' ? (
                <form onSubmit={handleSendForm} className="flex gap-3">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your reply to the customer..."
                    disabled={loading}
                    className="flex-1 px-5 py-3.5 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 transition shadow-inner"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="px-8 py-3.5 bg-blue-600 text-white font-black rounded-full hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:shadow-none transform active:scale-95"
                  >
                    Send
                  </button>
                </form>
              ) : (
                <div className="flex justify-center items-center h-[54px]">
                  {!SpeechRecognition ? (
                    <div className="text-rose-500 font-bold bg-rose-50 px-6 py-2 rounded-full border border-rose-200">
                      Voice input is not supported in this browser. Please use Chat Mode.
                    </div>
                  ) : (
                    <button
                      onClick={toggleRecording}
                      disabled={loading || isSubmittingRef.current}
                      className={'flex items-center gap-3 px-12 py-3.5 rounded-full font-black text-white transition-all shadow-md ' + 
                        (isRecording 
                          ? 'bg-rose-500 hover:bg-rose-600 animate-pulse shadow-rose-200' 
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200') + 
                        ((loading || isSubmittingRef.current) ? ' opacity-50 cursor-not-allowed transform-none' : ' hover:-translate-y-0.5 active:scale-95')}
                    >
                      {isRecording ? (
                        <>
                          <span className="w-3 h-3 bg-white rounded-full"></span>
                          Listening... (Auto-submits on pause)
                        </>
                      ) : (
                        <>
                          <span className="text-lg">🎤</span>
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
      )}
    </div>
  );
}

export default Chat;
