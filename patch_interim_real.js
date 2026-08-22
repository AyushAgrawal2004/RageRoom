const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

// 1. Add interimTranscriptRef (if it isn't already there)
if (!code.includes('interimTranscriptRef = useRef')) {
  code = code.replace(
    "const transcriptRef = useRef('');",
    "const transcriptRef = useRef('');\n  const interimTranscriptRef = useRef('');"
  );
}

if (!code.includes("interimTranscriptRef.current = '';")) {
  code = code.replace(
    "transcriptRef.current = '';",
    "transcriptRef.current = '';\n      interimTranscriptRef.current = '';"
  );
}

// 2. Fix onresult
const onresultStart = code.indexOf('recognition.onresult = (event) => {');
const onresultEnd = code.indexOf('};', onresultStart) + 2;
const oldOnResult = code.slice(onresultStart, onresultEnd);

const newOnResult = `recognition.onresult = (event) => {
      lastSpeechTimestamp.current = Date.now();
      
      if (totalSilenceTimeoutRef.current) {
        clearTimeout(totalSilenceTimeoutRef.current);
        totalSilenceTimeoutRef.current = null;
      }

      let interimTranscript = '';
      let finalTranscriptChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptChunk += transcriptSegment + ' ';
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      interimTranscriptRef.current = interimTranscript;
      
      if (finalTranscriptChunk) {
        transcriptRef.current += finalTranscriptChunk;
        interimTranscriptRef.current = '';
      }
    };`;

code = code.replace(oldOnResult, newOnResult);

// 3. Fix silence checker
const silenceCheckerStart = code.indexOf('const currentTranscript = transcriptRef.current.trim();');
const silenceCheckerEnd = code.indexOf('}', silenceCheckerStart) + 1;
const oldSilenceChecker = code.slice(silenceCheckerStart, silenceCheckerEnd);

const newSilenceChecker = `const currentTranscript = (transcriptRef.current + ' ' + (interimTranscriptRef.current || '')).trim();
        
        if (timeSinceLastSpeech > SILENCE_THRESHOLD && currentTranscript.length > 0) {
          isSubmittingRef.current = true;
          recognition.stop();
          sendMessage(currentTranscript, 'call');
          transcriptRef.current = '';
          interimTranscriptRef.current = '';
        }`;

code = code.replace(oldSilenceChecker, newSilenceChecker);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Fixed interim bug FOR REAL');
