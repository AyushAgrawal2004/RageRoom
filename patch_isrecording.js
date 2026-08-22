const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

// 1. Add isRecordingRef
code = code.replace(
  'const [isRecording, setIsRecording] = useState(false);',
  'const [isRecording, setIsRecording] = useState(false);\n  const isRecordingRef = useRef(false);\n  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);'
);

// 2. Fix in utterance.onend
code = code.replace(
  "if (inputModeRef.current === 'call' && !isRecording && SpeechRecognition) {",
  "if (inputModeRef.current === 'call' && !isRecordingRef.current && SpeechRecognition) {"
);

// 3. Fix in endSession
code = code.replace(
  "    if (isRecording && recognitionRef.current) {",
  "    if (isRecordingRef.current && recognitionRef.current) {"
);

// 4. Fix in sendMessage
code = code.replace(
  "    if (isRecording && recognitionRef.current) {",
  "    if (isRecordingRef.current && recognitionRef.current) {"
);

// 5. Fix in totalSilenceTimeoutRef
code = code.replace(
  "        if (isRecording && transcriptRef.current.trim() === '') {",
  "        if (isRecordingRef.current && transcriptRef.current.trim() === '') {"
);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched isRecording refs');
