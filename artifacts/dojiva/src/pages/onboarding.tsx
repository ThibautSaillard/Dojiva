import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useSaveOnboarding, getGetProgressQueryKey } from "@workspace/api-client-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { CandleMascot } from "@/components/CandleMascot";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5; // 5 is the loading/ready screen

export default function Onboarding() {
  const [step, setStep] = useState<Step>(1);
  const [goal, setGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [markets, setMarkets] = useState<string[]>([]);
  const [style, setStyle] = useState("");
  
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const saveOnboarding = useSaveOnboarding();

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
    } else if (step === 4) {
      setStep(5);
      // Fake a delay for the "Ton parcours est prêt" animation
      setTimeout(() => {
        saveOnboarding.mutate(
          { data: { goal, experienceLevel, markets, style } },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
              setLocation("/academie");
            },
          }
        );
      }, 2500);
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !goal) return true;
    if (step === 2 && !experienceLevel) return true;
    if (step === 3 && markets.length === 0) return true;
    if (step === 4 && !style) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {step < 5 && (
        <div className="w-full max-w-2xl flex items-center gap-4 mb-8">
          <ChunkyButton variant="ghost" size="icon" onClick={() => step > 1 ? setStep(s => s - 1 as Step) : setLocation("/")} className="shrink-0 text-gray-400">
            <span className="text-2xl leading-none">×</span>
          </ChunkyButton>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-primary" 
               initial={{ width: `${((step - 1) / 4) * 100}%` }}
               animate={{ width: `${(step / 4) * 100}%` }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
             />
          </div>
        </div>
      )}

      <div className="w-full max-w-xl flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepScreen key="1" title="Qu'aimerais-tu apprendre ?">
              <div className="grid gap-3">
                {[
                  "Comprendre les marchés",
                  "Investir pour le long terme",
                  "Apprendre le trading",
                  "Lire des graphiques",
                  "Tout apprendre"
                ].map((option) => (
                  <OptionCard 
                    key={option} 
                    label={option} 
                    selected={goal === option} 
                    onClick={() => setGoal(option)} 
                  />
                ))}
              </div>
            </StepScreen>
          )}

          {step === 2 && (
            <StepScreen key="2" title="Quel est ton niveau ?">
              <div className="grid gap-3">
                {[
                  { label: "Débutant complet", desc: "Je pars de zéro." },
                  { label: "Intermédiaire", desc: "Je connais quelques bases." },
                  { label: "Expérimenté", desc: "Je pratique déjà." },
                ].map((option) => (
                  <OptionCard 
                    key={option.label} 
                    label={option.label}
                    desc={option.desc}
                    selected={experienceLevel === option.label} 
                    onClick={() => setExperienceLevel(option.label)} 
                  />
                ))}
              </div>
            </StepScreen>
          )}

          {step === 3 && (
            <StepScreen key="3" title="Quels marchés t'intéressent ?" desc="Plusieurs choix possibles">
              <div className="grid gap-3">
                {[
                  "Crypto",
                  "Actions",
                  "Forex",
                  "Indices",
                  "Matières premières",
                  "Tous les marchés"
                ].map((option) => (
                  <OptionCard 
                    key={option} 
                    label={option} 
                    selected={markets.includes(option)} 
                    onClick={() => {
                      if (markets.includes(option)) {
                        setMarkets(markets.filter(m => m !== option));
                      } else {
                        setMarkets([...markets, option]);
                      }
                    }} 
                  />
                ))}
              </div>
            </StepScreen>
          )}

          {step === 4 && (
            <StepScreen key="4" title="Quel style veux-tu découvrir ?">
              <div className="grid gap-3">
                {[
                  "Scalping",
                  "Day Trading",
                  "Swing Trading",
                  "Investissement"
                ].map((option) => (
                  <OptionCard 
                    key={option} 
                    label={option} 
                    selected={style === option} 
                    onClick={() => setStyle(option)} 
                  />
                ))}
              </div>
            </StepScreen>
          )}

          {step === 5 && (
            <motion.div 
              key="5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <CandleMascot size={200} mood="happy" animate={true} />
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-black mt-8 text-[#3c3c3c]"
              >
                Ton parcours personnalisé<br />est prêt !
              </motion.h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step < 5 && (
        <div className="w-full max-w-xl mt-8 pt-6 border-t-2 border-gray-100 flex justify-end">
          <ChunkyButton 
            size="lg" 
            onClick={handleNext} 
            disabled={isNextDisabled()}
            className="w-full sm:w-auto min-w-[150px]"
          >
            CONTINUER
          </ChunkyButton>
        </div>
      )}
    </div>
  );
}

function StepScreen({ title, desc, children }: { title: string, desc?: string, children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full"
    >
      <div className="flex flex-col md:flex-row gap-8 mb-8 md:items-end">
        <CandleMascot size={100} mood="bullish" animate={false} className="hidden md:block shrink-0" />
        <div>
           <h2 className="text-2xl md:text-3xl font-black text-[#3c3c3c]">{title}</h2>
           {desc && <p className="text-gray-400 font-bold mt-2">{desc}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function OptionCard({ label, desc, selected, onClick }: { label: string, desc?: string, selected: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected 
          ? "border-[#1cb0f6] bg-[#1cb0f6]/10 text-[#1cb0f6]" 
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[#3c3c3c]"
      )}
    >
      <div className="font-black text-lg">{label}</div>
      {desc && <div className={cn("text-sm font-medium mt-1", selected ? "text-[#1cb0f6]/80" : "text-gray-500")}>{desc}</div>}
    </button>
  );
}
