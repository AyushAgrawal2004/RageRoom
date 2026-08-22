const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

const oldMsg = `      const assistantMsg = {
        role: 'assistant',
        content: response.data.reply,
        factors: response.data.factors,
        category: response.data.category,
        deltas: response.data.deltas
      };`;

const newMsg = `      const assistantMsg = {
        role: 'assistant',
        content: response.data.reply,
        factors: response.data.factors,
        category: response.data.category,
        deltas: response.data.deltas,
        isHangup: response.data.isHangup
      };`;

code = code.replace(oldMsg, newMsg);
fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched missing isHangup in frontend');
