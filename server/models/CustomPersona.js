const mongoose = require('mongoose');

const customPersonaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  backstory: { type: String, required: true },
  initialMessage: { type: String, required: true },
  startingFactors: {
    frustration: { type: Number, default: 5 },
    patience: { type: Number, default: 5 },
    trust: { type: Number, default: 5 },
    loyalty: { type: Number, default: 5 },
    satisfaction: { type: Number, default: 5 }
  },
  crmData: {
    accountName: String,
    accountStatus: String,
    customerSince: String,
    issueRelatedTo: String
  },
  avatarUrl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CustomPersona', customPersonaSchema);
