const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

const oldSpeakText = `const speakText = (text) => {
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
      };
      
      utterance.onend = () => {
        setIsCustomerSpeaking(false);
        if (inputModeRef.current === 'call' && !isRecording && SpeechRecognition) {
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
      // Chrome bug: cancelling immediately before speaking can cancel the NEXT utterance too.
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Chrome/Safari bug: utterance is garbage collected if not stored globally
      window.currentUtterance = utterance;
      
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium'))) || voices[0];
      if (enVoice) utterance.voice = enVoice;
      
      const fallbackTimeout = setTimeout(() => {
        setIsCustomerSpeaking(true);
      }, 500);
      
      utterance.onstart = () => {
        clearTimeout(fallbackTimeout);
        setIsCustomerSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsCustomerSpeaking(false);
        if (inputModeRef.current === 'call' && !isRecording && SpeechRecognition) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (err) {
              if (err.name === 'InvalidStateError') setIsRecording(true);
            }
          }, 400); 
        }
      };
      
      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error:', e);
        setIsCustomerSpeaking(false);
      };

      // Slight timeout to let cancel() resolve
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  };`;

code = code.replace(oldSpeakText, newSpeakText);
fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched Session.jsx speech engine');
