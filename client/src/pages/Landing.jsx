import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Zap, ShieldAlert, Award, BrainCircuit, Activity, Users, Star, ArrowRight, Play, MessageSquare, Briefcase, Heart, Cloud, Shield, Coffee, Box, Music, Video, ShoppingBag } from 'lucide-react';

// Premium Apple-style App Icons
const AppIcon = ({ bg, icon: Icon, delay, size = "w-20 h-20", top, left, right, bottom, iconSize=32, text }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-10, 10, -10] }}
    transition={{ repeat: Infinity, duration: 6, delay, ease: "easeInOut" }}
    className={`absolute ${top} ${left} ${right} ${bottom} ${size} rounded-[24px] ${bg} shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-center justify-center text-white border border-black/5 overflow-hidden`}
  >
    {Icon && <Icon size={iconSize} strokeWidth={2.5} />}
    {text && <span className="font-black text-2xl tracking-tighter">{text}</span>}
  </motion.div>
);

// Horizontal Gallery Phone Component
const GalleryPhone = ({ title, bg, customerName, emoji, level, messages }) => (
  <div className="flex flex-col gap-6 shrink-0 snap-center w-[280px]">
    <h4 className="text-center font-bold text-slate-900 text-[15px]">{title}</h4>
    <div className={`${bg} rounded-[40px] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-[8px] border-[#18181B] h-[580px] flex flex-col overflow-hidden relative group hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-shadow duration-300`}>
      <div className="absolute top-0 inset-x-0 h-6 flex justify-center items-start bg-[#18181B] rounded-b-[14px] w-[120px] mx-auto z-10"></div>
      
      {/* Header */}
      <div className="flex items-center gap-3 mt-5 mb-5 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 relative z-0">
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">{emoji}</div>
        <div>
          <div className="font-bold text-slate-900 text-sm leading-tight">{customerName}</div>
          <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{level}</div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden relative z-0">
        {messages.map((m, i) => (
           m.type === 'system' ? (
             <div key={i} className="self-center bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full my-2">
               {m.text}
             </div>
           ) : (
             <div key={i} className={`max-w-[90%] p-3.5 rounded-[18px] text-[13px] font-medium leading-snug ${
               m.isBot ? 'self-end bg-indigo-600 text-white rounded-tr-sm shadow-md' : 'self-start bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100'
             }`}>
               {m.text}
             </div>
           )
        ))}
      </div>
      
      <div className="h-12 w-full bg-white mt-auto rounded-full shadow-[0_-4px_20px_rgba(0,0,0,0.03)] flex items-center px-4 gap-3 border border-slate-100">
        <div className="w-full h-3 bg-slate-100 rounded-full"></div>
      </div>
    </div>
  </div>
);

function Landing({ user }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Track scroll progress for the sticky section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Add inertia/spring physics to smooth out abrupt mouse-wheel scrolling
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Storytelling Opacities (Crisp Mobbin Style) - must map full 0 to 1 range to prevent extrapolation bugs
  const op1 = useTransform(smoothProgress, [0, 0.25, 0.35, 1], [1, 1, 0, 0]);
  const op2 = useTransform(smoothProgress, [0, 0.25, 0.35, 0.60, 0.70, 1], [0, 0, 1, 1, 0, 0]);
  const op3 = useTransform(smoothProgress, [0, 0.60, 0.70, 1], [0, 0, 1, 1]);

  // Storytelling Y Translate for smooth sliding
  const y1 = useTransform(smoothProgress, [0, 0.25, 0.35, 1], [0, 0, -50, -50]);
  const y2 = useTransform(smoothProgress, [0, 0.25, 0.35, 0.60, 0.70, 1], [50, 50, 0, 0, -50, -50]);
  const y3 = useTransform(smoothProgress, [0, 0.60, 0.70, 1], [50, 50, 0, 0]);

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-indigo-100">
      
      {/* Navigation - Ultra Minimal */}
      <nav className="fixed top-0 inset-x-0 bg-white/90 backdrop-blur-xl z-50 transition-all">
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

      {/* Hero Section - Mobbin Exact Match */}
      <section className="relative pt-[20vh] pb-[10vh] overflow-hidden flex flex-col items-center justify-center min-h-[85vh] bg-white">
        
        {/* Floating App Icons (Mimicking Netflix, Airbnb, Twitch etc.) */}
        <div className="absolute inset-0 pointer-events-none max-w-[1400px] mx-auto">
          {/* Top Row */}
          <AppIcon bg="bg-[#FFCC00] text-black" icon={Coffee} delay={0.2} top="top-[15%]" left="left-[12%]" />
          <AppIcon bg="bg-black" icon={Cloud} delay={1.5} top="top-[20%]" left="left-[28%]" size="w-16 h-16" iconSize={24} />
          <AppIcon bg="bg-slate-100 text-slate-400 border-none shadow-none" icon={Video} delay={0.7} top="top-[12%]" left="left-[48%]" size="w-14 h-14" iconSize={20} />
          <AppIcon bg="bg-[#9146FF]" icon={MessageSquare} delay={2.1} top="top-[16%]" right="right-[25%]" />
          <AppIcon bg="bg-[#FF5A5F]" delay={0.5} top="top-[18%]" right="right-[10%]" size="w-12 h-12" />

          {/* Middle Row */}
          <AppIcon bg="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]" icon={Play} delay={1.1} top="top-[45%]" left="left-[15%]" />
          <AppIcon bg="bg-[#000000]" text="X" delay={2.8} top="top-[52%]" right="right-[18%]" />

          {/* Bottom Row */}
          <AppIcon bg="bg-white text-slate-800" icon={BrainCircuit} delay={0.4} bottom="bottom-[15%]" left="left-[10%]" />
          <AppIcon bg="bg-[#00D859]" icon={Music} delay={1.8} bottom="bottom-[18%]" left="left-[25%]" size="w-16 h-16" iconSize={24} />
          <AppIcon bg="bg-[#0061FF]" icon={Box} delay={0.9} bottom="bottom-[10%]" left="left-[48%]" />
          <AppIcon bg="bg-[#FF385C]" icon={Heart} delay={2.5} bottom="bottom-[12%]" right="right-[32%]" />
          <AppIcon bg="bg-black" icon={ShoppingBag} delay={0.1} bottom="bottom-[8%]" right="right-[12%]" />
        </div>

        {/* Center Content */}
        <div className="text-center z-10 max-w-4xl animate-slide-up flex flex-col items-center mt-8">
          <h3 className="font-bold text-slate-800 text-[22px] tracking-tight mb-2">A growing library of</h3>
          <h1 className="text-[80px] md:text-[110px] font-bold leading-[1] tracking-[-0.04em] text-[#111111] mb-8">
            10,000+ tickets
          </h1>
          <p className="text-[19px] text-slate-500 mb-10 max-w-2xl mx-auto font-medium tracking-tight">
            Featuring over 1,000 unique customer personas, and 200 industries —<br/>New scenarios weekly.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="bg-[#111111] hover:bg-black text-white font-semibold text-[17px] px-8 py-4 rounded-full transition-all active:scale-95">
              Join for free
            </button>
            <button className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-[17px] px-8 py-4 rounded-full transition-all active:scale-95 flex items-center gap-2">
              See our plans <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* NEW: Mobbin Pattern Gallery Section */}
      <section className="py-24 bg-white overflow-hidden border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto px-6 mb-16">
          <h2 className="text-[48px] md:text-[64px] font-bold leading-[1.05] tracking-[-0.03em] text-[#111111] mb-8">
            Find scenarios<br/>in seconds.
          </h2>
          <div className="flex flex-wrap justify-center gap-2 bg-slate-50 p-2 rounded-full w-max mx-auto shadow-sm border border-slate-100">
             <span className="px-5 py-2.5 bg-white shadow-sm rounded-full text-sm font-semibold text-slate-900 cursor-pointer">Irate Customers</span>
             <span className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-500 cursor-pointer hover:text-slate-800 transition-colors">Refund Denied</span>
             <span className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-500 cursor-pointer hover:text-slate-800 transition-colors">Account Locked</span>
             <span className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-500 cursor-pointer hover:text-slate-800 transition-colors">B2B Outage</span>
          </div>
        </div>
        
        {/* Horizontal Scrolling Gallery */}
        <div className="flex gap-8 px-[10vw] overflow-x-auto pb-12 pt-4 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none' }}>
           
           <GalleryPhone 
             title="Refund Denied"
             bg="bg-slate-50"
             customerName="John D."
             emoji="🤬"
             level="Level 8 Irate"
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
             title="Account Locked"
             bg="bg-orange-50"
             customerName="Sarah M."
             emoji="😤"
             level="Level 6 Frustrated"
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
             title="Technical Outage"
             bg="bg-indigo-50"
             customerName="CTO Kevin"
             emoji="🔥"
             level="Level 10 Furious"
             messages={[
               { text: "Your servers are down! We are losing thousands per minute!", isBot: false },
               { text: "Our engineers are investigating a DNS issue right now.", isBot: true },
               { text: "Investigating?! Give me an ETA right now or we cancel our contract.", isBot: false },
               { type: "system", text: "Escalation Warning" },
               { text: "I will personally call you in 5 minutes with the exact ETA.", isBot: true },
             ]}
           />

           <GalleryPhone 
             title="Shipping Delay"
             bg="bg-rose-50"
             customerName="Karen W."
             emoji="🗣️"
             level="Level 9 Irate"
             messages={[
               { text: "It was supposed to be here by Christmas! You ruined it!", isBot: false },
               { text: "I sincerely apologize. Weather delayed the logistics hub.", isBot: true },
               { text: "I don't care about the weather! I want to speak to a manager!", isBot: false },
               { text: "I am a manager. I am fully refunding the order and giving you a $100 credit.", isBot: true },
               { type: "system", text: "Empathy +30" },
             ]}
           />

           <GalleryPhone 
             title="Banned User"
             bg="bg-slate-100"
             customerName="GamerPro99"
             emoji="☠️"
             level="Level 10 Toxic"
             messages={[
               { text: "UNBAN ME NOW YOU SCAMMERS", isBot: false },
               { text: "Your account was suspended for violating TOS.", isBot: true },
               { text: "I DID NOTHING WRONG. I WILL SUE YOU GHOST DEV", isBot: false },
               { text: "We have chat logs proving abusive behavior. The ban is permanent.", isBot: true },
               { type: "system", text: "Firmness +25" },
             ]}
           />
           
        </div>
      </section>

      {/* Scrollytelling Section (Mobbin Style) */}
      <section ref={containerRef} className="h-[300vh] relative bg-white border-t border-slate-100">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          
          <div className="w-full max-w-[1200px] mx-auto px-6 grid grid-cols-2 gap-12 items-center">
            
            {/* Left: The fading text blocks */}
            <div className="relative h-[400px] flex items-center">
              <motion.div style={{ opacity: op1, y: y1 }} className="absolute inset-0 flex flex-col justify-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                  <ShieldAlert size={24} />
                </div>
                <h2 className="text-4xl md:text-[52px] font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                  Practice dealing with<br/>angry customers.
                </h2>
                <p className="text-xl text-slate-500 font-medium">
                  Safely experience the stress of an irate user without risking your real-world metrics.
                </p>
              </motion.div>
              
              <motion.div style={{ opacity: op2, y: y2 }} className="absolute inset-0 flex flex-col justify-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                  <BrainCircuit size={24} />
                </div>
                <h2 className="text-4xl md:text-[52px] font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                  Powered by advanced<br/>AI roleplay.
                </h2>
                <p className="text-xl text-slate-500 font-medium">
                  Our LLMs are trained on millions of real support tickets to react exactly like a human.
                </p>
              </motion.div>

              <motion.div style={{ opacity: op3, y: y3 }} className="absolute inset-0 flex flex-col justify-center">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                  <Award size={24} />
                </div>
                <h2 className="text-4xl md:text-[52px] font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                  Get graded instantly<br/>on your performance.
                </h2>
                <p className="text-xl text-slate-500 font-medium">
                  Detailed report cards rate your empathy, de-escalation, and problem-solving skills.
                </p>
              </motion.div>
            </div>

            {/* Right: Static UI Visuals that complement the text */}
            <div className="relative h-[600px] bg-slate-50 rounded-[40px] border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
               {/* Decorative background grid */}
               <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
               
               <div className="relative z-10 w-full max-w-[340px] bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">AK</div>
                   <div>
                     <div className="font-bold text-slate-900">Angry Kevin</div>
                     <div className="text-sm text-slate-500">Premium Subscriber</div>
                   </div>
                 </div>
                 <div className="space-y-4">
                   <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-sm border border-slate-100 text-slate-800 text-sm font-medium">
                     WHY DID YOU CHARGE MY CARD TWICE?! THIS IS THEFT!
                   </div>
                   <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-sm text-white text-sm font-medium ml-8 shadow-md">
                     I completely understand your frustration Kevin. Let me reverse that immediately.
                   </div>
                   <div className="flex justify-center pt-2">
                     <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200 shadow-sm">
                       De-escalation +20
                     </span>
                   </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-[#111111] text-center px-6">
        <h2 className="text-4xl md:text-[56px] font-bold text-white mb-8 tracking-tight">Ready to master support?</h2>
        <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="bg-white text-black font-semibold text-[17px] px-10 py-4 rounded-full shadow-xl transition-all active:scale-95 hover:bg-slate-200">
          Join for free
        </button>
      </section>

    </div>
  );
}

export default Landing;
