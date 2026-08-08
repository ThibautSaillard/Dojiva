import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Crosshair } from "lucide-react";

const CANDLES = [
  {o:30, h:35, l:25, c:28}, {o:28, h:32, l:20, c:22}, {o:22, h:25, l:15, c:18}, {o:18, h:28, l:16, c:26},
  {o:26, h:32, l:24, c:30}, {o:30, h:40, l:28, c:38}, {o:38, h:39, l:32, c:34}, {o:34, h:45, l:33, c:42},
  {o:42, h:48, l:38, c:40}, {o:40, h:52, l:39, c:50}, {o:50, h:55, l:45, c:46}, {o:46, h:48, l:40, c:42},
  {o:42, h:50, l:41, c:48}, {o:48, h:55, l:45, c:54}, {o:54, h:60, l:52, c:58},
  // Phase 2
  {o:58, h:65, l:55, c:62}, {o:62, h:68, l:60, c:64}, {o:64, h:65, l:58, c:60}, {o:60, h:70, l:59, c:68}, {o:68, h:75, l:65, c:72},
  // Phase 3 
  {o:72, h:76, l:70, c:74}, {o:74, h:78, l:73, c:75}, {o:75, h:77, l:71, c:72}, {o:72, h:75, l:68, c:70},
  // Phase 4
  {o:70, h:82, l:69, c:80}, {o:80, h:84, l:78, c:79}, {o:79, h:80, l:74, c:75}, {o:75, h:79, l:74, c:78},
  // Phase 6
  {o:78, h:85, l:77, c:83}, {o:83, h:84, l:80, c:81}, {o:81, h:88, l:80, c:86}, {o:86, h:90, l:84, c:89},
  {o:89, h:92, l:85, c:87}, {o:87, h:94, l:86, c:93}, {o:93, h:95, l:90, c:91}, {o:91, h:96, l:89, c:95},
  {o:95, h:97, l:93, c:94}, {o:94, h:99, l:92, c:98}, {o:98, h:103, l:96, c:102}
];

const mapY = (p: number) => 100 - (p * 0.85);
const mapX = (index: number) => index * (100 / 40) + (100 / 40) / 2;

function AnimatedChartSection({ reducedMotion }: { reducedMotion: boolean | null }) {
  const [step, setStep] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  // Le graphique ne se construit que lorsqu'il est visible : démarre à l'arrivée, se met en pause hors écran.
  const inView = useInView(chartRef, { amount: 0.15 });

  useEffect(() => {
    if (reducedMotion) {
      setStep(45);
      return;
    }
    if (!inView) return;
    let timeout: NodeJS.Timeout;
    const run = () => {
       setStep(s => (s > 45 ? 0 : s + 1));
    };
    
    let delay = 100;
    if (step === 15) delay = 1200;
    if (step === 21) delay = 1500;
    if (step === 26) delay = 1500;
    if (step === 31) delay = 1500;
    if (step === 32) delay = 2500;
    if (step === 44) delay = 4000;
    if (step >= 45) delay = 800;

    timeout = setTimeout(run, delay);
    return () => clearTimeout(timeout);
  }, [step, reducedMotion, inView]);

  let candleIndex = 0;
  let phase = 1;
  let text = "Tu observes.";

  if (step <= 14) { candleIndex = step; phase = 1; }
  else if (step === 15) { candleIndex = 14; phase = 1; }
  else if (step <= 20) { candleIndex = 14 + (step - 15); phase = 2; text = "Tu identifies la tendance."; }
  else if (step === 21) { candleIndex = 19; phase = 2; text = "Tu identifies la tendance."; }
  else if (step <= 25) { candleIndex = 19 + (step - 21); phase = 3; text = "Tu identifies la tendance."; }
  else if (step === 26) { candleIndex = 23; phase = 3; text = "Tu identifies la tendance."; }
  else if (step <= 30) { candleIndex = 23 + (step - 26); phase = 4; text = "Tu identifies la tendance."; }
  else if (step === 31) { candleIndex = 27; phase = 4; text = "Tu identifies la tendance."; }
  else if (step === 32) { candleIndex = 27; phase = 5; text = ""; }
  else if (step <= 43) { candleIndex = 27 + (step - 32); phase = 6; text = ""; }
  else if (step === 44) { candleIndex = 38; phase = 6; text = "Tu viens de transformer un graphique en scénario."; }
  else { candleIndex = 38; phase = 7; text = ""; }

  if (reducedMotion) {
    candleIndex = 38;
    phase = 6;
    text = "Tu viens de transformer un graphique en scénario.";
  }

  const showTrendline = phase >= 2 && phase < 7;
  const showResistance = phase >= 3 && phase < 7;
  const showRetest = phase >= 4 && phase < 7;
  const showSetup = phase >= 5 && phase < 7;
  const showReward = step >= 44 && phase < 7;
  const opacityFade = phase === 7 ? 0 : 1;

  return (
    <div className="w-full flex flex-col items-center mb-16 md:mb-32">
      <div ref={chartRef} className="w-full max-w-5xl aspect-[4/3] md:aspect-[21/9] bg-[#09090D] border border-white/10 rounded-2xl md:rounded-[2rem] p-4 md:p-8 relative shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between mb-4 md:mb-8 opacity-50 z-20">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="text-xs font-mono tracking-widest text-white">BTC/USD • 15m</div>
        </div>

        <div className="flex-1 relative w-full border-t border-white/5" style={{ opacity: opacityFade, transition: 'opacity 0.8s ease' }}>
           <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03]">
             {[...Array(6)].map((_, i) => <div key={i} className="w-full h-px bg-white" />)}
           </div>

           <motion.svg 
             className="absolute inset-0 w-full h-full pointer-events-none z-0" 
             preserveAspectRatio="none"
             initial={{ opacity: 0 }}
             animate={{ opacity: showTrendline ? 1 : 0 }}
           >
             <line 
               x1={`${mapX(2)}%`} y1={`${mapY(15)}%`} 
               x2={`${mapX(27)}%`} y2={`${mapY(78)}%`} 
               stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" 
             />
           </motion.svg>

           <motion.div 
             className="absolute left-0 right-0 bg-red-500/10 border-t border-b border-red-500/30 z-0"
             style={{ 
               top: `${mapY(78)}%`, 
               height: `${mapY(74) - mapY(78)}%`,
             }}
             initial={{ opacity: 0, width: '0%' }}
             animate={showResistance ? { opacity: 1, width: '100%' } : { opacity: 0, width: '0%' }}
             transition={{ duration: 0.8, ease: "easeOut" }}
           >
             {/* Étiquette masquée dès que le setup ENTRY/SL/TP occupe la même zone (évite tout chevauchement mobile) */}
             {!showSetup && (
               <div className="absolute top-0 right-4 -translate-y-1/2 bg-[#09090D] px-2 py-0.5 border border-red-500/50 text-red-400 text-[10px] md:text-xs rounded font-mono font-bold uppercase tracking-wider">
                 Résistance
               </div>
             )}
           </motion.div>

           {showSetup && (
             <>
               <motion.div className="absolute left-0 right-0 bg-red-500/10 border-b border-red-500/50 z-0"
                 style={{ top: `${mapY(78)}%`, height: `${mapY(68) - mapY(78)}%` }}
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               >
                 <div className="absolute bottom-0 right-4 translate-y-1/2 bg-[#09090D] px-2 py-0.5 border border-red-500/50 text-red-400 text-[10px] rounded font-mono z-10">SL</div>
               </motion.div>
               
               <motion.div className="absolute left-0 right-0 bg-green-500/10 border-t border-green-500/50 z-0"
                 style={{ top: `${mapY(102)}%`, height: `${mapY(78) - mapY(102)}%` }}
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               >
                 <div className="absolute top-0 right-4 -translate-y-1/2 bg-[#09090D] px-2 py-0.5 border border-green-500/50 text-green-400 text-[10px] rounded font-mono z-10">TP</div>
                 <div className="absolute bottom-0 right-4 translate-y-1/2 bg-[#09090D] px-2 py-0.5 border border-blue-500/50 text-blue-400 text-[10px] rounded font-mono z-10">ENTRY</div>
               </motion.div>

               {showReward && (
                 <motion.div 
                   className="absolute z-20 left-1/2 top-1/4 -translate-x-1/2 bg-success text-success-foreground px-4 py-2 rounded-lg font-bold text-lg shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                   initial={{ scale: 0.5, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ type: "spring", bounce: 0.5 }}
                 >
                   +2.4R
                 </motion.div>
               )}
             </>
           )}

           {CANDLES.map((candle, i) => {
             const isVisible = i <= candleIndex;
             const isUp = candle.c >= candle.o;
             const colorClass = isUp ? "bg-success" : "bg-destructive";
             const x = mapX(i);
             const top = mapY(Math.max(candle.o, candle.c));
             const bottom = mapY(Math.min(candle.o, candle.c));
             const high = mapY(candle.h);
             const low = mapY(candle.l);

             const isRetestCandle = i === 26;
             
             return (
               <motion.div 
                 key={i} 
                 className="absolute inset-y-0 z-10 w-[1.5%] md:w-[1%]"
                 style={{ left: `${x}%` }}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
                 transition={{ duration: 0.2 }}
               >
                 <div className={`absolute left-1/2 -translate-x-1/2 w-[1px] md:w-[2px] ${colorClass}`} style={{ top: `${high}%`, height: `${low - high}%` }} />
                 <div className={`absolute left-0 right-0 ${colorClass} rounded-sm`} style={{ top: `${top}%`, height: `${Math.max(bottom - top, 0.5)}%` }} />

                 {isRetestCandle && showRetest && !showSetup && (
                   <motion.div 
                     className="absolute left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap"
                     style={{ top: `calc(${low}% + 10px)` }}
                     initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                   >
                     RETEST
                     <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                   </motion.div>
                 )}
               </motion.div>
             );
           })}
        </div>

        <div className="h-16 mt-4 md:mt-6 flex items-center justify-center relative z-20">
          <motion.p 
            key={text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base md:text-2xl font-medium text-white/90 text-center"
          >
            {text}
          </motion.p>
        </div>

      </div>

      <div className="mt-8 md:mt-12 text-center max-w-2xl px-4 relative z-20">
        <p className="text-xl md:text-2xl font-bold mb-4">La théorie devient une compétence quand tu la pratiques.</p>
        <p className="text-muted-foreground">Avec Dojiva, chaque notion devient une décision à prendre, un graphique à analyser ou une situation à résoudre.</p>
      </div>
    </div>
  );
}

/* Barres décoratives du graphique « flou » Avant Dojiva — figées au chargement pour un rendu stable entre re-renders. */
const NOISE_BARS = Array.from({ length: 25 }, (_, i) => ({
  x: i * 4 + 2,
  y: 20 + Math.random() * 50,
  h: 10 + Math.random() * 30,
}));

const PILLARS = [
  {
    num: "01",
    title: "APPRENDS",
    desc: "Comprends les concepts avant de les utiliser.",
    tags: ["Chandeliers", "Supports & résistances", "Structure", "Figures chartistes", "Indicateurs", "Liquidité", "Order Blocks"]
  },
  {
    num: "02",
    title: "PRATIQUE",
    desc: "Mets immédiatement tes connaissances à l'épreuve.",
    tags: ["Graphiques interactifs", "Missions", "Simulations", "Décisions", "Backtests"]
  },
  {
    num: "03",
    title: "PROGRESSE",
    desc: "Chaque erreur devient une occasion de comprendre.",
    tags: ["XP", "Statistiques", "Coach IA", "Journal", "Progression personnalisée"]
  }
];

/* Micro-animations pilotées par le survol de la carte entière (group-hover), pas de l'élément lui-même. */
function PillarMicroAnimation({ type }: { type: number }) {
  if (type === 0) {
    return (
      <div className="absolute top-8 right-8 flex items-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1.5 h-1 group-hover:h-4 bg-success/80 rounded-sm transition-all duration-300" />
        <div className="w-1.5 h-3 group-hover:h-2 bg-destructive/80 rounded-sm transition-all duration-300 delay-75" />
        <div className="w-1.5 h-2 group-hover:h-5 bg-success/80 rounded-sm transition-all duration-300 delay-150" />
      </div>
    );
  }
  if (type === 1) {
    return (
      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 text-primary -translate-x-2.5 translate-y-2.5 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300">
          <Crosshair size={24} />
        </div>
      </div>
    );
  }
  if (type === 2) {
    return (
      <div className="absolute top-8 right-8 flex flex-col justify-end h-6 opacity-0 group-hover:opacity-100 transition-opacity w-12">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[20%] group-hover:w-[80%] bg-success transition-all duration-500" />
        </div>
      </div>
    );
  }
  return null;
}

function PillarsSection({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <div className="w-full py-16 md:py-24 relative">
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block -translate-y-1/2" />
      <div className="absolute left-14 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent block md:hidden" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10 pl-6 md:pl-0">
        {PILLARS.map((pillar, i) => (
          <motion.div 
            key={pillar.num}
            className="group relative flex flex-col items-start md:items-center text-left md:text-center p-6 md:p-8 rounded-[2rem] bg-card/30 border border-white/5 hover:bg-card/60 transition-colors cursor-default"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
          >
            <PillarMicroAnimation type={i} />
            <div className="w-12 h-12 shrink-0 rounded-full bg-[#09090D] border border-white/10 flex items-center justify-center font-mono text-xl font-bold mb-6 group-hover:border-primary/50 group-hover:text-primary transition-colors z-10 relative">
              {pillar.num}
            </div>
            
            <h3 className="text-2xl font-bold tracking-tight mb-3 z-10 relative">{pillar.title}</h3>
            <p className="text-muted-foreground mb-8 min-h-[48px] z-10 relative">{pillar.desc}</p>
            
            <div className="flex flex-wrap gap-2 md:justify-center z-10 relative">
              {pillar.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-[11px] font-medium text-white/60 group-hover:bg-white/10 transition-colors">
                  {tag}
                </span>
              ))}
            </div>

            <div className="absolute -inset-px border border-primary/0 rounded-[2rem] group-hover:border-primary/20 transition-colors pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BeforeAfterSection({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <div className="w-full py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16">
        <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">La différence ?</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        <div className="relative rounded-[2rem] bg-[#09090D] border border-white/5 p-8 md:p-12 overflow-hidden group">
          <div className="absolute inset-0 opacity-20 blur-[2px] mix-blend-screen pointer-events-none">
            <svg className="w-full h-full text-white/50" viewBox="0 0 100 100" preserveAspectRatio="none">
              {NOISE_BARS.map((bar, i) => (
                <rect key={i} x={bar.x} y={bar.y} width="1.5" height={bar.h} fill="currentColor" opacity="0.3" />
              ))}
              <path d="M0,50 Q20,30 40,60 T100,40" stroke="rgba(255,255,255,0.4)" fill="none" strokeWidth="0.5" />
              <path d="M0,80 Q30,90 50,30 T100,70" stroke="rgba(255,0,0,0.4)" fill="none" strokeWidth="0.5" />
              <path d="M0,20 Q40,10 60,80 T100,10" stroke="rgba(0,255,0,0.4)" fill="none" strokeWidth="0.5" />
              <rect x="0" y="85" width="100" height="15" fill="rgba(255,255,255,0.05)" />
              <path d="M0,90 L20,95 L40,88 L60,92 L80,85 L100,90" stroke="rgba(255,255,255,0.5)" fill="none" strokeWidth="0.5" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground mb-4 uppercase">Avant Dojiva</div>
            <h4 className="text-2xl font-bold mb-6">Tu regardes un graphique.</h4>
            <div className="space-y-3 text-white/60 font-medium">
              <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" /> Trop d'informations.</p>
              <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" /> Trop de termes.</p>
              <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" /> Tu ne sais pas quoi regarder.</p>
            </div>
          </div>
        </div>

        <div className="relative rounded-[2rem] bg-gradient-to-br from-primary/10 to-[#09090D] border border-primary/20 p-8 md:p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full text-primary" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[...Array(15)].map((_, i) => (
                <rect key={i} x={i * 6 + 5} y={50 - i * 2} width="2" height="15" fill={i % 2 === 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} opacity="0.6" />
              ))}
              <path d="M5,60 L90,30" stroke="currentColor" fill="none" strokeWidth="1" strokeDasharray="2 2" />
              <rect x="0" y="65" width="100" height="5" fill="currentColor" opacity="0.1" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="text-[10px] font-bold tracking-widest text-primary mb-4 uppercase">Avec Dojiva</div>
            <h4 className="text-2xl font-bold mb-6">Tu sais quoi chercher.</h4>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {["TENDANCE", "SUPPORT", "RÉSISTANCE", "STRUCTURE", "ENTRÉE", "STOP", "OBJECTIF"].map((l, i) => (
                <motion.span 
                  key={l}
                  className="px-2 py-1 bg-primary/10 text-primary border border-primary/30 rounded text-[10px] font-bold"
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {l}
                </motion.span>
              ))}
            </div>

            <p className="text-xl md:text-2xl font-bold leading-tight">
              Tu ne regardes plus le marché.<br />
              <span className="text-primary">Tu commences à le lire.</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export function WhyDojiva() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="pourquoi-dojiva" className="w-full bg-[#030305] text-white py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6 border border-primary/20">
            Pourquoi Dojiva ?
          </div>
          <h2 className="text-[2.1rem] leading-[1.1] md:text-6xl font-extrabold tracking-tight mb-6">
            Tu n'apprends pas le trading.<br />
            Tu apprends à <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">LIRE</span> le marché.
          </h2>
          <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            Comprends les graphiques, entraîne-toi sur des marchés historiques, construis tes stratégies et progresse à chaque décision.
          </p>
        </div>

        <AnimatedChartSection reducedMotion={reducedMotion} />
        <PillarsSection reducedMotion={reducedMotion} />
        <BeforeAfterSection reducedMotion={reducedMotion} />

        <div className="mt-16 md:mt-32 text-center flex flex-col items-center">
          <h3 className="text-2xl md:text-5xl font-extrabold mb-8 tracking-tight max-w-xl">Prêt à commencer à lire les marchés ?</h3>
          <Link href="/sign-up" className="inline-flex group items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 md:px-8 md:py-4 rounded-xl text-base md:text-lg font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:scale-105">
            Commencer à apprendre
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-[10px] md:text-xs font-bold tracking-widest text-muted-foreground uppercase">Apprends. Pratique. Progresse.</p>
        </div>

      </div>
    </section>
  );
}
