const CATEGORIES = [
  'hostile',
  'dismissive',
  'vague_promise',
  'acknowledges_no_action',
  'empathetic_solution',
  'direct_solution',
  'proper_escalation',
  'rude_but_correct',
  'slow_or_silent',
  'repetitive_script',
  'neutral'
];

const CLASSIFIER_SYSTEM_PROMPT = `Classify the following support agent message into exactly one of these categories based on their response and the immediate conversation context:
- hostile
- dismissive
- vague_promise
- acknowledges_no_action
- empathetic_solution (friendly, warm, solves the issue)
- direct_solution (solves the issue but is brief or transactional)
- proper_escalation
- rude_but_correct
- slow_or_silent
- repetitive_script (the agent repeats a question the customer just answered, ignores what they just said, or reads from a boilerplate script without listening)
- neutral (general conversation, no strong sentiment)

Respond with ONLY the category name in lowercase, nothing else.`;

async function classifyAgentMessage(openaiClient, agentMessage, conversationHistory = []) {
  try {
    // Extract last 2 customer messages for context
    const recentHistory = conversationHistory.slice(-3).map(m => `${m.role === 'user' ? 'Agent' : 'Customer'}: ${m.content}`).join('\n');
    
    const response = await openaiClient.chat.completions.create({
      model: 'openai/gpt-oss-20b', 
      messages: [
        { role: 'system', content: CLASSIFIER_SYSTEM_PROMPT },
        { role: 'user', content: `Recent Context:\n${recentHistory || 'None'}\n\nAgent's latest message to classify: "${agentMessage}"` }
      ],
      temperature: 0.1,
      max_tokens: 15
    });

    const category = response.choices[0].message.content.trim().toLowerCase();
    
    if (CATEGORIES.includes(category)) return category;
    
    for (const validCat of CATEGORIES) {
      if (category.includes(validCat)) return validCat;
    }

    return 'neutral';
  } catch (err) {
    console.error('Error classifying message:', err.message);
    return 'neutral'; 
  }
}

module.exports = { classifyAgentMessage, CATEGORIES };
