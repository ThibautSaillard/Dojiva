import { useState } from "react";
import { useActivatePremium, getGetProgressQueryKey, getListWorldsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ShieldAlert, Sparkles, Activity, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export function PremiumGate() {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "master">("master");
  
  const activatePremium = useActivatePremium({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListWorldsQueryKey() });
      }
    }
  });

  const handleActivate = () => {
    activatePremium.mutate({ data: { plan: selectedPlan } });
  };

  return (
    <div className="flex flex-col items-center py-10 px-4 min-h-[80vh]">
      <div className="text-center mb-10 max-w-lg">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Tu veux vraiment apprendre à lire les marchés ?</h2>
        <p className="text-muted-foreground text-lg">
          Tu viens de terminer l'introduction. Pour aller plus loin et accéder au simulateur, aux stratégies et au coach IA, choisis ton accès.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-12">
        {/* Starter Plan */}
        <PlanCard 
          id="starter"
          name="Starter" 
          price="9€/mois"
          description="Pour apprendre les fondamentaux."
          features={["Académie de base", "Exercices graphiques simples"]}
          selected={selectedPlan === "starter"}
          onClick={() => setSelectedPlan("starter")}
        />
        
        {/* Pro Plan */}
        <PlanCard 
          id="pro"
          name="Pro" 
          price="19€/mois"
          description="Pour apprendre et pratiquer le trading."
          features={["Académie complète", "Simulateur standard", "Journal basique"]}
          selected={selectedPlan === "pro"}
          onClick={() => setSelectedPlan("pro")}
        />
        
        {/* Master Plan */}
        <PlanCard 
          id="master"
          name="Master" 
          price="29€/mois"
          description="L'expérience complète sans limites."
          features={["Académie complète", "Simulateur avancé", "Constructeur de stratégies", "Coach IA personnel", "Journal intelligent"]}
          selected={selectedPlan === "master"}
          isPopular
          onClick={() => setSelectedPlan("master")}
        />
      </div>
      
      <button 
        onClick={handleActivate}
        disabled={activatePremium.isPending}
        className="w-full max-w-sm py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {activatePremium.isPending ? "Activation..." : "Débloquer mon parcours"}
      </button>
    </div>
  );
}

function PlanCard({ 
  id, name, price, description, features, selected, isPopular, onClick 
}: { 
  id: string, name: string, price: string, description: string, features: string[], selected: boolean, isPopular?: boolean, onClick: () => void 
}) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col text-left",
        selected ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" : "border-border bg-card hover:border-border/80"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Recommandé
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-bold">{name}</h3>
        <div className="text-2xl font-black mt-2">{price}</div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </div>
      
      <div className="flex-1 mt-4">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
