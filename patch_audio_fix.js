const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Scenarios.jsx', 'utf8');

const oldHandleStart = `const handleStart = (personaId, mode) => {
    navigate('/session', { state: { selectedPersonaId: personaId, mode } });
  };`;

const newHandleStart = `const handleStart = (personaId, mode) => {
    // Wake up the browser's speech synthesis engine synchronously on click to bypass autoplay restrictions
    if (mode === 'call' && 'speechSynthesis' in window) {
      const wakeUp = new SpeechSynthesisUtterance('');
      wakeUp.volume = 0;
      window.speechSynthesis.speak(wakeUp);
    }
    navigate('/session', { state: { selectedPersonaId: personaId, mode } });
  };`;

code = code.replace(oldHandleStart, newHandleStart);
fs.writeFileSync('client/src/pages/Scenarios.jsx', code);
console.log('Patched Scenarios.jsx');
