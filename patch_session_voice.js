const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

const oldSpeakText = `const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => setIsCustomerSpeaking(true);`;

const newSpeakText = `const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a good English voice so it doesn't fail silently
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium')));
      if (enVoice) utterance.voice = enVoice;
      
      // Safety timeout: if onstart doesn't fire within 1s, force the UI state
      const fallbackTimeout = setTimeout(() => {
        setIsCustomerSpeaking(true);
      }, 1000);
      
      utterance.onstart = () => {
        clearTimeout(fallbackTimeout);
        setIsCustomerSpeaking(true);
      };`;

code = code.replace(oldSpeakText, newSpeakText);
fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched Session.jsx speakText');
