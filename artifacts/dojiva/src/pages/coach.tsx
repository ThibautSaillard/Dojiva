import { useEffect } from "react";
import { useGetCoachAdvice, useGetProgress } from "@workspace/api-client-react";
import { PremiumGate } from "@/components/PremiumGate";
import { Bot, Lightbulb, Target, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Coach() {
  const { data: progress } = useGetProgress();
  const coach = useGetCoachAdvice();
  const { data: advice, isPending: isLoading, mutate: fetchAdvice, isIdle } = coach;

  useEffect(() => {
    if (isIdle && progress?.premium) fetchAdvice();
  }, [isIdle, progress?.premium, fetchAdvice]);

  if (progress && !progress.premium) {
    return <PremiumGate />;
  }

  if (isLoading || !advice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6"></div>
        <p className="text-muted-foreground font-medium animate-pulse">L'IA analyse tes dernières performances...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="bg-primary text-primary-foreground rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Coach IA</h1>
            <p className="text-primary-foreground/80 leading-relaxed">
              J'ai analysé ton journal et tes exercices. Voici sur quoi on doit se concentrer aujourd'hui.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {advice.sections.map((section, i) => {
          const isLearning = section.category === "apprentissage";
          const isSimulation = section.category === "simulation";
          const isDiscipline = section.category === "discipline";

          return (
            <div key={i} className="bg-card border border-border p-5 rounded-2xl hover:border-primary/30 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isLearning ? "bg-blue-500/10 text-blue-500" :
                  isSimulation ? "bg-primary/10 text-primary" :
                  "bg-orange-500/10 text-orange-500"
                )}>
                  {isLearning ? <Lightbulb className="w-5 h-5" /> :
                   isSimulation ? <Target className="w-5 h-5" /> :
                   <ShieldAlert className="w-5 h-5" />}
                </div>
                <h3 className="font-bold text-lg">{section.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-11">
                {section.message}
              </p>
            </div>
          );
        })}
      </div>

      <button data-testid="button-refresh-advice" onClick={() => fetchAdvice()} disabled={isLoading} className="w-full mt-4 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50">
        <Target className="w-5 h-5" /> Actualiser mes conseils
      </button>
    </div>
  );
}
