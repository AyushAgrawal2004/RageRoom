const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Conversation = require('./models/Conversation');
const User = require('./models/User');
const CustomPersona = require('./models/CustomPersona');

const personas = require('./data/personas');
const { classifyAgentMessage } = require('./services/classifier');
const { factorMatrix, decayConfig } = require('./data/factorMatrix');
const { generateReportCard } = require('./services/judge');

const app = express();
const PORT = process.env.PORT || 5005;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/difficult_customer_simulator')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize OpenAI SDK for Groq
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/* =======================================================================
   AUTH ROUTES
======================================================================= */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// Middleware to authenticate requests
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/* =======================================================================
   SESSION ROUTE
======================================================================= */
app.get('/api/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = await Conversation.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select('sessionId personaUsed createdAt reportCard');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});


/* =======================================================================
   CUSTOM PERSONAS ROUTES
======================================================================= */
app.get('/api/personas/custom', authMiddleware, async (req, res) => {
  try {
    const customPersonas = await CustomPersona.find({ userId: req.user.userId });
    res.json(customPersonas);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch custom personas' });
  }
});

app.post('/api/personas/custom', authMiddleware, async (req, res) => {
  try {
    const { name, description, backstory, initialMessage, startingFactors } = req.body;
    
    // Auto-generate Dicebear PF
    const seed = name.replace(/\s+/g, '') + Date.now();
    const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=f3f4f6`;

    const custom = new CustomPersona({
      userId: req.user.userId,
      name,
      description,
      backstory,
      initialMessage,
      startingFactors: startingFactors || { frustration: 5, patience: 5, trust: 5, loyalty: 5, satisfaction: 5 },
      avatarUrl,
      crmData: {
        accountName: "Custom User",
        accountStatus: "Unknown",
        customerSince: "N/A",
        issueRelatedTo: "Custom Scenario"
      }
    });

    await custom.save();
    // Return with an 'id' field to match global personas structure
    const customWithId = custom.toObject();
    customWithId.id = custom._id.toString();
    
    res.json(customWithId);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create custom persona', details: err.message });
  }
});

/* =======================================================================
   LEADERBOARD ROUTE
======================================================================= */
app.get('/api/leaderboard', async (req, res) => {
  try {
    // Find highest scores globally, grouped by user and persona
    const topSessions = await Conversation.find({ 
      'reportCard.overallScore': { $exists: true },
      userId: { $ne: null }
    })
    .sort({ 'reportCard.overallScore': -1 })
    .populate('userId', 'username')
    .limit(100);

    res.json(topSessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/* =======================================================================
   SIMULATOR ROUTES
======================================================================= */
app.get('/api/personas', (req, res) => {
  res.json(personas);
});

// POST /api/start - start a new session (optionally authenticated)
app.post('/api/start', async (req, res) => {
  try {
    const { personaId, customFactors, userId } = req.body;
    
    
    let persona = personas.find(p => p.id === personaId);
    if (!persona) {
      const customP = await CustomPersona.findById(personaId);
      if (customP) {
        persona = customP.toObject();
        persona.id = persona._id.toString();
      } else {
        persona = personas[0];
      }
    }

    const startingFactors = customFactors || persona.startingFactors;
    
    // Generate dynamic CRM Data
    const crmData = { ...persona.crmData };
    for (const key in crmData) {
      if (typeof crmData[key] === 'string' && crmData[key].includes('[RANDOM]')) {
         const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digit random
         crmData[key] = crmData[key].replace('[RANDOM]', randomNum);
      }
    }
    
    const sessionId = uuidv4();
    const initialMessage = {
      role: 'assistant',
      content: persona.initialMessage,
      factors: startingFactors,
      category: 'initial',
      deltas: {},
      inputMode: 'chat',
      timestamp: new Date()
    };
    
    const conversation = new Conversation({
      sessionId,
      userId: userId || null, 
      personaUsed: persona.id,
      startingFactors,
      crmData,
      messages: [initialMessage]
    });
    await conversation.save();

    res.json({ sessionId, message: initialMessage, persona, crmData });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Helper to clamp values between 1 and 10
const clamp = (val) => Math.max(1, Math.min(10, val));

// POST /api/chat - process human response
app.post('/api/chat', async (req, res) => {
  const { sessionId, conversationHistory, userMessage, personaId, currentFactors, inputMode, crmData } = req.body;

  if (!sessionId || !userMessage) {
    return res.status(400).json({ error: 'sessionId and userMessage are required' });
  }

  try {
    // Save user message to DB
    await Conversation.findOneAndUpdate(
      { sessionId },
      { $push: { messages: { role: 'user', content: userMessage, inputMode: inputMode || 'chat', timestamp: new Date() } } },
      { upsert: true }
    );

    // 2. Classify the agent's response using the secondary LLM (with history context)
    const category = await classifyAgentMessage(openai, userMessage, conversationHistory);
    
    // 2. Get deterministic deltas
    const deltas = factorMatrix[category] || factorMatrix['neutral'];
    
    // 3. Check for decay
    const userTurnCount = (conversationHistory || []).filter(m => m.role === 'user').length + 1;
    let applyDecay = false;
    if (userTurnCount > 0 && userTurnCount % decayConfig.turnsPerDecay === 0) {
      applyDecay = true;
    }

    // 4. Calculate new factors
    const newFactors = {};
    const finalDeltas = {}; 

    for (const factor of Object.keys(currentFactors)) {
      let change = deltas[factor] || 0;
      if (applyDecay && decayConfig.deltas[factor]) {
        change += decayConfig.deltas[factor];
      }
      
      const newVal = clamp(currentFactors[factor] + change);
      newFactors[factor] = newVal;
      finalDeltas[factor] = newVal - currentFactors[factor];
    }

    const persona = personas.find(p => p.id === personaId) || personas[0];
    
    // Format CRM data for the AI
    let crmPromptAddition = "";
    if (crmData) {
      crmPromptAddition = `\n\nYour Real Account Details (If the agent asks for these, provide them exactly. If the agent provides incorrect numbers, correct them or get suspicious):\n`;
      for (const [k, v] of Object.entries(crmData)) {
        crmPromptAddition += `- ${k}: ${v}\n`;
      }
    }
    
    let isHangup = false;
    // Trust and Satisfaction can naturally start at 1 for some personas.
    // Only hang up if Frustration hits 10, or Patience hits 1.
    if (newFactors.frustration >= 10 || newFactors.patience <= 1) {
      isHangup = true;
    }

    // 5. Build prompt for AI
    const SYSTEM_PROMPT = `You are a customer interacting with a support agent.
Role: ${persona.name}
Backstory/Situation: ${persona.backstory}${crmPromptAddition}

Your CURRENT emotional state is:
- frustration: ${newFactors.frustration}/10
- patience: ${newFactors.patience}/10
- trust: ${newFactors.trust}/10
- loyalty: ${newFactors.loyalty}/10
- satisfaction: ${newFactors.satisfaction}/10

The agent's last message caused your state to change by:
Frustration: ${deltas.frustration > 0 ? '+' : ''}${deltas.frustration}
Patience: ${deltas.patience > 0 ? '+' : ''}${deltas.patience}

Rules for your response:
1. Stay perfectly in character. YOU ARE NOT AN AI ASSISTANT. YOU ARE A REAL CUSTOMER.
2. Keep your responses concise (1-3 sentences).
3. If the agent repeats a question you just answered, express extreme frustration. DO NOT repeat your previous message.
4. If the agent asks you to wait or puts you on hold, and your patience is low, complain about not having time to wait.
5. Let your emotional state heavily dictate your tone. If frustration is high, use short sentences. If patience is low, threaten to cancel or escalate. If trust is high, be more forgiving.
6. If the agent's action lowered your frustration (Frustration negative delta), you MUST explicitly acknowledge it and calm down slightly.
7. CRITICAL: If the agent is rude, unhelpful, or curses at you (e.g. telling you to "fuck off"), you MUST react as a genuinely furious human being. DO NOT be polite. DO NOT apologize. Threaten to sue the company, demand their manager, and act deeply offended. NEVER revert to a helpful support bot.

Instructions:
1. Respond in character to the agent's latest message based on your backstory and the new emotional state.
2. Output ONLY JSON in this exact format:
{
  "reply": "<your in-character response text>"
}`;

    let historyStr = '';
    (conversationHistory || []).forEach(msg => {
       const speaker = msg.role === 'assistant' ? persona.name : 'Support Agent';
       historyStr += `${speaker}: ${msg.content}\n`;
    });
    
    let additionalInstructions = '';
    if (isHangup) {
       additionalInstructions = "\n\nCRITICAL INSTRUCTION: Your Frustration has reached maximum (10) OR your Patience/Trust has reached minimum (1). You have had enough of this support agent. You MUST explicitly say you are hanging up, demanding a manager, or leaving, and end the conversation immediately.";
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + additionalInstructions },
      { role: 'user', content: `Here is the conversation history:\n${historyStr}\nSupport Agent's newest message: "${userMessage}"\n\nGenerate your (${persona.name}'s) next response. Remember, YOU ARE THE CUSTOMER. Stay in character.` }
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

    await Conversation.findOneAndUpdate(
      { sessionId },
      { $push: { messages: aiMessage } }
    );

    res.json({
      reply: parsedResponse.reply,
      factors: newFactors,
      category,
      deltas: finalDeltas,
      isHangup
    });

  } catch (error) {
    console.error('Error calling Groq API:', error);
    res.status(500).json({ error: 'Failed to communicate with AI', details: error.message });
  }
});

// POST /api/end - end session and get report card
app.post('/api/end', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  try {
    const conversation = await Conversation.findOne({ sessionId });
    if (!conversation) return res.status(404).json({ error: 'Session not found' });
    
    if (conversation.reportCard && conversation.reportCard.overallScore !== undefined) {
      return res.json(conversation);
    }

    let transcript = '';
    let agentTurnCount = 0;
    
    conversation.messages.forEach(msg => {
      const roleName = msg.role === 'assistant' ? 'CUSTOMER' : 'AGENT';
      if (msg.role === 'user') agentTurnCount++;
      transcript += `${roleName}: ${msg.content}\n\n`;
    });
    
    // Safely convert Mongoose objects/maps to plain objects
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


    // Call the LLM judge for category scores and feedback
    const reportCard = await generateReportCard(transcript, startingFactors, finalFactors, agentTurnCount);
    
    // Algorithmic Score Calculation
    let score = 50; // Base score
    if (finalFactors && startingFactors) {
      score += (startingFactors.frustration - finalFactors.frustration) * 5; // Frustration drop is good
      score += (finalFactors.patience - startingFactors.patience) * 5;
      score += (finalFactors.trust - startingFactors.trust) * 5;
      score += (finalFactors.loyalty - startingFactors.loyalty) * 3;
      score += (finalFactors.satisfaction - startingFactors.satisfaction) * 8;
    }
    
    // Clamp score between 0 and 100
    reportCard.overallScore = isNaN(score) ? 50 : Math.max(0, Math.min(100, Math.round(score)));

    conversation.reportCard = reportCard;
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    console.error('Error generating report card:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
