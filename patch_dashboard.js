const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Dashboard.jsx', 'utf8');

// 1. Remove Analytics and Settings
const tabsRegex = /<div className="flex items-center gap-3 px-4 py-2\.5 text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-not-allowed opacity-60">\s*<BarChart2 size=\{18\} \/>\s*Analytics <span className="ml-auto text-\[10px\] font-bold bg-slate-100 px-2 py-0\.5 rounded-full text-slate-400">PRO<\/span>\s*<\/div>\s*<div className="flex items-center gap-3 px-4 py-2\.5 text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-not-allowed opacity-60">\s*<Settings size=\{18\} \/>\s*Settings\s*<\/div>/g;

code = code.replace(tabsRegex, '');

// 2. Update the Recent Sessions Left section
const oldRecentLeft = `<div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl shadow-inner">
                        {s.personaUsed.includes('Karen') ? '🤬' : s.personaUsed.includes('Kevin') ? '🔥' : '😤'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[15px] mb-0.5 group-hover:text-indigo-600 transition-colors">
                          {s.personaUsed}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <Clock size={12} />
                          {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>`;

const newRecentLeft = `<div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
                        <img src={\`https://api.dicebear.com/9.x/notionists/svg?seed=\${s.personaUsed}&backgroundColor=e2e8f0\`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[16px] mb-1 group-hover:text-indigo-600 transition-colors capitalize">
                          {s.personaUsed.replace(/-/g, ' ')}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{s.messages?.length || 0} messages</span>
                        </div>
                      </div>`;

code = code.replace(oldRecentLeft, newRecentLeft);

fs.writeFileSync('client/src/pages/Dashboard.jsx', code);
console.log('Patched Dashboard UI');
