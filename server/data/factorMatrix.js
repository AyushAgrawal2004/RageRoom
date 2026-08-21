const factorMatrix = {
  hostile: { frustration: 4, patience: -4, trust: -3, loyalty: -4, satisfaction: -4 },
  dismissive: { frustration: 2, patience: -2, trust: -1, loyalty: -1, satisfaction: -2 },
  vague_promise: { frustration: 1, patience: -1, trust: -2, loyalty: 0, satisfaction: -1 },
  acknowledges_no_action: { frustration: 0, patience: 0, trust: 0, loyalty: 0, satisfaction: 1 },
  empathetic_solution: { frustration: -3, patience: 2, trust: 2, loyalty: 2, satisfaction: 3 },
  direct_solution: { frustration: -2, patience: 1, trust: 1, loyalty: 1, satisfaction: 2 },
  proper_escalation: { frustration: -2, patience: 1, trust: 2, loyalty: 1, satisfaction: 2 },
  rude_but_correct: { frustration: 2, patience: -1, trust: -1, loyalty: -2, satisfaction: -1 },
  slow_or_silent: { frustration: 1, patience: -2, trust: -1, loyalty: 0, satisfaction: -1 },
  repetitive_script: { frustration: 3, patience: -4, trust: -2, loyalty: -1, satisfaction: -2 },
  neutral: { frustration: 0, patience: 0, trust: 0, loyalty: 0, satisfaction: 0 }
};

const decayConfig = {
  // Apply this decay every 'turnsPerDecay' turns
  turnsPerDecay: 3,
  deltas: {
    frustration: 0,
    patience: -1,
    trust: 0,
    loyalty: 0,
    satisfaction: 0
  }
};

module.exports = {
  factorMatrix,
  decayConfig
};
