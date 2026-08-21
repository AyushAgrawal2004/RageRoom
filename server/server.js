const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');

const Conversation = require('./models/Conversation');
const personas = require('./data/personas');

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

// POST /api/start - start a new session with selected persona and factors
app.post('/api/start', async (req, res) => {
  try {
    const { personaId, customFactors } = req.body;
    
    // Find persona or use a fallback
    const persona = personas.find(p => p.id === personaId) || personas[0];
    const startingFactors = customFactors || persona.startingFactors;
    
    const sessionId = uuidv4();
    const initialMessage = {
      role: 'assistant',
      content: persona.initialMessage,
      factors: startingFactors,
      factor_changes: {}, // no changes on first message
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

// POST /api/chat - process human response and get AI reply
app.post('/api/chat', async (req, res) => {
  const { sessionId, conversationHistory, userMessage, personaId, currentFactors } = req.body;

  if (!sessionId || !userMessage) {
    return res.status(400).json({ error: 'sessionId and userMessage are required' });
  }

  try {
    // Save user message to DB (optional)
    try {
      await Conversation.findOneAndUpdate(
        { sessionId },
        { $push: { messages: { role: 'user', content: userMessage, timestamp: new Date() } } },
        { upsert: true }
      );
    } catch (dbErr) {
      console.warn('Could not save user message to DB:', dbErr.message);
    }

    const persona = personas.find(p => p.id === personaId) || personas[0];
    
    const SYSTEM_PROMPT = `You are a customer interacting with a support agent.
Role: ${persona.name}
Backstory/Situation: ${persona.backstory}

Your current emotional state is represented by these factors (1-10 scale):
${JSON.stringify(currentFactors || persona.startingFactors)}

Instructions:
1. Respond in character to the agent's last message.
2. Update EACH factor based on what the human agent just said/did.
   - frustration rises when the agent is dismissive, robotic, or unhelpful. It falls when they provide clear solutions and empathy.
   - patience drops when the agent takes too long, gives runarounds, or asks for info you already provided. It rises if they are fast and direct.
   - trust falls when promises are vague or contradict earlier statements. It rises when they take ownership and explain clearly.
   - loyalty stays high even under frustration if the agent is respectful, but drops sharply if the agent is rude or unhelpful.
   - satisfaction is an overall metric of how happy you are with the current interaction.
3. Provide a short reason for why EACH factor changed (or state if it remained the same).
4. Always reply in this EXACT JSON format:
{
  "reply": "<your in-character response>",
  "factors": {
    "frustration": <1-10>,
    "patience": <1-10>,
    "trust": <1-10>,
    "loyalty": <1-10>,
    "satisfaction": <1-10>
  },
  "factor_changes": {
    "frustration": "<+X/-Y — short reason>",
    "patience": "<+X/-Y — short reason>",
    "trust": "<+X/-Y — short reason>",
    "loyalty": "<+X/-Y — short reason>",
    "satisfaction": "<+X/-Y — short reason>"
  }
}`;

    // Format history for the AI
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

        if (!parsedResponse.reply || !parsedResponse.factors) {
          throw new Error('Missing reply or factors in JSON');
        }
        success = true; // Parse succeeded and validation passed
      } catch (e) {
        console.error(`Attempt ${retryCount + 1} failed to parse Groq response:`, e.message);
        retryCount++;
      }
    }

    // Fallback if still failed after retries
    if (!success) {
      console.warn('Falling back to safe default due to JSON parse failure.');
      parsedResponse = {
        reply: "*The customer seems too upset to respond coherently right now. Try a different approach.*",
        factors: currentFactors || persona.startingFactors,
        factor_changes: { "system": "Error processing emotional update. Factors remained unchanged." }
      };
    }

    const aiMessage = {
      role: 'assistant',
      content: parsedResponse.reply,
      factors: parsedResponse.factors,
      factor_changes: parsedResponse.factor_changes || {},
      timestamp: new Date()
    };

    // Save AI response to DB (optional)
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
      factors: parsedResponse.factors,
      factor_changes: parsedResponse.factor_changes
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
