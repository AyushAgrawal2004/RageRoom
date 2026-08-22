const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

code = code.replace("import Chat from './pages/Chat';", "import Session from './pages/Session';");
code = code.replace('path="/chat"', 'path="/session"');
code = code.replace('<Chat user={user} />', '<Session user={user} />');

fs.writeFileSync('client/src/App.jsx', code);
console.log('App.jsx patched');
