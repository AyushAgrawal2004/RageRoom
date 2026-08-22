import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, ShieldAlert, Award, BrainCircuit, Activity, Users, Star, ArrowRight } from 'lucide-react';

// Floating Icon Component
const FloatingIcon = ({ icon: Icon, color, delay, top, left, right, bottom }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-15, 15, -15] }}
    transition={{ repeat: Infinity, duration: 4, delay, ease: "easeInOut" }}
    className={`absolute ${top} ${left} ${right} ${bottom} p-4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center`}
  >
    <Icon size={32} className={color} />
  </motion.div>
);

function Landing({ user }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Track scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Storytelling Text Opacities
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);

  // Floating Icons Parallax inside the scroll container
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -300]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans">
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black p-1 rounded-md">
              <Zap size={16} fill="white" stroke="none" />
            </div>
            <span className="font-bold text-lg tracking-tight">RageRoom</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="#" className="text-sm font-semibold text-slate-600 hover:text-black">Pricing</Link>
            <Link to="#" className="text-sm font-semibold text-slate-600 hover:text-black">Features</Link>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="bg-black hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all active:scale-95">
                Go to Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/auth')} className="bg-black hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all active:scale-95">
                Log in
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto">
          <FloatingIcon icon={BrainCircuit} color="text-indigo-500" delay={0} top="top-[20%]" left="left-[10%]" />
          <FloatingIcon icon={ShieldAlert} color="text-rose-500" delay={1} top="top-[15%]" right="right-[15%]" />
          <FloatingIcon icon={Award} color="text-emerald-500" delay={2} bottom="bottom-[25%]" left="left-[15%]" />
          <FloatingIcon icon={Activity} color="text-amber-500" delay={0.5} bottom="bottom-[20%]" right="right-[10%]" />
        </div>

        <div className="text-center z-10 max-w-3xl animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full font-bold text-sm mb-6 border border-indigo-100">
            <Star size={16} className="fill-indigo-700" />
            Over 100,000 simulations completed
          </div>
          <h1 className="text-[56px] md:text-[72px] font-black leading-[1.05] tracking-tight text-slate-900 mb-6">
            Train your team for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600">the worst-case scenarios.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
            RageRoom is an AI-powered roleplay simulator that generates highly irate customers. Master de-escalation safely.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2">
              Start Training for Free <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Mini Desktop View */}
      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-[24px] bg-slate-900 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.15)] ring-1 ring-slate-800">
            {/* Browser Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="mx-auto bg-slate-800 text-slate-400 text-xs font-semibold py-1.5 px-4 rounded-md">rageroom.app/chat</div>
            </div>
            {/* Browser Content - Chat Mockup */}
            <div className="bg-slate-50 rounded-b-[20px] p-8 h-[500px] flex gap-6 overflow-hidden">
               <div className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 p-4 shrink-0 flex flex-col hidden md:flex">
                  <div className="font-bold text-slate-900 mb-6">CRM Data</div>
                  <div className="w-full h-8 bg-slate-100 rounded-md mb-2"></div>
                  <div className="w-3/4 h-8 bg-slate-100 rounded-md mb-8"></div>
                  <div className="font-bold text-slate-900 mb-4">Live Metrics</div>
                  <div className="flex items-center gap-2 mb-2"><div className="w-full bg-emerald-100 h-2 rounded-full"><div className="bg-emerald-500 h-2 w-3/4 rounded-full"></div></div></div>
                  <div className="flex items-center gap-2"><div className="w-full bg-rose-100 h-2 rounded-full"><div className="bg-rose-500 h-2 w-1/4 rounded-full"></div></div></div>
               </div>
               <div className="flex-1 flex flex-col gap-4">
                 <div className="self-start max-w-[80%] bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200">
                   <p className="font-medium">Why was I charged twice for my subscription?! Fix this immediately!</p>
                 </div>
                 <div className="self-end max-w-[80%] bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-sm">
                   <p className="font-medium">I'm so sorry for the confusion. Let me pull up your billing history right now.</p>
                 </div>
                 <div className="self-center bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-widest mt-2">
                   De-escalation +10
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrollytelling Section */}
      <section ref={containerRef} className="h-[300vh] relative bg-black text-white mt-10">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          
          {/* Background Floating Elements */}
          <motion.div style={{ y: yParallax }} className="absolute inset-0 pointer-events-none opacity-40">
             <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px]"></div>
             <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-rose-600 rounded-full mix-blend-screen filter blur-[120px]"></div>
          </motion.div>

          <div className="relative w-full max-w-4xl mx-auto px-6 text-center">
            <motion.div style={{ opacity: opacity1 }} className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-5xl md:text-7xl font-black mb-6">Learn by Doing.</h2>
              <p className="text-xl text-slate-400 font-medium">Textbooks don't teach you how to handle getting screamed at.</p>
            </motion.div>
            
            <motion.div style={{ opacity: opacity2 }} className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-5xl md:text-7xl font-black mb-6">AI-Powered Personas.</h2>
              <p className="text-xl text-slate-400 font-medium">From angry executives to frustrated grandmas. Every interaction is unique.</p>
            </motion.div>

            <motion.div style={{ opacity: opacity3 }} className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-5xl md:text-7xl font-black mb-6">Instant Feedback.</h2>
              <p className="text-xl text-slate-400 font-medium">Our AI Judge grades your Empathy, Problem Solving, and Patience.</p>
            </motion.div>
          </div>
          
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-indigo-600 text-center px-6">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Ready to master de-escalation?</h2>
        <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="bg-white text-indigo-900 font-black text-lg px-10 py-4 rounded-full shadow-xl transition-all active:scale-95 hover:bg-slate-50">
          Get Started Now
        </button>
      </section>

    </div>
  );
}

export default Landing;
