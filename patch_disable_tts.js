const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

// 1. Remove speakText from startSession for text chat mode
const oldStart = `      setSessionActive(true);
      if (location.state?.mode !== 'call') {
        speakText(response.data.message.content);
      }`;
const newStart = `      setSessionActive(true);
      // TTS is only used for Voice Call mode, which is triggered via handleAcceptCall`;
code = code.replace(oldStart, newStart);

// 2. Wrap speakText in sendMessage
const oldSend = `      speakText(assistantMsg.content);`;
const newSend = `      if (inputModeRef.current === 'call') {
        speakText(assistantMsg.content);
      }`;
code = code.replace(oldSend, newSend);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Disabled TTS for Text Chat');
