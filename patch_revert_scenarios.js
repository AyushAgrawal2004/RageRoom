const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Scenarios.jsx', 'utf8');

const oldHandleStart = `const handleStart = (personaId, mode) => {
    if (mode === 'call' && 'speechSynthesis' in window) {
      const wakeUp = new SpeechSynthesisUtterance(' ');
      wakeUp.volume = 0.01;
      window.wakeUpUtterance = wakeUp; // prevent GC
      window.speechSynthesis.speak(wakeUp);
    }
    navigate('/session', { state: { selectedPersonaId: personaId, mode } });
  };`;

const newHandleStart = `const handleStart = (personaId, mode) => {
    navigate('/session', { state: { selectedPersonaId: personaId, mode } });
  };`;

code = code.replace(oldHandleStart, newHandleStart);
fs.writeFileSync('client/src/pages/Scenarios.jsx', code);
console.log('Reverted Scenarios.jsx wakeup hack');
