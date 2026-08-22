const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

// 1. Add isCallAccepted state
code = code.replace(
  "const [isCustomerSpeaking, setIsCustomerSpeaking] = useState(false);",
  "const [isCustomerSpeaking, setIsCustomerSpeaking] = useState(false);\n  const [isCallAccepted, setIsCallAccepted] = useState(false);"
);

// 2. Modify speakText inside startSession to only fire if mode !== 'call'
// Actually, it's easier to change where speakText is called.
const oldStartSessionEnd = `      setSessionActive(true);
      speakText(response.data.message.content);
    } catch (err) {`;

const newStartSessionEnd = `      setSessionActive(true);
      if (location.state?.mode !== 'call') {
        speakText(response.data.message.content);
      }
    } catch (err) {`;
code = code.replace(oldStartSessionEnd, newStartSessionEnd);

// 3. Add handleAcceptCall
const handleAcceptCode = `
  const handleAcceptCall = () => {
    setIsCallAccepted(true);
    if (messages.length > 0) {
      speakText(messages[0].content);
    }
  };
`;
code = code.replace("const handleSendForm = (e) => {", handleAcceptCode + "\n  const handleSendForm = (e) => {");

// 4. Update Render UI
const callUIRegex = /\{\/\* Pulsing rings when speaking \*\/\}/;
const incomingCallOverlay = `
              {!isCallAccepted ? (
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
              ) : null}
              {/* Pulsing rings when speaking */}`;

code = code.replace(callUIRegex, incomingCallOverlay);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Added Accept Call screen');
