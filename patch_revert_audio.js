const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

// I will revert speakText exactly to what worked, just adding setIsCustomerSpeaking
const newSpeakText = `const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => setIsCustomerSpeaking(true);
      
      utterance.onend = () => {
        setIsCustomerSpeaking(false);
        if (inputModeRef.current === 'call' && !isRecording && SpeechRecognition) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (err) {
              if (err.name === 'InvalidStateError') {
                setIsRecording(true);
              }
            }
          }, 400); 
        }
      };

      // Fix for GC bug, just safely keep reference
      window.currentUtterance = utterance;
      
      // Removed the custom voice selection that might be breaking it
      window.speechSynthesis.speak(utterance);
    }
  };`;

// Replace the current speakText
const startRegex = /const speakText = \(text\) => \{[\s\S]*?window\.speechSynthesis\.speak\(utterance\);\n      \}, 50\);\n    \}\n  \};/;
code = code.replace(startRegex, newSpeakText);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Reverted speakText');
