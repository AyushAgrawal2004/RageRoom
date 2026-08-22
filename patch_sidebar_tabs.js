const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Dashboard.jsx', 'utf8');

// Find and remove Analytics tab
const analyticsRegex = /<div[^>]*>\s*<BarChart3[^>]*\/>\s*Analytics[\s\S]*?<\/div>/g;
code = code.replace(analyticsRegex, '');

// Find and remove Settings tab
const settingsRegex = /<div[^>]*>\s*<Settings[^>]*\/>\s*Settings\s*<\/div>/g;
code = code.replace(settingsRegex, '');

fs.writeFileSync('client/src/pages/Dashboard.jsx', code);
console.log('Patched Sidebar Tabs');
