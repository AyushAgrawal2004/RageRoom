const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Dashboard.jsx', 'utf8');

code = code.replace(
  'className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"',
  'className="bg-gradient-to-b from-indigo-500 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_4px_0_#3730a3,0_10px_20px_rgba(79,70,229,0.2)] active:shadow-[0_0px_0_#3730a3,0_0px_0_rgba(79,70,229,0)] active:translate-y-[4px] transition-all"'
);

fs.writeFileSync('client/src/pages/Dashboard.jsx', code);
