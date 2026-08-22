const fs = require('fs');
let code = fs.readFileSync('server/server.js', 'utf8');

const oldClamp = `    // Clamp score between 0 and 100
    reportCard.overallScore = Math.max(0, Math.min(100, Math.round(score)));`;
const newClamp = `    // Clamp score between 0 and 100
    reportCard.overallScore = isNaN(score) ? 50 : Math.max(0, Math.min(100, Math.round(score)));`;

code = code.replace(oldClamp, newClamp);
fs.writeFileSync('server/server.js', code);
console.log('Patched score NaN safety');
