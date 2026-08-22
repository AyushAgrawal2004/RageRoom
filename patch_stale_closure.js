const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

const oldLine = 'if (isSubmittingRef.current || !isRecording) return;';
const newLine = 'if (isSubmittingRef.current) return; // Removed stale closure check for isRecording';

code = code.replace(oldLine, newLine);
fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched stale closure bug');
