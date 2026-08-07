import { useState, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetLesson, useCompleteLesson, getGetProgressQueryKey, getListWorldsQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChunkyButton } from "@/components/ChunkyButton";
import { CandleMascot } from "@/components/CandleMascot";
import { X, Check, Lock, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackState = 'idle' | 'correct' | 'wrong';

export default function Lesson() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const lessonId = parseInt(id || "1", 10);
  
  const { data: lesson, isLoading } = useGetLesson(lessonId);
  const completeLesson = useCompleteLesson({
    mutation: {
      onSuccess: () => {
        // Invalidate worlds and progress to update map
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListWorldsQueryKey() });
      }
    }
  });
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  if (isLoading || !lesson) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-white">
        <CandleMascot size={150} mood="happy" animate={true} />
      </div>
    );
  }

  const steps = lesson.steps;
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex) / steps.length) * 100;

  const handleNext = () => {
    setFeedback('idle');
    setSelectedOption(null);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    completeLesson.mutate({ id: lessonId, data: { score, total: steps.length } });
  };

  const handleOptionSelect = (index: number) => {
    if (feedback !== 'idle') return; // already answered
    setSelectedOption(index);
    
    if (index === currentStep.correctIndex) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('wrong');
    }
  };

  if (isFinished) {
    if (lessonId === 5) {
       return <PaywallScreen onContinue={() => setLocation("/academie")} />;
    }
    return (
      <CelebrationScreen 
        xp={lesson.xpReward} 
        score={score} 
        total={steps.length} 
        onContinue={() => setLocation("/academie")} 
      />
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-white overflow-hidden font-sans">
      {/* Header Progress */}
      <div className="h-16 px-4 flex items-center gap-4">
        <button onClick={() => setLocation("/academie")} className="text-gray-400 hover:text-gray-600 transition-colors p-2">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 bottom-0 left-0 bg-primary rounded-full"
            initial={{ width: `${((currentStepIndex) / steps.length) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
             <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full"
            >
              {currentStep.type === "info" && (
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <CandleMascot size={160} mood="happy" animate={false} className="shrink-0" />
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 relative">
                     {/* Speech bubble pointer */}
                     <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-white border-l-2 border-b-2 border-gray-200 rotate-45 hidden md:block" />
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-t-2 border-l-2 border-gray-200 rotate-45 md:hidden" />
                     
                     <h2 className="text-2xl font-black text-[#3c3c3c] mb-4">{currentStep.prompt}</h2>
                     {currentStep.body && (
                       <p className="text-lg text-gray-500 font-medium leading-relaxed">{currentStep.body}</p>
                     )}
                  </div>
                </div>
              )}

              {(currentStep.type === "quiz" || currentStep.type === "chart-quiz") && (
                <div>
                  <h2 className="text-3xl font-black text-[#3c3c3c] mb-8">{currentStep.prompt}</h2>
                  
                  {currentStep.type === "chart-quiz" && currentStep.chart && (
                    <div className="mb-8">
                       <ChartRenderer chartJson={currentStep.chart} />
                    </div>
                  )}

                  <div className="grid gap-4">
                    {currentStep.options?.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === currentStep.correctIndex;
                      
                      let btnState = "idle";
                      if (feedback !== 'idle') {
                        if (isCorrect) btnState = "correct";
                        else if (isSelected && !isCorrect) btnState = "wrong";
                        else btnState = "disabled"; // dim others
                      }

                      return (
                        <QuizOptionButton 
                          key={idx}
                          label={option}
                          number={idx + 1}
                          state={btnState as any}
                          onClick={() => handleOptionSelect(idx)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* Footer Feedback Area */}
      <div className={cn(
        "border-t-2 transition-colors duration-300",
        feedback === 'idle' ? "border-gray-200 bg-white" :
        feedback === 'correct' ? "border-[#46a302] bg-[#d7ffb8]" :
        "border-[#ea2b2b] bg-[#ffdfe0]"
      )}>
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex-1 w-full">
            {feedback === 'idle' ? (
              currentStep.type === 'info' ? (
                <div /> // empty, just show button on right
              ) : (
                <div /> // quiz idle
              )
            ) : (
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center shrink-0",
                  feedback === 'correct' ? "bg-white text-[#58cc02]" : "bg-white text-[#ff4b4b]"
                )}>
                  {feedback === 'correct' ? <Check className="w-8 h-8 font-black" /> : <XIcon className="w-8 h-8 font-black" />}
                </div>
                <div>
                  <h3 className={cn(
                    "text-2xl font-black mb-2",
                    feedback === 'correct' ? "text-[#46a302]" : "text-[#ea2b2b]"
                  )}>
                    {feedback === 'correct' ? "Excellent !" : "Presque !"}
                  </h3>
                  {currentStep.explanation && (
                     <p className={cn(
                       "text-lg font-medium",
                       feedback === 'correct' ? "text-[#388201]" : "text-[#c52323]"
                     )}>
                       {currentStep.explanation}
                     </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
             {(currentStep.type === 'info' || feedback !== 'idle') ? (
               <ChunkyButton 
                 size="xl" 
                 className="w-full md:w-48"
                 variant={feedback === 'wrong' ? 'danger' : 'primary'}
                 onClick={handleNext}
               >
                 CONTINUER
               </ChunkyButton>
             ) : (
               <ChunkyButton size="xl" className="w-full md:w-48" variant="gray" disabled>
                 VÉRIFIER
               </ChunkyButton>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizOptionButton({ label, number, state, onClick }: { label: string, number: number, state: 'idle' | 'correct' | 'wrong' | 'disabled', onClick: () => void }) {
  let styles = "border-gray-200 bg-white hover:bg-gray-50 text-[#3c3c3c]";
  let numStyles = "border-gray-200 text-gray-400";
  
  if (state === 'correct') {
    styles = "border-[#1cb0f6] bg-[#1cb0f6]/10 text-[#1cb0f6]";
    numStyles = "border-[#1cb0f6] text-[#1cb0f6] bg-white";
  } else if (state === 'wrong') {
    styles = "border-[#ea2b2b] bg-[#ea2b2b]/10 text-[#ea2b2b]";
    numStyles = "border-[#ea2b2b] text-[#ea2b2b] bg-white";
  } else if (state === 'disabled') {
    styles = "border-gray-100 bg-gray-50 text-gray-400 opacity-60";
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={state !== 'idle'}
      animate={state === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={cn(
        "w-full flex items-center p-4 rounded-2xl border-2 border-b-4 transition-colors outline-none",
        styles,
        state !== 'idle' ? "border-b-2 translate-y-[2px]" : "active:border-b-2 active:translate-y-[2px]"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold text-sm mr-4",
        numStyles
      )}>
        {number}
      </div>
      <span className="text-lg font-bold">{label}</span>
    </motion.button>
  );
}

function ChartRenderer({ chartJson }: { chartJson: string }) {
  let data = [];
  try {
    data = JSON.parse(chartJson);
  } catch (e) {}

  if (!data || data.length === 0) return null;

  // Simple auto-scaling SVG candle chart
  const padding = 20;
  const width = 600;
  const height = 300;
  const min = Math.min(...data.map((d: any) => d.l));
  const max = Math.max(...data.map((d: any) => d.h));
  const range = max - min;
  const candleWidth = (width - padding * 2) / data.length;
  
  const scaleY = (val: number) => height - padding - ((val - min) / range) * (height - padding * 2);

  return (
    <div className="w-full overflow-x-auto bg-gray-50 rounded-3xl border-2 border-gray-200 p-4">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="min-w-[400px]">
        {/* Grid lines */}
        {[0, 0.5, 1].map(pct => (
          <line key={pct} x1="0" y1={padding + pct * (height - padding * 2)} x2={width} y2={padding + pct * (height - padding * 2)} stroke="#e5e5e5" strokeWidth="2" strokeDasharray="4 4" />
        ))}
        
        {data.map((d: any, i: number) => {
          const x = padding + i * candleWidth + candleWidth / 2;
          const isGreen = d.c >= d.o;
          const top = scaleY(Math.max(d.o, d.c));
          const bottom = scaleY(Math.min(d.o, d.c));
          const color = isGreen ? "#58cc02" : "#ff4b4b";

          return (
            <g key={i}>
              {/* Wick */}
              <line x1={x} y1={scaleY(d.h)} x2={x} y2={scaleY(d.l)} stroke={color} strokeWidth="2" />
              {/* Body */}
              <rect 
                x={x - candleWidth * 0.3} 
                y={top} 
                width={candleWidth * 0.6} 
                height={Math.max(bottom - top, 2)} 
                fill={color} 
                rx="2"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CelebrationScreen({ xp, score, total, onContinue }: { xp: number, score: number, total: number, onContinue: () => void }) {
  return (
    <div className="h-[100dvh] bg-white flex flex-col items-center justify-between py-12 px-4 relative overflow-hidden">
      {/* Confetti simulation with CSS/Framer could go here, keeping it simple */}
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <h2 className="text-4xl font-black text-[#ffc800] mb-8 uppercase tracking-widest text-center">
          Leçon terminée !
        </h2>
        
        <div className="flex gap-8 mb-12">
          <div className="bg-[#ffc800] rounded-3xl p-6 text-white text-center border-b-4 border-[#e5b400] min-w-[140px]">
            <div className="text-sm font-bold uppercase mb-2">Total XP</div>
            <div className="text-4xl font-black flex items-center justify-center gap-2">
               <span>+{xp}</span>
            </div>
          </div>
          
          <div className="bg-[#1cb0f6] rounded-3xl p-6 text-white text-center border-b-4 border-[#1899d6] min-w-[140px]">
            <div className="text-sm font-bold uppercase mb-2">Précision</div>
            <div className="text-4xl font-black">
               {Math.round((score / total) * 100)}%
            </div>
          </div>
        </div>

        <CandleMascot size={180} mood="happy" animate={true} />
      </motion.div>

      <div className="w-full max-w-lg">
        <ChunkyButton size="xl" className="w-full" variant="primary" onClick={onContinue}>
          CONTINUER
        </ChunkyButton>
      </div>
    </div>
  );
}

function PaywallScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="min-h-[100dvh] bg-gray-900 text-white flex flex-col items-center py-12 px-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full flex flex-col items-center text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-3xl rotate-12 flex items-center justify-center mb-8 shadow-xl shadow-yellow-500/20">
           <CandleMascot size={60} mood="happy" animate={false} />
        </div>
        
        <h2 className="text-3xl font-black mb-4">🎉 Tu viens de débloquer les bases</h2>
        <p className="text-gray-400 text-lg mb-8 font-medium">Ton parcours complet est prêt.</p>
        
        <div className="w-full bg-gray-800 rounded-3xl p-6 border border-gray-700 mb-8 text-left">
          <ul className="space-y-4 font-bold text-gray-300">
             <li className="flex items-center gap-3"><Lock className="w-5 h-5 text-gray-500" /> Chandeliers japonais</li>
             <li className="flex items-center gap-3"><Lock className="w-5 h-5 text-gray-500" /> Supports & résistances</li>
             <li className="flex items-center gap-3"><Lock className="w-5 h-5 text-gray-500" /> Figures chartistes</li>
             <li className="flex items-center gap-3"><Lock className="w-5 h-5 text-gray-500" /> Indicateurs techniques</li>
             <li className="flex items-center gap-3"><Lock className="w-5 h-5 text-gray-500" /> Price Action & Smart Money Concept</li>
          </ul>
        </div>

        <div className="w-full bg-gradient-to-b from-yellow-400/10 to-transparent border border-yellow-400/20 rounded-3xl p-6 mb-8 text-left">
          <h3 className="text-yellow-400 font-black text-xl mb-4 uppercase tracking-wider">Premium Access</h3>
          <ul className="space-y-3 font-bold text-sm text-yellow-100/80">
            <li>✨ 500+ leçons interactives</li>
            <li>📈 Exercices graphiques & Simulateur</li>
            <li>🤖 Coach IA personnalisé</li>
            <li>📓 Journal intelligent</li>
          </ul>
        </div>

        <ChunkyButton size="xl" className="w-full" variant="gold" onClick={onContinue}>
          Continuer mon apprentissage
        </ChunkyButton>
      </motion.div>
    </div>
  );
}
