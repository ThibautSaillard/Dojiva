import { useListStrategies, getListStrategiesQueryKey, useCreateStrategy, useDeleteStrategy } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PremiumGate } from "@/components/PremiumGate";
import { useGetProgress } from "@workspace/api-client-react";
import { FlaskConical, Plus, Beaker, Settings2, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Laboratory() {
  const { data: progress } = useGetProgress();
  const { data: strategies, isLoading } = useListStrategies();
  const [isBuilding, setIsBuilding] = useState(false);
  const queryClient = useQueryClient();
  const deleteStrategy = useDeleteStrategy({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStrategiesQueryKey() });
      },
    },
  });

  if (progress && !progress.premium) {
    return <PremiumGate />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (isBuilding) {
    return <StrategyBuilder onCancel={() => setIsBuilding(false)} />;
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Laboratoire</h1>
          <p className="text-muted-foreground">Construis et sauvegarde tes propres stratégies.</p>
        </div>
      </header>

      <button 
        onClick={() => setIsBuilding(true)}
        className="w-full p-6 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-3 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-6 h-6" />
        </div>
        <span className="font-bold">Créer une nouvelle stratégie</span>
      </button>

      <div className="space-y-4">
        {strategies?.map(strategy => (
          <div key={strategy.id} className="p-5 rounded-2xl bg-card border border-border group hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Beaker className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{strategy.name}</h3>
                  <div className="text-sm text-muted-foreground flex gap-2">
                    <span className="bg-secondary px-1.5 py-0.5 rounded">{strategy.market}</span>
                    <span className="bg-secondary px-1.5 py-0.5 rounded">{strategy.timeframe}</span>
                  </div>
                </div>
              </div>
              <button data-testid={`button-delete-strategy-${strategy.id}`} onClick={() => deleteStrategy.mutate({ id: strategy.id })} className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/50 p-3 rounded-xl border border-border/50">
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Contexte</div>
                <ul className="space-y-1">
                  {strategy.context.map((c, i) => <li key={i} className="flex gap-1.5"><span className="text-primary">•</span> {c}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Règles d'entrée</div>
                <ul className="space-y-1">
                  {strategy.entryRules.map((r, i) => <li key={i} className="flex gap-1.5"><span className="text-primary">•</span> {r}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrategyBuilder({ onCancel }: { onCancel: () => void }) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const createStrategy = useCreateStrategy({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getListStrategiesQueryKey() });
        onCancel();
      }
    }
  });

  const handleSave = () => {
    if (!name.trim()) return;
    createStrategy.mutate({
      data: {
        name,
        market: "Crypto",
        style: "Day Trading",
        timeframe: "15m",
        context: ["Tendance haussière", "Retest support"],
        entryRules: ["Bougie de confirmation", "RSI survente"],
        stopLossRule: "Sous le dernier plus bas",
        takeProfitRule: "Au prochain niveau de liquidité",
        riskPercent: 1
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Strategy Builder</h2>
          <p className="text-sm text-muted-foreground">Définis tes règles précises.</p>
        </div>
      </header>

      <div className="space-y-4 bg-card border border-border p-5 rounded-2xl">
        <div>
          <label className="text-sm font-bold text-muted-foreground block mb-2">Nom de la stratégie</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Breakout Retest BTC..." 
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors font-medium text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        
        {/* Simplified for the prototype, but shows the UI intent */}
        <div className="p-4 bg-secondary rounded-xl text-center text-sm text-muted-foreground border border-dashed border-border">
           Les sélecteurs complets (Marché, Style, Context, Setup, Invalidation) seront disponibles dans la version finale du Builder.
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={onCancel} className="flex-1 py-4 font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-colors">
          Annuler
        </button>
        <button 
          onClick={handleSave}
          disabled={!name.trim() || createStrategy.isPending}
          className="flex-1 py-4 font-bold bg-primary text-primary-foreground rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
        >
          {createStrategy.isPending ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
