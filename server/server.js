const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');

const Conversation = require('./models/Conversation');
const personas = require('./data/personas');
const { classifyAgentMessage } = require('./services/classifier');
const { factorMatrix, decayConfig } = require('./data/factorMatrix');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (optional for MVP)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/difficult_customer_simulator')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize OpenAI SDK for Groq
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// GET /api/personas - return list of available personas
app.get('/api/personas', (req, res) => {
  res.json(personas);
});

// POST /api/start - start a new session
app.post('/api/start', async (req, res) => {
  try {
    const { personaId, customFactors } = req.body;
    
    const persona = personas.find(p => p.id === personaId) || personas[0];
    const startingFactors = customFactors || persona.startingFactors;
    
    const sessionId = uuidv4();
    const initialMessage = {
      role: 'assistant',
      content: persona.initialMessage,
      factors: startingFactors,
      category: 'initial',
      deltas: {},
      timestamp: new Date()
    };
    
    // Save to DB (optional)
    try {
      const conversation = new Conversation({
        sessionId,
        personaUsed: persona.id,
        startingFactors,
        messages: [initialMessage]
      });
      await conversation.save();
    } catch (dbErr) {
      console.warn('Could not save initial session to DB:', dbErr.message);
    }

    res.json({ sessionId, message: initialMessage, persona });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Helper to clamp values between 1 and 10
const clamp = (val) => Math.max(1, Math.min(10, val));

// POST /api/chat - process human response
app.post('/api/chat', async (req, res) => {
  const { sessionId, conversationHistory, userMessage, personaId, currentFactors, inputMode } = req.body;

  if (!sessionId || !userMessage) {
    return res.status(400).json({ error: 'sessionId and userMessage are required' });
  }

  try {
    // Save user message to DB (optional)
    try {
      await Conversation.findOneAndUpdate(
        { sessionId },
        { $push: { messages: { role: 'user', content: userMessage, inputMode: inputMode || 'chat', timestamp: new Date() } } },
        { upsert: true }
      );
    } catch (dbErr) {
      console.warn('Could not save user message to DB:', dbErr.message);
    }

    // 1. Classify agent message
    const category = await classifyAgentMessage(openai, userMessage);
    
    // 2. Get deterministic deltas
    const deltas = factorMatrix[category] || factorMatrix['neutral'];
    
    // 3. Check for decay (e.g. every N turns of the user)
    // We can estimate turns by looking at conversationHistory.
    const userTurnCount = (conversationHistory || []).filter(m => m.role === 'user').length + 1; // +1 for current message
    
    let applyDecay = false;
    if (userTurnCount > 0 && userTurnCount % decayConfig.turnsPerDecay === 0) {
      applyDecay = true;
    }

    // 4. Calculate new factors
    const newFactors = {};
    const finalDeltas = {}; // to send to frontend showing exactly what changed

    for (const factor of Object.keys(currentFactors)) {
      let change = deltas[factor] || 0;
      if (applyDecay && decayConfig.deltas[factor]) {
        change += decayConfig.deltas[factor];
      }
      
      const newVal = clamp(currentFactors[factor] + change);
      newFactors[factor] = newVal;
      
      // Calculate actual delta (since clamping might have restricted it)
      finalDeltas[factor] = newVal - currentFactors[factor];
    }

    const persona = personas.find(p => p.id === personaId) || personas[0];
    
    // 5. Build prompt for AI (only asks for 'reply')
    const SYSTEM_PROMPT = `You are a customer interacting with a support agent.
Role: ${persona.name}
Backstory/Situation: ${persona.backstory}

Your CURRENT emotional state is:
- frustration: ${newFactors.frustration}/10
- patience: ${newFactors.patience}/10
- trust: ${newFactors.trust}/10
- loyalty: ${newFactors.loyalty}/10
- satisfaction: ${newFactors.satisfaction}/10

Your reply's tone MUST genuinely reflect this state. 
- If frustration is 8+ and patience is 2 or below, you are on the verge of ending the conversation or demanding a manager.
- If trust is low, be skeptical of any promises made.
- If satisfaction and trust are both high, you may start being noticeably more cooperative and even apologize for your earlier tone.

Instructions:
1. Respond in character to the agent's latest message based on your backstory and the new emotional state.
2. Output ONLY JSON in this exact format:
{
  "reply": "<your in-character response text>"
}`;

    // Format history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []).map(msg => ({
        role: msg.role === 'customer' ? 'assistant' : msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    let aiMessageContent;
    let parsedResponse;
    let success = false;
    let retryCount = 0;
    const maxRetries = 1;

    while (!success && retryCount <= maxRetries) {
      try {
        const response = await openai.chat.completions.create({
          model: "openai/gpt-oss-20b",
          messages: messages,
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        aiMessageContent = response.choices[0].message.content;
        parsedResponse = JSON.parse(aiMessageContent);

        if (!parsedResponse.reply) {
          throw new Error('Missing reply field in JSON');
        }
        success = true;
      } catch (e) {
        console.error(`Attempt ${retryCount + 1} failed to parse Groq response:`, e.message);
        retryCount++;
      }
    }

    if (!success) {
      console.warn('Falling back to safe default due to JSON parse failure.');
      parsedResponse = {
        reply: "*The customer seems too upset to respond coherently right now. Try a different approach.*"
      };
    }

    const aiMessage = {
      role: 'assistant',
      content: parsedResponse.reply,
      factors: newFactors,
      category,
      deltas: finalDeltas,
      timestamp: new Date()
    };

    // Save AI response to DB
    try {
      await Conversation.findOneAndUpdate(
        { sessionId },
        { $push: { messages: aiMessage } }
      );
    } catch (dbErr) {
      console.warn('Could not save AI message to DB:', dbErr.message);
    }

    res.json({
      reply: parsedResponse.reply,
      factors: newFactors,
      category,
      deltas: finalDeltas
    });

  } catch (error) {
    console.error('Error calling Groq API:', error);
    res.status(500).json({ 
      error: 'Failed to communicate with AI', 
      details: error.message,
      groqError: error.response?.data || error.error 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
