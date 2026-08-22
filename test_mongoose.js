const mongoose = require('mongoose');

// Mock factors
const startingFactors = new Map([
  ['frustration', 5],
  ['patience', 5],
  ['trust', 5],
  ['loyalty', 5],
  ['satisfaction', 5]
]);

const getPlainFactors = (f) => {
  if (!f) return {};
  if (typeof f.toJSON === 'function') return f.toJSON();
  try {
     if (f instanceof Map) return Object.fromEntries(f);
  } catch (e) {}
  return JSON.parse(JSON.stringify(f));
};

console.log(getPlainFactors(startingFactors));
