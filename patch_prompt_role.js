const fs = require('fs');
let code = fs.readFileSync('server/server.js', 'utf8');

const oldMessagesArray = `    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []).map(msg => ({
        role: msg.role === 'customer' ? 'assistant' : msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];`;

const newMessagesArray = `    let historyStr = '';
    (conversationHistory || []).forEach(msg => {
       const speaker = msg.role === 'assistant' ? persona.name : 'Support Agent';
       historyStr += \`\${speaker}: \${msg.content}\\n\`;
    });
    
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: \`Here is the conversation history:\\n\${historyStr}\\nSupport Agent's newest message: "\${userMessage}"\\n\\nGenerate your (\${persona.name}'s) next response. Remember, YOU ARE THE CUSTOMER. Stay in character.\` }
    ];`;

code = code.replace(oldMessagesArray, newMessagesArray);

fs.writeFileSync('server/server.js', code);
console.log('Patched role hallucination in server.js');
