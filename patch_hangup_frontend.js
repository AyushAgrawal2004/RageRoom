const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

const oldEscalate = `      if (assistantMsg.category === 'escalate' || assistantMsg.category === 'hangup') {
        alert(assistantMsg.category === 'hangup' ? "The customer hung up on you!" : "The customer demanded to speak to a manager!");
        endSession();
        return;
      }`;
const newEscalate = `      // If the customer hung up, we let the AI speak the final message, and then end the session.
      if (assistantMsg.isHangup) {
         // It will be handled in speakText onend or setTimeout for text chat
         if (inputModeRef.current !== 'call') {
            setTimeout(() => {
               alert("The customer hung up on you! Ending session...");
               endSession();
            }, 3000);
         }
      }`;

code = code.replace(oldEscalate, newEscalate);

// We need to pass isHangup to speakText so it knows to endSession onend!
const oldSpeak = `  const speakText = (text) => {`;
const newSpeak = `  const speakText = (text, isHangup = false) => {`;
code = code.replace(oldSpeak, newSpeak);

const oldSpeakEnd = `      utterance.onend = () => {
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
      };`;
const newSpeakEnd = `      utterance.onend = () => {
        setIsCustomerSpeaking(false);
        if (isHangup) {
           alert("The customer hung up on you! Generating report...");
           endSession();
           return;
        }
        
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
      };`;
code = code.replace(oldSpeakEnd, newSpeakEnd);

const oldSpeakCall = `      if (inputModeRef.current === 'call') {
        speakText(assistantMsg.content);
      }`;
const newSpeakCall = `      if (inputModeRef.current === 'call') {
        speakText(assistantMsg.content, assistantMsg.isHangup);
      }`;
code = code.replace(oldSpeakCall, newSpeakCall);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched frontend hangup');
