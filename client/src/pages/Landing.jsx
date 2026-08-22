import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Zap, ShieldAlert, Award, BrainCircuit, Activity, Users, Star, ArrowRight, Play, MessageSquare, Briefcase, Heart, Cloud, Shield, Coffee, Box, Music, Video, ShoppingBag, LayoutDashboard, Settings } from 'lucide-react';

// Premium Apple-style App Icons
const AppIcon = ({ bg, icon: Icon, delay, size = "w-20 h-20", top, left, right, bottom, iconSize=32, text }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-10, 10, -10] }}
    transition={{ repeat: Infinity, duration: 6, delay, ease: "easeInOut" }}
    className={`absolute ${top} ${left} ${right} ${bottom} ${size} rounded-[24px] ${bg} shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-center justify-center text-white border border-black/5 overflow-hidden z-0`}
  >
    {Icon && <Icon size={iconSize} strokeWidth={2.5} />}
    {text && <span className="font-black text-2xl tracking-tighter">{text}</span>}
  </motion.div>
);

// Horizontal Gallery Phone Component
const GalleryPhone = ({ title, bg, customerName, emoji, level, messages }) => (
  <div className="flex flex-col gap-5 shrink-0 w-[300px]">
    <h4 className="text-center font-bold text-slate-800 text-[16px] tracking-tight">{title}</h4>
    <div className={`${bg} rounded-[40px] p-4 shadow-sm border-[8px] border-[#111] h-[600px] flex flex-col overflow-hidden relative group`}>
      <div className="absolute top-0 inset-x-0 h-6 flex justify-center items-start bg-[#111] rounded-b-[16px] w-[130px] mx-auto z-10"></div>
      
      <div className="flex items-center gap-3 mt-6 mb-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100/50">
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">{emoji}</div>
        <div>
          <div className="font-bold text-slate-900 text-sm leading-tight">{customerName}</div>
          <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-0.5">{level}</div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        {messages.map((m, i) => (
           m.type === 'system' ? (
             <div key={i} className="self-center bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full my-1 shadow-sm">
               {m.text}
             </div>
           ) : (
             <div key={i} className={`max-w-[90%] p-4 rounded-[20px] text-[13.5px] font-medium leading-snug shadow-sm ${
               m.isBot ? 'self-end bg-[#4F46E5] text-white rounded-tr-sm' : 'self-start bg-white text-slate-800 rounded-tl-sm border border-slate-100'
             }`}>
               {m.text}
             </div>
           )
        ))}
      </div>
      
      <div className="h-12 w-full bg-white mt-auto rounded-full flex items-center px-4 gap-3 shadow-sm border border-slate-100/50">
        <div className="w-full h-2 bg-slate-100 rounded-full"></div>
      </div>
    </div>
  </div>
);

const ScenariosMarquee = () => (
  <>
    <GalleryPhone 
      title="Refund Denied" bg="bg-slate-50" customerName="John D." emoji="🤬" level="Level 8 Irate"
      messages={[
        { text: "I demanded a refund 3 days ago! Where is my money?!", isBot: false },
        { text: "I'm so sorry, John. Refunds take 5-7 business days to process.", isBot: true },
        { text: "Unacceptable! I am reporting you to the BBB right now.", isBot: false },
        { type: "system", text: "Frustration +15" },
        { text: "Let me waive your cancellation fee to help make up for the wait.", isBot: true },
        { type: "system", text: "De-escalation +20" },
      ]}
    />
    <GalleryPhone 
      title="Account Locked" bg="bg-orange-50/50" customerName="Sarah M." emoji="😤" level="Level 6 Frustrated"
      messages={[
        { text: "My account is locked and I have a flight in 2 hours!!!", isBot: false },
        { text: "I see the security hold, Sarah. Give me one moment.", isBot: true },
        { type: "system", text: "Patience -10" },
        { text: "I don't have a moment! Fix it or I miss my flight!", isBot: false },
        { text: "I have overridden the lock. You are good to go.", isBot: true },
        { text: "Oh thank god. Finally.", isBot: false },
      ]}
    />
    <GalleryPhone 
      title="Technical Outage" bg="bg-indigo-50/50" customerName="CTO Kevin" emoji="🔥" level="Level 10 Furious"
      messages={[
        { text: "Your servers are down! We are losing thousands per minute!", isBot: false },
        { text: "Our engineers are investigating a DNS issue right now.", isBot: true },
        { text: "Investigating?! Give me an ETA right now or we cancel our contract.", isBot: false },
        { type: "system", text: "Escalation Warning" },
        { text: "I will personally call you in 5 minutes with the exact ETA.", isBot: true },
      ]}
    />
    <GalleryPhone 
      title="Shipping Delay" bg="bg-rose-50/50" customerName="Karen W." emoji="🗣️" level="Level 9 Irate"
      messages={[
        { text: "It was supposed to be here by Christmas! You ruined it!", isBot: false },
        { text: "I sincerely apologize. Weather delayed the logistics hub.", isBot: true },
        { text: "I don't care about the weather! I want to speak to a manager!", isBot: false },
        { text: "I am a manager. I am fully refunding the order and giving you a $100 credit.", isBot: true },
        { type: "system", text: "Empathy +30" },
      ]}
    />
    <GalleryPhone 
      title="Banned User" bg="bg-slate-100/50" customerName="GamerPro99" emoji="☠️" level="Level 10 Toxic"
      messages={[
        { text: "UNBAN ME NOW YOU SCAMMERS", isBot: false },
        { text: "Your account was suspended for violating TOS.", isBot: true },
        { text: "I DID NOTHING WRONG. I WILL SUE YOU GHOST DEV", isBot: false },
        { text: "We have chat logs proving abusive behavior. The ban is permanent.", isBot: true },
        { type: "system", text: "Firmness +25" },
      ]}
    />
  </>
);

function Landing({ user }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Increased dwell time: sharp transitions, long reading periods
  const op1 = useTransform(smoothProgress, [0, 0.20, 0.25, 1], [1, 1, 0, 0]);
  const op2 = useTransform(smoothProgress, [0, 0.25, 0.30, 0.55, 0.60, 1], [0, 0, 1, 1, 0, 0]);
  const op3 = useTransform(smoothProgress, [0, 0.60, 0.65, 1], [0, 0, 1, 1]);

  const y1 = useTransform(smoothProgress, [0, 0.20, 0.25, 1], [0, 0, -40, -40]);
  const y2 = useTransform(smoothProgress, [0, 0.25, 0.30, 0.55, 0.60, 1], [40, 40, 0, 0, -40, -40]);
  const y3 = useTransform(smoothProgress, [0, 0.60, 0.65, 1], [40, 40, 0, 0]);

  // Premium UI right-side visual state mapping (sync perfectly with text)
  const uiState1 = useTransform(smoothProgress, [0, 0.20, 0.25, 1], [1, 1, 0, 0]);
  const uiState2 = useTransform(smoothProgress, [0, 0.25, 0.30, 0.55, 0.60, 1], [0, 0, 1, 1, 0, 0]);
  const uiState3 = useTransform(smoothProgress, [0, 0.60, 0.65, 1], [0, 0, 1, 1]);

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-indigo-100">
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/90 backdrop-blur-xl z-50 transition-all border-b border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-black p-1.5 rounded-lg">
                <Zap size={18} fill="white" stroke="none" />
              </div>
              <span className="font-bold text-xl tracking-tight text-black">RageRoom</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <Link to="#" className="text-[15px] font-semibold text-slate-600 hover:text-black transition-colors">Pricing</Link>
            <Link to="#" className="text-[15px] font-semibold text-slate-600 hover:text-black transition-colors">Enterprise</Link>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="bg-black hover:bg-slate-800 text-white text-[15px] font-semibold px-6 py-2.5 rounded-full transition-all active:scale-95">
                Go to Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/auth')} className="bg-black hover:bg-slate-800 text-white text-[15px] font-semibold px-6 py-2.5 rounded-full transition-all active:scale-95">
                Join for free
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-[20vh] pb-[10vh] overflow-hidden flex flex-col items-center justify-center min-h-[85vh] bg-white">
        {/* Floating App Icons - Pushed to edges to prevent overlap */}
        <div className="absolute inset-0 pointer-events-none max-w-[1400px] mx-auto">
          {/* Top Row */}
          <AppIcon bg="bg-[#FFCC00] text-black" icon={Coffee} delay={0.2} top="top-[15%]" left="left-[8%]" />
          <AppIcon bg="bg-black" icon={Cloud} delay={1.5} top="top-[20%]" left="left-[22%]" size="w-16 h-16" iconSize={24} />
          <AppIcon bg="bg-slate-100 text-slate-400 border-none shadow-none" icon={Video} delay={0.7} top="top-[10%]" left="left-[65%]" size="w-14 h-14" iconSize={20} />
          <AppIcon bg="bg-[#9146FF]" icon={MessageSquare} delay={2.1} top="top-[16%]" right="right-[22%]" />
          <AppIcon bg="bg-[#FF5A5F]" delay={0.5} top="top-[18%]" right="right-[8%]" size="w-12 h-12" />

          {/* Middle Row (Pushed extremely wide) */}
          <AppIcon bg="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]" icon={Play} delay={1.1} top="top-[45%]" left="left-[5%]" />
          <AppIcon bg="bg-[#000000]" text="X" delay={2.8} top="top-[52%]" right="right-[5%]" />

          {/* Bottom Row */}
          <AppIcon bg="bg-white text-slate-800" icon={BrainCircuit} delay={0.4} bottom="bottom-[15%]" left="left-[12%]" />
          <AppIcon bg="bg-[#00D859]" icon={Music} delay={1.8} bottom="bottom-[18%]" left="left-[28%]" size="w-16 h-16" iconSize={24} />
          <AppIcon bg="bg-[#0061FF]" icon={Box} delay={0.9} bottom="bottom-[10%]" right="right-[28%]" />
          <AppIcon bg="bg-[#FF385C]" icon={Heart} delay={2.5} bottom="bottom-[12%]" right="right-[15%]" />
          <AppIcon bg="bg-black" icon={ShoppingBag} delay={0.1} bottom="bottom-[5%]" right="right-[4%]" />
        </div>

        {/* Center Content */}
        <div className="text-center z-10 max-w-4xl animate-slide-up flex flex-col items-center relative mt-8">
          <h3 className="font-bold text-slate-800 text-[22px] tracking-tight mb-2">A growing library of</h3>
          <h1 className="text-[80px] md:text-[110px] font-bold leading-[1] tracking-[-0.04em] text-[#111111] mb-8">
            10,000+ tickets
          </h1>
          <p className="text-[19px] text-slate-500 mb-10 max-w-2xl mx-auto font-medium tracking-tight">
            Featuring over 1,000 unique customer personas, and 200 industries —<br/>New scenarios weekly.
          </p>
          <div className="flex items-center justify-center gap-4 z-20">
            <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="bg-[#111111] hover:bg-black text-white font-semibold text-[17px] px-8 py-4 rounded-full transition-all active:scale-95 shadow-lg shadow-black/10">
              Join for free
            </button>
            <button className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-[17px] px-8 py-4 rounded-full transition-all active:scale-95 flex items-center gap-2 shadow-sm">
              See our plans <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Marquee Gallery Section */}
      <section className="py-24 bg-white overflow-hidden border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto px-6 mb-16">
          <h2 className="text-[48px] md:text-[64px] font-bold leading-[1.05] tracking-[-0.03em] text-[#111111]">
            Find scenarios<br/>in seconds.
          </h2>
        </div>
        
        {/* Infinite CSS Marquee */}
        <div className="flex w-max overflow-hidden pb-12 pt-4">
           <motion.div 
             animate={{ x: ["0%", "-50%"] }} 
             transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
             className="flex gap-8 px-4"
           >
             <ScenariosMarquee />
             <ScenariosMarquee />
           </motion.div>
        </div>
      </section>

      {/* Scrollytelling Section */}
      <section ref={containerRef} className="h-[500vh] relative bg-black text-white">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          
          {/* Subtle glowing background orbs */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
             <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px]"></div>
             <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-rose-600 rounded-full mix-blend-screen filter blur-[120px]"></div>
          </div>

          <div className="w-full max-w-[1200px] mx-auto px-8 grid grid-cols-12 gap-16 items-center relative z-10">
            
            {/* Left: Tightly Tracked Typography Blocks */}
            <div className="col-span-5 relative h-[400px] flex items-center">
              <motion.div style={{ opacity: op1, y: y1 }} className="absolute inset-0 flex flex-col justify-center">
                <div className="w-14 h-14 rounded-[16px] bg-[#1A1A1A] border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                  <MessageSquare size={26} className="text-white" />
                </div>
                <h2 className="text-[52px] font-bold tracking-[-0.04em] text-white leading-[1.05] mb-6">
                  Practice dealing with<br/>angry customers.
                </h2>
                <p className="text-[20px] text-slate-400 font-medium leading-[1.4] tracking-tight">
                  Safely experience the stress of an irate user without risking your real-world metrics. Learn de-escalation through immersion.
                </p>
              </motion.div>
              
              <motion.div style={{ opacity: op2, y: y2 }} className="absolute inset-0 flex flex-col justify-center">
                <div className="w-14 h-14 rounded-[16px] bg-[#1A1A1A] border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                  <BrainCircuit size={26} className="text-white" />
                </div>
                <h2 className="text-[52px] font-bold tracking-[-0.04em] text-white leading-[1.05] mb-6">
                  Powered by advanced<br/>AI roleplay.
                </h2>
                <p className="text-[20px] text-slate-400 font-medium leading-[1.4] tracking-tight">
                  Our LLMs are trained on millions of real support tickets to react exactly like a human, remembering context and holding grudges.
                </p>
              </motion.div>

              <motion.div style={{ opacity: op3, y: y3 }} className="absolute inset-0 flex flex-col justify-center">
                <div className="w-14 h-14 rounded-[16px] bg-[#1A1A1A] border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                  <Activity size={26} className="text-white" />
                </div>
                <h2 className="text-[52px] font-bold tracking-[-0.04em] text-white leading-[1.05] mb-6">
                  Get graded instantly<br/>on your performance.
                </h2>
                <p className="text-[20px] text-slate-400 font-medium leading-[1.4] tracking-tight">
                  Detailed report cards rate your empathy, de-escalation, and problem-solving skills based on behavioral science.
                </p>
              </motion.div>
            </div>

            {/* Right: Dynamic High-Fidelity UI Mockup */}
            <div className="col-span-7 relative h-[650px] w-full bg-[#0A0A0A] rounded-[32px] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center">
               
               {/* State 1: The Chat Interface */}
               <motion.div style={{ opacity: uiState1 }} className="absolute inset-0 flex">
                 {/* Sidebar */}
                 <div className="w-[240px] bg-[#111111] border-r border-white/5 p-6 flex flex-col gap-6">
                   <div className="w-full h-8 bg-white/5 rounded-lg"></div>
                   <div className="flex flex-col gap-3 mt-4">
                     <div className="w-full h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-lg"></div>
                     <div className="w-full h-10 bg-white/5 rounded-lg"></div>
                     <div className="w-full h-10 bg-white/5 rounded-lg"></div>
                   </div>
                 </div>
                 {/* Main Window */}
                 <div className="flex-1 p-8 flex flex-col gap-6 bg-[#0A0A0A]">
                    <div className="self-start max-w-[80%] bg-[#1A1A1A] border border-white/10 p-5 rounded-2xl rounded-tl-sm shadow-xl text-white">
                      <p className="text-[15px] font-medium leading-relaxed">I am absolutely furious. You charged my card twice for the same subscription! This is literal theft!</p>
                    </div>
                    <div className="self-end max-w-[80%] bg-indigo-600 p-5 rounded-2xl rounded-tr-sm shadow-xl text-white mt-4">
                      <p className="text-[15px] font-medium leading-relaxed">I sincerely apologize for the billing error. Let me pull up your account and reverse the duplicate charge immediately.</p>
                    </div>
                    <div className="self-center mt-6">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">De-escalation +20</span>
                    </div>
                 </div>
               </motion.div>

               {/* State 2: The Math/Brain */}
               <motion.div style={{ opacity: uiState2 }} className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]">
                  <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 text-center">
                      <div className="text-rose-500 text-5xl font-black mb-2">9.8</div>
                      <div className="text-white/40 text-xs font-bold uppercase tracking-widest">Frustration Level</div>
                    </div>
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 text-center">
                      <div className="text-emerald-500 text-5xl font-black mb-2">12s</div>
                      <div className="text-white/40 text-xs font-bold uppercase tracking-widest">Avg Response Time</div>
                    </div>
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 text-center col-span-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
                        <span>Patience</span>
                        <span>Depleted</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[15%] h-full bg-rose-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
               </motion.div>
               
               {/* State 3: The Report Card */}
               <motion.div style={{ opacity: uiState3 }} className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]">
                  <div className="w-full max-w-md bg-[#111] rounded-[32px] border border-white/10 p-10 shadow-2xl flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center mb-8">
                      <span className="text-6xl font-black text-emerald-500">A+</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Passed Simulation</h3>
                    <p className="text-white/50 font-medium mb-10">Session #4024</p>
                    <div className="w-full grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                        <div className="text-2xl font-black text-white mb-1">9/10</div>
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Empathy</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                        <div className="text-2xl font-black text-white mb-1">8/10</div>
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Resolution</div>
                      </div>
                    </div>
                  </div>
               </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-indigo-600 text-center px-6">
        <h2 className="text-4xl md:text-[56px] font-bold text-white mb-8 tracking-tight">Ready to master support?</h2>
        <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="bg-white text-indigo-900 font-semibold text-[17px] px-10 py-4 rounded-full shadow-xl transition-all active:scale-95 hover:bg-slate-50">
          Join for free
        </button>
      </section>

    </div>
  );
}

export default Landing;
