const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },
  factors: { type: Map, of: Number },
  category: { type: String },
  deltas: { type: Map, of: Number },
  inputMode: { type: String, enum: ['chat', 'voice'], default: 'chat' },
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  personaUsed: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startingFactors: {
    type: Map,
    of: Number,
    required: true
  },
  messages: [messageSchema],
  reportCard: {
    professionalism: Number,
    deEscalation: Number,
    problemSolving: Number,
    empathy: Number,
    overallScore: Number,
    feedback: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
