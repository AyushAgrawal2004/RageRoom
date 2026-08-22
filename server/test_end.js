const mongoose = require('mongoose');
const Conversation = require('./models/Conversation');
const { generateReportCard } = require('./services/judge');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/difficult_customer_simulator');
  
  const conversation = await Conversation.findOne().sort({ createdAt: -1 });
  if (!conversation) {
     console.log("No conversation found");
     process.exit(1);
  }
  
  try {
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
      }

      console.log("Starting factors:", startingFactors);
      console.log("Final factors:", finalFactors);

      let transcript = '';
      let agentTurnCount = 0;
      conversation.messages.forEach(msg => {
        const roleName = msg.role === 'assistant' ? 'CUSTOMER' : 'AGENT';
        if (msg.role === 'user') agentTurnCount++;
        transcript += `${roleName}: ${msg.content}\n\n`;
      });
      
      // Let's just mock generateReportCard to see if it's the score or save
      const reportCard = {
         professionalism: 5,
         deEscalation: 5,
         problemSolving: 5,
         empathy: 5,
         feedback: "Mock feedback"
      };
      
      let score = 50; 
      if (finalFactors && startingFactors) {
        score += (startingFactors.frustration - finalFactors.frustration) * 5; 
        score += (finalFactors.patience - startingFactors.patience) * 5;
        score += (finalFactors.trust - startingFactors.trust) * 5;
        score += (finalFactors.loyalty - startingFactors.loyalty) * 3;
        score += (finalFactors.satisfaction - startingFactors.satisfaction) * 8;
      }
      
      reportCard.overallScore = isNaN(score) ? 50 : Math.max(0, Math.min(100, Math.round(score)));

      conversation.reportCard = reportCard;
      await conversation.save();
      console.log("SUCCESS!");
      
  } catch (err) {
      console.error("CRASH:", err);
  }
  
  process.exit(0);
}
test().catch(console.error);
