const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Auth.jsx', 'utf8');
code = code.replace(
  /\`http:\/\/localhost:5005\$\{endpoint\}\`/g,
  "\`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}${endpoint}\`"
);
fs.writeFileSync('client/src/pages/Auth.jsx', code);
console.log('Auth.jsx fixed!');
