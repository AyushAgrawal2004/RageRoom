const fs = require('fs');
let code = fs.readFileSync('server/server.js', 'utf8');

const oldCalc = `    // 5. Build prompt for AI
    const SYSTEM_PROMPT = \`You are a customer interacting with a support agent.`;
const newCalc = `    let isHangup = false;
    if (newFactors.frustration >= 10 || newFactors.patience <= 1 || newFactors.trust <= 1 || newFactors.satisfaction <= 1) {
      isHangup = true;
    }

    // 5. Build prompt for AI
    const SYSTEM_PROMPT = \`You are a customer interacting with a support agent.`;
code = code.replace(oldCalc, newCalc);

const oldPrompt = `    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: \`Here is the conversation history:\\n\${historyStr}\\nSupport Agent's newest message: "\${userMessage}"\\n\\nGenerate your (\${persona.name}'s) next response. Remember, YOU ARE THE CUSTOMER. Stay in character.\` }
    ];`;
const newPrompt = `    let additionalInstructions = '';
    if (isHangup) {
       additionalInstructions = "\\n\\nCRITICAL INSTRUCTION: Your Frustration has reached maximum (10) OR your Patience/Trust has reached minimum (1). You have had enough of this support agent. You MUST explicitly say you are hanging up, demanding a manager, or leaving, and end the conversation immediately.";
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + additionalInstructions },
      { role: 'user', content: \`Here is the conversation history:\\n\${historyStr}\\nSupport Agent's newest message: "\${userMessage}"\\n\\nGenerate your (\${persona.name}'s) next response. Remember, YOU ARE THE CUSTOMER. Stay in character.\` }
    ];`;
code = code.replace(oldPrompt, newPrompt);

const oldRes = `    res.json({
      reply: parsedResponse.reply,
      factors: newFactors,
      category,
      deltas: finalDeltas
    });`;
const newRes = `    res.json({
      reply: parsedResponse.reply,
      factors: newFactors,
      category,
      deltas: finalDeltas,
      isHangup
    });`;
code = code.replace(oldRes, newRes);

fs.writeFileSync('server/server.js', code);
console.log('Patched backend hangup');
