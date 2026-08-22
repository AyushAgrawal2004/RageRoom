const fs = require('fs');
let code = fs.readFileSync('server/server.js', 'utf8');

const oldFactors = `    const startingFactors = conversation.startingFactors;
    
    // Find the final factors from the last assistant message
    let finalFactors = conversation.startingFactors;
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      if (conversation.messages[i].role === 'assistant' && conversation.messages[i].factors) {
        finalFactors = conversation.messages[i].factors;
        break;
      }
    }`;

const newFactors = `    // Convert Mongoose Maps to plain objects
    const startingFactors = conversation.startingFactors ? Object.fromEntries(conversation.startingFactors) : { frustration: 5, patience: 5, trust: 5, loyalty: 5, satisfaction: 5 };
    
    // Find the final factors from the last assistant message
    let finalFactorsObj = startingFactors;
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      if (conversation.messages[i].role === 'assistant' && conversation.messages[i].factors) {
        finalFactorsObj = Object.fromEntries(conversation.messages[i].factors);
        break;
      }
    }
    const finalFactors = finalFactorsObj;`;

code = code.replace(oldFactors, newFactors);
fs.writeFileSync('server/server.js', code);
console.log('Patched NaN bug');
