const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

const oldOverlay = `              {!isCallAccepted ? (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md rounded-3xl m-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-white shadow-2xl mb-6 bg-white animate-bounce">
                    {persona?.avatarUrl ? <img src={persona?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200"></div>}
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Incoming Call...</h2>
                  <p className="text-slate-200 font-bold mb-12">{persona?.name}</p>
                  
                  <button 
                    onClick={handleAcceptCall}
                    className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-110 transition-all active:scale-95"
                  >
                    <PhoneCall size={32} />
                  </button>
                  <p className="text-emerald-400 font-bold mt-4 uppercase tracking-widest text-xs">Accept</p>
                </div>
              ) : null}`;

const newOverlay = `              {!isCallAccepted ? (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md rounded-3xl m-4">
                  <div className={\`w-32 h-32 rounded-full overflow-hidden border-[6px] border-white shadow-2xl mb-6 bg-white \${!loading ? 'animate-bounce' : ''}\`}>
                    {persona?.avatarUrl ? <img src={persona?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200"></div>}
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{loading ? 'Connecting...' : 'Incoming Call...'}</h2>
                  <p className="text-slate-200 font-bold mb-12">{persona?.name}</p>
                  
                  <button 
                    onClick={handleAcceptCall}
                    disabled={loading}
                    className={\`w-20 h-20 rounded-full flex items-center justify-center transition-all \${loading ? 'bg-slate-500 cursor-not-allowed opacity-50' : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-110 active:scale-95'} text-white\`}
                  >
                    <PhoneCall size={32} />
                  </button>
                  <p className={\`font-bold mt-4 uppercase tracking-widest text-xs \${loading ? 'text-slate-300' : 'text-emerald-400'}\`}>{loading ? 'Dialing...' : 'Accept'}</p>
                </div>
              ) : null}`;

code = code.replace(oldOverlay, newOverlay);
fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched overlay for loading');
