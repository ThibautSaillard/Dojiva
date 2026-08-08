import { useState } from "react";
import { useLocation } from "wouter";
import { useSaveOnboarding } from "@workspace/api-client-react";
import { ArrowRight, CheckCircle2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "goal",
    title: "Pourquoi tu veux apprendre les marchés ?",
    options: [
      { id: "comprendre", label: "Comprendre comment ça marche", desc: "Pour la culture générale." },
      { id: "trader", label: "Apprendre à trader", desc: "Générer des revenus actifs." },
      { id: "investir", label: "Apprendre à investir", desc: "Faire fructifier mon capital à long terme." },
      { id: "tout", label: "Je veux tout comprendre", desc: "Le pack complet." }
    ]
  },
  {
    id: "experienceLevel",
    title: "Tu connais déjà le trading ?",
    options: [
      { id: "zero", label: "Je pars de zéro", desc: "C'est quoi une bougie ?" },
      { id: "bases", label: "Je connais quelques bases", desc: "Je sais lire un graphique simple." },
      { id: "trade", label: "Je trade déjà", desc: "Je veux perfectionner ma technique." }
    ]
  },
  {
    id: "markets",
    title: "Quels marchés t'intéressent ?",
    multi: true,
    options: [
      { id: "crypto", label: "Crypto", desc: "Bitcoin, Ethereum, Altcoins..." },
      { id: "actions", label: "Actions", desc: "Apple, Tesla, LVMH..." },
      { id: "forex", label: "Forex", desc: "EUR/USD, Devises..." },
      { id: "indices", label: "Indices", desc: "S&P500, Nasdaq, CAC40..." }
    ]
  },
  {
    id: "style",
    title: "Quel style t'attire le plus ?",
    options: [
      { id: "scalping", label: "Scalping", desc: "Trades de quelques minutes." },
      { id: "day", label: "Day Trading", desc: "Ouverture et fermeture dans la journée." },
      { id: "swing", label: "Swing Trading", desc: "Trades sur plusieurs jours/semaines." },
      { id: "invest", label: "Investissement", desc: "Achat pour le long terme." },
      { id: "dunno", label: "Je ne sais pas encore", desc: "On verra plus tard." }
    ]
  }
];

export default function Onboarding() {
  const [stepIndex, setStepIndex] = useState(-1); // -1 is the intro screen
  const [answers, setAnswers] = useState<Record<string, any>>({
    goal: "",
    experienceLevel: "",
    markets: [],
    style: ""
  });
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const saveOnboarding = useSaveOnboarding({
    mutation: {
      onSuccess: () => {
        setTimeout(() => setLocation("/academie"), 2000);
      }
    }
  });

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setIsGenerating(true);
      saveOnboarding.mutate({
        data: {
          goal: answers.goal,
          experienceLevel: answers.experienceLevel,
          markets: answers.markets.length ? answers.markets : ["tous"],
          style: answers.style
        }
      });
    }
  };

  const handleSelect = (stepId: string, optionId: string, isMulti?: boolean) => {
    if (isMulti) {
      setAnswers(prev => {
        const current = prev[stepId] as string[];
        const updated = current.includes(optionId) 
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [stepId]: updated };
      });
    } else {
      setAnswers(prev => ({ ...prev, [stepId]: optionId }));
      setTimeout(handleNext, 300);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-8" />
        <h2 className="text-2xl font-bold mb-2">Ok. On sait où commencer.</h2>
        <p className="text-muted-foreground">Ton parcours est prêt.</p>
      </div>
    );
  }

  if (stepIndex === -1) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Tu pars de zéro ?</h1>
        <p className="text-xl text-muted-foreground mb-12">Aucun problème. On commence vraiment au début.</p>
        <button 
          onClick={handleNext}
          className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
        >
          Commencer
        </button>
      </div>
    );
  }

  const step = STEPS[stepIndex];
  const isMulti = step.multi;
  const currentAnswer = answers[step.id];
  const canProceed = isMulti ? currentAnswer.length > 0 : !!currentAnswer;

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col p-6 max-w-2xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <button 
          onClick={() => setStepIndex(stepIndex - 1)} 
          className="p-2 -ml-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={cn("h-2 rounded-full transition-all", i <= stepIndex ? "bg-primary w-8" : "bg-secondary w-4")} 
            />
          ))}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 flex flex-col">
        <h2 className="text-3xl font-bold mb-8 leading-tight">{step.title}</h2>
        
        <div className="space-y-3">
          {step.options.map(opt => {
            const isSelected = isMulti 
              ? (currentAnswer as string[]).includes(opt.id)
              : currentAnswer === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(step.id, opt.id, isMulti)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                  isSelected 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div>
                  <div className="font-semibold text-lg">{opt.label}</div>
                  <div className="text-sm text-muted-foreground">{opt.desc}</div>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                )}>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-8">
        <button
          onClick={handleNext}
          disabled={!canProceed && !isMulti}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          Continuer
          <ArrowRight className="w-5 h-5" />
        </button>
        {isMulti && !canProceed && (
          <button 
            onClick={handleNext}
            className="w-full mt-4 py-4 rounded-xl text-muted-foreground font-semibold hover:bg-secondary transition-colors"
          >
            Je ne sais pas encore
          </button>
        )}
      </div>
    </div>
  );
}
