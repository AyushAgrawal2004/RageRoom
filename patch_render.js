const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

const startIdx = code.indexOf('{/* Chat Area */}');

const newUI = `{/* Main Interaction Area */}
        <div className="flex-1 flex flex-col bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/30 via-[#F9FAFB] to-[#F9FAFB] relative overflow-hidden">
          
          {mode === 'call' ? (
            // ==========================================
            // VOICE CALL UI
            // ==========================================
            <div className="flex-1 flex flex-col items-center justify-center relative p-8">
              
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
                  className={\`relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.2),0_10px_20px_rgba(0,0,0,0.1)] active:shadow-[0_0px_0_rgba(0,0,0,0)] active:translate-y-[4px] transition-all \${
                    isRecording 
                      ? 'bg-gradient-to-b from-rose-400 to-rose-500 text-white shadow-[0_4px_0_#9f1239,0_10px_20px_rgba(225,29,72,0.3)]' 
                      : 'bg-gradient-to-b from-slate-100 to-slate-200 text-slate-700 shadow-[0_4px_0_#cbd5e1,0_10px_20px_rgba(0,0,0,0.05)]'
                  } \${(loading || isSubmittingRef.current || isCustomerSpeaking) ? 'opacity-50 cursor-not-allowed scale-100' : 'hover:brightness-110'}\`}
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
                  <div key={idx} className={\`flex flex-col \${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up\`}>
                    
                    {msg.role === 'assistant' && idx > 0 && (
                      <div className="flex items-center gap-2 mb-2 ml-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                           {persona?.avatarUrl && <img src={persona.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />}
                        </div>
                        <span className="text-xs font-bold text-slate-500">{persona?.name}</span>
                      </div>
                    )}

                    <div 
                      className={\`max-w-[75%] rounded-[24px] px-6 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.04)] text-[15px] font-medium leading-relaxed \${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-tr-[4px] border-t border-indigo-400' 
                          : 'bg-white text-slate-800 rounded-tl-[4px] border border-white/60'
                      }\`}
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
                                  <div key={i} className={\`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest \${isGood ? 'text-emerald-600' : 'text-rose-500'}\`}>
                                    <span>{f}</span>
                                    <span className={\`px-1.5 py-0.5 rounded-md \${isGood ? 'bg-emerald-50' : 'bg-rose-50'}\`}>{formatDelta(change)}</span>
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
`;

code = code.substring(0, startIdx) + newUI;
fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('UI injected');
