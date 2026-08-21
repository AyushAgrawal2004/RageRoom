import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css'; 

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SILENCE_THRESHOLD = 2500; // ms of silence before auto-submit
const TOTAL_SILENCE_TIMEOUT = 10000; // ms of total silence before giving up

function App() {
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [customFactors, setCustomFactors] = useState(null);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Input states
  const [inputMode, setInputMode] = useState('chat'); // 'chat' or 'voice'
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [autoMessage, setAutoMessage] = useState(null);
  
  const [currentFactors, setCurrentFactors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Refs for tracking voice auto-submit logic
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

  // Update speech recognition callbacks so they always have the latest state closures
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        transcriptRef.current = '';
        isSubmittingRef.current = false;
        lastSpeechTimestamp.current = Date.now();
        setAutoMessage(null);

        // Clear any existing timers
        if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
        if (totalSilenceTimeoutRef.current) clearTimeout(totalSilenceTimeoutRef.current);

        // Start total silence timeout
        totalSilenceTimeoutRef.current = setTimeout(() => {
          if (transcriptRef.current.trim() === '') {
            recognitionRef.current.stop();
            setAutoMessage("Didn't catch that — tap the mic to try again");
          }
        }, TOTAL_SILENCE_TIMEOUT);

        // Start silence checking interval
        silenceCheckIntervalRef.current = setInterval(() => {
          if (transcriptRef.current.trim() !== '') {
            if (Date.now() - lastSpeechTimestamp.current > SILENCE_THRESHOLD) {
              // Silence detected!
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

        // If stopped manually and there's text, and we haven't submitted yet
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
          }, 400); // Small delay so it's not jarring
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
        customFactors: customFactors
      });
      setSessionId(response.data.sessionId);
      setMessages([response.data.message]);
      setCurrentFactors(response.data.message.factors);
      setSessionActive(true);
      speakText(response.data.message.content);
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const endSession = () => {
    setSessionActive(false);
    setSessionId(null);
    setMessages([]);
    setCurrentFactors({});
    window.speechSynthesis.cancel();
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
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
        inputMode: modeUsed
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <header className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Difficult Customer Simulator</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button 
                onClick={() => setInputMode('chat')}
                className={'px-3 py-1 text-sm rounded-md transition ' + (inputMode === 'chat' ? 'bg-blue-600 text-white font-semibold shadow' : 'text-slate-300 hover:text-white')}
              >
                Chat Mode
              </button>
              <button 
                onClick={() => setInputMode('voice')}
                className={'px-3 py-1 text-sm rounded-md transition ' + (inputMode === 'voice' ? 'bg-blue-600 text-white font-semibold shadow' : 'text-slate-300 hover:text-white')}
              >
                Voice Mode
              </button>
            </div>

            {sessionActive && (
              <button 
                onClick={endSession}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition"
              >
                End Session
              </button>
            )}
          </div>
        </header>

        {!sessionActive ? (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Setup Training Scenario</h2>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-700 border-b pb-2">1. Choose Persona</h3>
                {personas.length === 0 ? (
                  <p className="text-gray-500">Loading personas...</p>
                ) : (
                  <div className="space-y-3">
                    {personas.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => handlePersonaSelect(p)}
                        className={'p-4 border rounded-lg cursor-pointer transition ' + (selectedPersona?.id === p.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'hover:bg-gray-50')}
                      >
                        <h4 className="font-bold text-gray-800">{p.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-700 border-b pb-2">2. Customize Starting State</h3>
                {selectedPersona && customFactors ? (
                  <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    {Object.keys(customFactors).map(factor => (
                      <div key={factor} className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm font-medium text-gray-700 capitalize">
                          <span>{factor}</span>
                          <span>{customFactors[factor]}/10</span>
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
                      className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition disabled:opacity-50"
                    >
                      {loading ? 'Starting...' : 'Start Session'}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">Select a persona first.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Factors Dashboard */}
            <div className="bg-slate-50 border-b px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">{selectedPersona.name}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Live Emotional State</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.keys(currentFactors).map(factor => (
                  <div key={factor} className="flex flex-col gap-1 bg-white p-2 rounded shadow-sm border border-gray-100">
                    <div className="flex justify-between text-xs font-semibold text-gray-600 capitalize">
                      <span>{factor}</span>
                      <span>{currentFactors[factor]}/10</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={'h-full transition-all duration-1000 ease-in-out ' + getFactorColor(factor, currentFactors[factor])}
                        style={{ width: (currentFactors[factor] * 10) + '%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-100/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={'flex flex-col ' + (msg.role === 'user' ? 'items-end' : 'items-start')}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'user' && msg.inputMode === 'voice' && (
                      <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        🎤 Voice
                      </span>
                    )}
                  </div>
                  <div 
                    className={'max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ' + (
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  
                  {/* Show classifier badge and factor deltas for assistant messages */}
                  {msg.role === 'assistant' && msg.category && msg.category !== 'initial' && (
                    <div className="mt-2 text-xs bg-white border rounded shadow-sm max-w-[80%] overflow-hidden">
                      <div className="bg-slate-100 px-3 py-1 border-b font-medium text-slate-600 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Agent behavior classified as: <span className="font-bold text-indigo-700 uppercase tracking-wide">{msg.category}</span>
                      </div>
                      {msg.deltas && Object.keys(msg.deltas).length > 0 && (
                        <div className="px-3 py-2 flex flex-wrap gap-3 text-[11px] uppercase tracking-wide">
                          {Object.values(msg.deltas).every(v => v === 0) ? (
                            <span className="text-slate-400 italic normal-case tracking-normal">Max/Min limits reached (or neutral interaction). No state change.</span>
                          ) : (
                            Object.entries(msg.deltas).map(([f, change], i) => {
                              if (change === 0) return null;
                              const isPositive = change > 0;
                              const isFrustration = f === 'frustration';
                              const isGood = isFrustration ? !isPositive : isPositive;
                              return (
                                <div key={i} className={'flex items-center gap-1 font-bold ' + (isGood ? 'text-emerald-600' : 'text-rose-600')}>
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
                  <div className="bg-white border border-gray-200 text-gray-500 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm flex gap-1 items-center h-12">
                    <span className="animate-bounce h-2 w-2 bg-gray-400 rounded-full"></span>
                    <span className="animate-bounce h-2 w-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }}></span>
                    <span className="animate-bounce h-2 w-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-center text-sm border border-red-200 shadow-sm mx-auto max-w-lg">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.02)] relative">
              {/* Floating Auto Message Indicator */}
              {autoMessage && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-full shadow-lg animate-pulse">
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
                    className="flex-1 px-5 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 transition shadow-inner"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                  >
                    Send
                  </button>
                </form>
              ) : (
                <div className="flex justify-center items-center h-[52px]">
                  {!SpeechRecognition ? (
                    <div className="text-red-500 font-medium">
                      Voice input is not supported in this browser. Please use Chat Mode.
                    </div>
                  ) : (
                    <button
                      onClick={toggleRecording}
                      disabled={loading || isSubmittingRef.current}
                      className={'flex items-center gap-3 px-10 py-3 rounded-full font-bold text-white transition shadow-md ' + 
                        (isRecording 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                          : 'bg-emerald-600 hover:bg-emerald-700') + 
                        ((loading || isSubmittingRef.current) ? ' opacity-50 cursor-not-allowed' : ' transform active:scale-95')}
                    >
                      {isRecording ? (
                        <>
                          <span className="w-3 h-3 bg-white rounded-full"></span>
                          Listening... (Auto-submits on pause)
                        </>
                      ) : (
                        <>
                          <span>🎤</span>
                          {loading ? 'Sending...' : 'Tap to Start Listening'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
