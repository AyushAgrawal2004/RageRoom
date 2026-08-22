const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

code = code.replace('window.speechSynthesis.cancel();', '// window.speechSynthesis.cancel(); removed to prevent Chrome freezing bug');

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Removed cancel');
