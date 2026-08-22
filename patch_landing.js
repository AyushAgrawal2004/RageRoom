const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Landing.jsx', 'utf8');

// 1. Remove Enterprise from Navbar and link Pricing to #pricing
const navRegex = /<Link to="#" className="text-\[15px\] font-semibold text-slate-600 hover:text-black transition-colors">Pricing<\/Link>\s*<Link to="#" className="text-\[15px\] font-semibold text-slate-600 hover:text-black transition-colors">Enterprise<\/Link>/;
code = code.replace(navRegex, '<a href="#pricing" className="text-[15px] font-semibold text-slate-600 hover:text-black transition-colors">Pricing</a>');

// 2. Change Hero Text
const oldHero = `<h3 className="font-bold text-slate-800 text-[22px] tracking-tight mb-2">A growing library of</h3>
          <h1 className="text-[80px] md:text-[110px] font-bold leading-[1] tracking-[-0.04em] text-[#111111] mb-8">
            10,000+ tickets
          </h1>
          <p className="text-[19px] text-slate-500 mb-10 max-w-2xl mx-auto font-medium tracking-tight">
            Featuring over 1,000 unique customer personas, and 200 industries —<br/>New scenarios weekly.
          </p>`;
const newHero = `<h3 className="font-bold text-slate-800 text-[22px] tracking-tight mb-2">Welcome to RageRoom</h3>
          <h1 className="text-[60px] md:text-[90px] font-bold leading-[1.05] tracking-[-0.04em] text-[#111111] mb-8">
            Master the Art of<br/>De-escalation
          </h1>
          <p className="text-[19px] text-slate-500 mb-10 max-w-2xl mx-auto font-medium tracking-tight">
            Train against hyper-realistic, emotionally volatile AI customers. Improve your support skills, boost your confidence, and handle any crisis without the real-world consequences.
          </p>`;
code = code.replace(oldHero, newHero);

// 3. Add Pricing Section
const pricingSection = `
      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-[56px] font-black text-slate-900 tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-slate-500 font-medium">Train your support team without breaking the bank.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Trainee</h3>
              <p className="text-slate-500 font-medium mb-6">Perfect for trying out the simulator.</p>
              <div className="text-5xl font-black text-slate-900 mb-8">$0<span className="text-xl text-slate-400 font-bold tracking-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> 3 Scenarios per day</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Text Chat Mode</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Basic Report Cards</li>
              </ul>
              <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="w-full py-4 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Get Started Free</button>
            </div>
            
            {/* Pro */}
            <div className="bg-indigo-600 rounded-[32px] p-8 border border-indigo-500 shadow-2xl hover:-translate-y-2 transition-all duration-300 relative transform scale-105 z-10">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">Most Popular</div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <p className="text-indigo-200 font-medium mb-6">For dedicated support agents.</p>
              <div className="text-5xl font-black text-white mb-8">$29<span className="text-xl text-indigo-300 font-bold tracking-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-white font-medium"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Unlimited Scenarios</li>
                <li className="flex items-center gap-3 text-white font-medium"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Immersive Voice Calls</li>
                <li className="flex items-center gap-3 text-white font-medium"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Advanced Analytics</li>
                <li className="flex items-center gap-3 text-white font-medium"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Custom Personas</li>
              </ul>
              <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="w-full py-4 rounded-xl font-bold bg-white text-indigo-600 hover:bg-indigo-50 transition-colors">Start Pro Trial</button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-500 font-medium mb-6">Scale training for large support teams.</p>
              <div className="text-5xl font-black text-slate-900 mb-8">$149<span className="text-xl text-slate-400 font-bold tracking-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Everything in Pro</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Team Leaderboards</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> CRM Integrations</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Dedicated Account Manager</li>
              </ul>
              <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="w-full py-4 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>
`;

// 4. Replace Footer CTA with Pricing Section + Company Details Footer
const oldFooter = `      {/* Footer CTA */}
      <section className="py-32 bg-indigo-600 text-center px-6">
        <h2 className="text-4xl md:text-[56px] font-bold text-white mb-8 tracking-tight">Ready to master support?</h2>
        <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="bg-white text-indigo-900 font-semibold text-[17px] px-10 py-4 rounded-full shadow-xl transition-all active:scale-95 hover:bg-slate-50">
          Join for free
        </button>
      </section>`;
      
const newFooter = pricingSection + `
      {/* Footer */}
      <footer className="py-20 bg-slate-900 border-t border-slate-800 text-center px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-indigo-500 p-1.5 rounded-lg">
              <Zap size={18} fill="white" stroke="none" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">RageRoom</span>
          </div>
          <p className="text-slate-400 font-medium mb-8 max-w-lg leading-relaxed">
            Empowering customer support teams with state-of-the-art AI-driven realistic simulations to master the art of de-escalation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm font-semibold text-slate-500 mb-12">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Contact Support</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Careers</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">About Us</a>
          </div>
          <div className="text-slate-600 text-sm font-medium">
            &copy; ${new Date().getFullYear()} RageRoom Inc. All rights reserved.
          </div>
        </div>
      </footer>`;
      
code = code.replace(oldFooter, newFooter);
fs.writeFileSync('client/src/pages/Landing.jsx', code);
console.log('Patched Landing Page');
