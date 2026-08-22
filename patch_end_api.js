const fs = require('fs');
let code = fs.readFileSync('server/server.js', 'utf8');

const oldLine = 'const finalFactors = conversation.messages[conversation.messages.length - 1].factors;';

const newLogic = `
    // Find the final factors from the last assistant message
    let finalFactors = conversation.startingFactors;
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      if (conversation.messages[i].role === 'assistant' && conversation.messages[i].factors) {
        finalFactors = conversation.messages[i].factors;
        break;
      }
    }
`;

code = code.replace(oldLine, newLogic);
fs.writeFileSync('server/server.js', code);
console.log('Patched /api/end in server.js');
