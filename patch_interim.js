const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

// Add interimTranscriptRef
code = code.replace(
  "const transcriptRef = useRef('');",
  "const transcriptRef = useRef('');\n  const interimTranscriptRef = useRef('');"
);

// Update onstart
code = code.replace(
  "transcriptRef.current = '';",
  "transcriptRef.current = '';\n      interimTranscriptRef.current = '';"
);

// Update onresult
const oldOnResult = `    recognition.onresult = (event) => {
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

      if (finalTranscriptChunk) {
        transcriptRef.current += finalTranscriptChunk;
      }
    };`;

const newOnResult = `    recognition.onresult = (event) => {
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
        interimTranscriptRef.current = ''; // clear interim since it became final
      }
    };`;
code = code.replace(oldOnResult, newOnResult);

// Update silence checker
const oldSilenceChecker = `const currentTranscript = transcriptRef.current.trim();
        
        if (timeSinceLastSpeech > SILENCE_THRESHOLD && currentTranscript.length > 0) {
          isSubmittingRef.current = true;
          sendMessage(currentTranscript, 'call');
          transcriptRef.current = '';`;

const newSilenceChecker = `const currentTranscript = (transcriptRef.current + ' ' + interimTranscriptRef.current).trim();
        
        if (timeSinceLastSpeech > SILENCE_THRESHOLD && currentTranscript.length > 0) {
          isSubmittingRef.current = true;
          sendMessage(currentTranscript, 'call');
          transcriptRef.current = '';
          interimTranscriptRef.current = '';`;
code = code.replace(oldSilenceChecker, newSilenceChecker);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched interim transcript bug');
