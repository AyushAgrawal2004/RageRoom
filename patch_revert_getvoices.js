const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

code = code.replace(
  `    // Pre-load voices to ensure they are available when speakText is called
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

`, ''
);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Reverted getVoices preload');
