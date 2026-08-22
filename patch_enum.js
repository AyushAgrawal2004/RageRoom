const fs = require('fs');
let code = fs.readFileSync('server/models/Conversation.js', 'utf8');

code = code.replace(
  "inputMode: { type: String, enum: ['chat', 'voice'], default: 'chat' },",
  "inputMode: { type: String, enum: ['chat', 'voice', 'call'], default: 'chat' },"
);

fs.writeFileSync('server/models/Conversation.js', code);
console.log('Patched Conversation schema');
