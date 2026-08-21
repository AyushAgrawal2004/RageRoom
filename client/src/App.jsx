import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css'; 

function App() {
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [customFactors, setCustomFactors] = useState(null);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const [currentFactors, setCurrentFactors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch personas on load
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
  }, []);

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
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setError(null);

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5005/api/chat', {
        sessionId,
        personaId: selectedPersona.id,
        currentFactors: currentFactors,
        conversationHistory: newMessages.slice(0, -1),
        userMessage: userMsg
      });

      const aiReply = response.data.reply;
      const aiFactors = response.data.factors;
      const aiChanges = response.data.factor_changes;

      setMessages(prev => [...prev, { role: 'assistant', content: aiReply, factors: aiFactors, factor_changes: aiChanges }]);
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
    // Frustration: low=green, high=red
    // Others (trust, patience, loyalty, satisfaction): low=red, high=green
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <header className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Difficult Customer Simulator</h1>
          {sessionActive && (
            <button 
              onClick={endSession}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition"
            >
              End Session
            </button>
          )}
        </header>

        {!sessionActive ? (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Setup Training Scenario</h2>
            
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left col: Persona List */}
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

              {/* Right col: Custom Factors & Start */}
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
                        className={'h-full transition-all duration-700 ease-out ' + getFactorColor(factor, currentFactors[factor])}
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
                  <div 
                    className={'max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ' + (
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  
                  {/* Show factor changes if present */}
                  {msg.role === 'assistant' && msg.factor_changes && Object.keys(msg.factor_changes).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 bg-white/60 border rounded px-3 py-2 shadow-sm max-w-[80%]">
                      <span className="font-semibold block mb-1">State Updates:</span>
                      <ul className="space-y-1">
                        {Object.entries(msg.factor_changes).map(([f, change], i) => (
                          <li key={i}><span className="capitalize font-medium">{f}:</span> {change}</li>
                        ))}
                      </ul>
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
            <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
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
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
