import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Flame, Home, Activity, Wallet, User, ArrowUpRight, Zap } from "lucide-react";

export function PhoneShowcase() {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const normalizedX = (event.clientX - rect.left) / width - 0.5;
    const normalizedY = (event.clientY - rect.top) / height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <section className="py-16 md:py-24 w-full relative z-20 flex justify-center">
      {/* Container with perspective */}
      <div 
        className="w-full max-w-[400px] h-[750px] flex items-center justify-center relative perspective-[2000px] group cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          animate={reducedMotion ? undefined : { y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="relative w-[320px] h-[660px]"
        >
          {/* Glowing shadow under the phone */}
          <div 
            className="absolute -inset-10 bg-primary/20 blur-[80px] rounded-full" 
            style={{ transform: "translateZ(-100px)" }} 
          />

          {/* Back Frame */}
          <div 
            className="absolute inset-0 rounded-[54px] bg-gradient-to-br from-zinc-400 via-zinc-800 to-zinc-900 shadow-[0_0_20px_rgba(0,0,0,0.5)]" 
            style={{ transform: "translateZ(-12px)" }} 
          />
          <div 
            className="absolute inset-0 rounded-[54px] bg-gradient-to-br from-zinc-500 via-zinc-700 to-zinc-900" 
            style={{ transform: "translateZ(-6px)" }} 
          />

          {/* Side Buttons Layer */}
          <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-6px)' }}>
            <div className="absolute top-[110px] -left-[3px] w-[4px] h-[26px] bg-gradient-to-r from-zinc-400 to-zinc-600 rounded-l-[3px] shadow-sm" />
            <div className="absolute top-[160px] -left-[3px] w-[4px] h-[50px] bg-gradient-to-r from-zinc-400 to-zinc-600 rounded-l-[3px] shadow-sm" />
            <div className="absolute top-[220px] -left-[3px] w-[4px] h-[50px] bg-gradient-to-r from-zinc-400 to-zinc-600 rounded-l-[3px] shadow-sm" />
            <div className="absolute top-[180px] -right-[3px] w-[4px] h-[70px] bg-gradient-to-l from-zinc-400 to-zinc-600 rounded-r-[3px] shadow-sm" />
          </div>

          {/* Front Glass Bezel */}
          <div 
            className="absolute inset-0 rounded-[54px] bg-black p-[6px] shadow-inner" 
            style={{ transform: "translateZ(0px)" }}
          >
            {/* Inner Screen */}
            <div className="relative w-full h-full bg-[#050505] rounded-[48px] overflow-hidden flex flex-col">
              
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-between px-3">
                <div className="w-[10px] h-[10px] rounded-full bg-[#111] shadow-inner border border-white/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/30 blur-[0.5px]" />
              </div>

              {/* Status Bar */}
              <div className="absolute top-0 inset-x-0 h-14 flex items-center justify-between px-7 z-40 pointer-events-none">
                <span className="text-[12px] font-semibold text-white mt-1 tracking-wider">09:41</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <svg width="15" height="11" viewBox="0 0 16 12" fill="white">
                    <path d="M1 9h2v2H1V9zm4-3h2v5H5V6zm4-3h2v8H9V3zm4-3h2v11h-2V0z"/>
                  </svg>
                  <svg width="15" height="11" viewBox="0 0 16 12" fill="white">
                    <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-3.53-2.47a5 5 0 017.06 0l1.06-1.06a6.5 6.5 0 00-9.18 0l1.06 1.06zm-3.54-3.54a10 10 0 0114.14 0l1.06-1.06a11.5 11.5 0 00-16.26 0l1.06 1.06z"/>
                  </svg>
                  <div className="w-[20px] h-[10px] border border-white rounded-[3px] p-[1px] relative ml-0.5">
                    <div className="bg-white w-[12px] h-full rounded-[1.5px]" />
                    <div className="absolute -right-[3px] top-[2px] w-[2px] h-[3px] bg-white rounded-r-[1px]" />
                  </div>
                </div>
              </div>

              {/* Glass Glare Overlay */}
              <div className="absolute inset-0 z-50 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-700 transform -skew-x-12 translate-x-[20%] scale-150" />
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.03)] rounded-[48px]" />
              </div>

              {/* App UI Content */}
              <div className="flex-1 flex flex-col pt-16 pb-20 px-5 relative z-10 text-left">
                <AppContent />
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-[4px] bg-white/30 rounded-full z-50" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AppContent() {
  const [price, setPrice] = useState(10420.50);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => {
        const diff = (Math.random() - 0.45) * 15;
        return prev + diff;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const formattedPrice = new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(price);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
          <span className="text-primary font-bold text-sm">TB</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-bold truncate">Salut, Thomas</h3>
          <p className="text-white/40 text-[10px] truncate">Apprenti Trader • Niv. 4</p>
        </div>
        <div className="bg-white/10 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 border border-white/5 shrink-0">
          <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
          <span className="text-white text-xs font-bold leading-none">12</span>
        </div>
      </div>

      <div className="mb-6 relative z-20">
        <p className="text-white/50 text-[11px] font-medium mb-1">Portefeuille de simulation</p>
        <motion.h2 className="text-[32px] font-extrabold tracking-tight text-white font-mono leading-none">
          {formattedPrice}
        </motion.h2>
        <div className="flex items-center gap-1.5 mt-2 text-success">
          <div className="bg-success/20 p-0.5 rounded text-success">
            <ArrowUpRight className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold">+245,20 € (2,4%)</span>
          <span className="text-white/40 text-[10px] ml-1">Aujourd'hui</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-44 w-[120%] -ml-[10%] mb-8">
        <AnimatedChart />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6 relative z-20">
        <button className="bg-destructive/10 text-destructive border border-destructive/20 py-3 rounded-[1.25rem] text-sm font-bold flex flex-col items-center justify-center gap-0.5 hover:bg-destructive/20 transition-colors">
          Vendre
          <span className="text-[10px] opacity-70 font-medium">Position Short</span>
        </button>
        <button className="bg-success/10 text-success border border-success/20 py-3 rounded-[1.25rem] text-sm font-bold flex flex-col items-center justify-center gap-0.5 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:bg-success/20 transition-colors">
          Acheter
          <span className="text-[10px] opacity-70 font-medium">Position Long</span>
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-5 inset-x-4 h-[60px] bg-zinc-900/90 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-between px-5 border border-white/10 z-40">
        <NavIcon active icon={<Home className="w-5 h-5" />} />
        <NavIcon icon={<Activity className="w-5 h-5" />} />
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center -translate-y-5 shadow-[0_4px_20px_rgba(37,99,235,0.5)] border-4 border-[#050505]">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <NavIcon icon={<Wallet className="w-5 h-5" />} />
        <NavIcon icon={<User className="w-5 h-5" />} />
      </div>
    </>
  );
}

function NavIcon({ icon, active }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-white' : 'text-white/40'}`}>
      {icon}
      {active && <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
    </div>
  );
}

function AnimatedChart() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden w-full h-full">
       <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none opacity-20">
         {[1, 2, 3, 4].map(i => (
           <div key={i} className="w-full h-[1px] border-t border-dashed border-white/30" />
         ))}
       </div>
       
       <motion.div 
         className="absolute inset-y-0 left-0 w-[200%] h-full"
         animate={reducedMotion ? undefined : { x: ["0%", "-50%"] }}
         transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
       >
         <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="w-full h-full block">
           <defs>
              <linearGradient id="chartG" x1="0" x2="0" y1="0" y2="1">
                 <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.4" />
                 <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
           </defs>
           <path 
             d="M 0 120 C 40 120, 60 80, 100 90 C 140 100, 160 40, 200 60 C 240 80, 260 140, 300 110 C 340 80, 360 120, 400 120 C 440 120, 460 80, 500 90 C 540 100, 560 40, 600 60 C 640 80, 660 140, 700 110 C 740 80, 760 120, 800 120 L 800 200 L 0 200 Z"
             fill="url(#chartG)"
           />
           <path 
             d="M 0 120 C 40 120, 60 80, 100 90 C 140 100, 160 40, 200 60 C 240 80, 260 140, 300 110 C 340 80, 360 120, 400 120 C 440 120, 460 80, 500 90 C 540 100, 560 40, 600 60 C 640 80, 660 140, 700 110 C 740 80, 760 120, 800 120"
             fill="none" stroke="hsl(var(--success))" strokeWidth="2.5"
             filter="url(#glow)"
           />
         </svg>
       </motion.div>
       
       <div className="absolute top-[45%] left-0 w-full h-[1px] border-t border-dashed border-success/40" />
       <div className="absolute top-[45%] left-[65%] w-[1px] h-[55%] border-r border-dashed border-success/40" />
       
       <div className="absolute top-[45%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-success rounded-full border-[3px] border-[#050505] shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
       
       <div className="absolute top-[45%] right-2 -translate-y-1/2 bg-success text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg shadow-success/20">
         +2,4%
       </div>
    </div>
  );
}
