const fs = require('fs');
let code = fs.readFileSync('server/server.js', 'utf8');

const oldFactors = `    // Convert Mongoose Maps to plain objects
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

const newFactors = `    // Safely convert Mongoose objects/maps to plain objects
    const getPlainFactors = (f) => {
      if (!f) return {};
      if (typeof f.toJSON === 'function') return f.toJSON();
      try {
         if (f instanceof Map) return Object.fromEntries(f);
      } catch (e) {}
      return JSON.parse(JSON.stringify(f));
    };

    const startingFactors = conversation.startingFactors ? getPlainFactors(conversation.startingFactors) : { frustration: 5, patience: 5, trust: 5, loyalty: 5, satisfaction: 5 };
    
    let finalFactors = startingFactors;
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      if (conversation.messages[i].role === 'assistant' && conversation.messages[i].factors) {
        finalFactors = getPlainFactors(conversation.messages[i].factors);
        break;
      }
    }`;

code = code.replace(oldFactors, newFactors);
fs.writeFileSync('server/server.js', code);
console.log('Patched safe factors conversion');
