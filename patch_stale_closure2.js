const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

const oldLine = 'if (isRecording && transcriptRef.current.trim() === "") {';
const newLine = 'if ((transcriptRef.current + " " + (interimTranscriptRef.current || "")).trim() === "") {';

code = code.replace(oldLine, newLine);
fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched stale closure bug in timeout');
