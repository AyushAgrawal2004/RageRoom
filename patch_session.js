const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

// Rename Chat to Session internally
code = code.replace(/function Chat\(/g, 'function Session(');
code = code.replace(/export default Chat;/g, 'export default Session;');

// Read mode from location state
code = code.replace(
  "const selectedPersonaId = location.state?.selectedPersonaId;",
  "const selectedPersonaId = location.state?.selectedPersonaId;\n  const mode = location.state?.mode || 'chat';"
);

// We need to disable the header toggle buttons for inputMode
// Actually, inputMode should just be hardcoded to `mode` at startup.
code = code.replace(
  "const [inputMode, setInputMode] = useState('chat');",
  "const [inputMode, setInputMode] = useState(location.state?.mode || 'chat');"
);

// Reduce SILENCE_THRESHOLD to 1200
code = code.replace(
  "const SILENCE_THRESHOLD = 2500;",
  "const SILENCE_THRESHOLD = 1200;"
);

// Add isCustomerSpeaking tracking state
code = code.replace(
  "const [isEnding, setIsEnding] = useState(false);",
  "const [isEnding, setIsEnding] = useState(false);\n  const [isCustomerSpeaking, setIsCustomerSpeaking] = useState(false);"
);

// Wire speaking tracking to speakText
const oldSpeakText = `const speakText = (text) => {
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
  };`;

const newSpeakText = `const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => setIsCustomerSpeaking(true);
      
      utterance.onend = () => {
        setIsCustomerSpeaking(false);
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
  };`;

code = code.replace(oldSpeakText, newSpeakText);

// Remove the inputMode toggles from the header
const headerToggles = `<div className="flex bg-slate-100 rounded-xl p-1 shadow-inner">
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
          </div>`;

code = code.replace(headerToggles, `<div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 shadow-inner flex items-center gap-2">
            {mode === 'call' ? <><PhoneCall size={14}/> Voice Call Active</> : <><MessageSquare size={14}/> Text Chat Active</>}
          </div>`);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Session.jsx modified logic');
