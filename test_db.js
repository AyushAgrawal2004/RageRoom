const mongoose = require('mongoose');
const Conversation = require('./server/models/Conversation');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/difficult_customer_simulator');
  
  const conversation = await Conversation.findOne().sort({ createdAt: -1 });
  if (!conversation) {
     console.log("No conversation found");
     process.exit(1);
  }
  
  const getPlainFactors = (f) => {
    if (!f) return {};
    if (typeof f.toJSON === 'function') return f.toJSON();
    try {
       if (f instanceof Map) return Object.fromEntries(f);
    } catch (e) {}
    return JSON.parse(JSON.stringify(f));
  };
  
  console.log("Starting Factors:", conversation.startingFactors);
  console.log("Starting Factors typeof:", typeof conversation.startingFactors);
  console.log("Starting Factors keys:", Object.keys(conversation.startingFactors));
  
  const plainStart = getPlainFactors(conversation.startingFactors);
  console.log("Plain Start:", plainStart);
  
  let finalFactors = plainStart;
  for (let i = conversation.messages.length - 1; i >= 0; i--) {
    if (conversation.messages[i].role === 'assistant' && conversation.messages[i].factors) {
      finalFactors = getPlainFactors(conversation.messages[i].factors);
      break;
    }
  }
  console.log("Plain Final:", finalFactors);
  
  let score = 50;
  if (finalFactors && plainStart) {
    score += (plainStart.frustration - finalFactors.frustration) * 5;
    score += (finalFactors.patience - plainStart.patience) * 5;
    score += (finalFactors.trust - plainStart.trust) * 5;
    score += (finalFactors.loyalty - plainStart.loyalty) * 3;
    score += (finalFactors.satisfaction - plainStart.satisfaction) * 8;
  }
  
  console.log("Score:", score);
  
  process.exit(0);
}
test().catch(console.error);
