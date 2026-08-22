const fs = require('fs');
let code = fs.readFileSync('server/server.js', 'utf8');

const oldCalc = `    let isHangup = false;
    if (newFactors.frustration >= 10 || newFactors.patience <= 1 || newFactors.trust <= 1 || newFactors.satisfaction <= 1) {
      isHangup = true;
    }`;
const newCalc = `    let isHangup = false;
    // Trust and Satisfaction can naturally start at 1 for some personas.
    // Only hang up if Frustration hits 10, or Patience hits 1.
    if (newFactors.frustration >= 10 || newFactors.patience <= 1) {
      isHangup = true;
    }`;

code = code.replace(oldCalc, newCalc);
fs.writeFileSync('server/server.js', code);
console.log('Patched hangup threshold');
