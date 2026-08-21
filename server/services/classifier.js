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
  'neutral'
];

const CLASSIFIER_SYSTEM_PROMPT = `Classify the following support agent message into exactly one of these categories:
- hostile
- dismissive
- vague_promise
- acknowledges_no_action
- empathetic_solution (friendly, warm, solves the issue)
- direct_solution (solves the issue but is brief or transactional)
- proper_escalation
- rude_but_correct
- slow_or_silent
- neutral (general conversation, no strong sentiment)

Respond with ONLY the category name in lowercase, nothing else.`;

async function classifyAgentMessage(openaiClient, agentMessage) {
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'openai/gpt-oss-20b', // Fast model for classification
      messages: [
        { role: 'system', content: CLASSIFIER_SYSTEM_PROMPT },
        { role: 'user', content: `Message: "${agentMessage}"` }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const category = response.choices[0].message.content.trim().toLowerCase();
    
    // Check if it's a valid category
    if (CATEGORIES.includes(category)) {
      return category;
    }
    
    // Check if response contains a category name (e.g., if it replied "The category is dismissive")
    for (const validCat of CATEGORIES) {
      if (category.includes(validCat)) {
        return validCat;
      }
    }

    console.warn(`Classifier returned unknown category: "${category}". Defaulting to "neutral".`);
    return 'neutral';
  } catch (err) {
    console.error('Error classifying message:', err.message);
    return 'neutral'; // Safe fallback
  }
}

module.exports = { classifyAgentMessage, CATEGORIES };
