const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

// Add sendMessageRef
const newRef = `  const isSubmittingRef = useRef(false);
  
  const sendMessageRef = useRef(null);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });`;

code = code.replace("const isSubmittingRef = useRef(false);", newRef);

// Update interval to use sendMessageRef.current
code = code.replace(
  "sendMessage(currentTranscript, 'call');",
  "if (sendMessageRef.current) sendMessageRef.current(currentTranscript, 'call');"
);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched stale sendMessage');
