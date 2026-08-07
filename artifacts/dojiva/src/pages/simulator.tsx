import { useState } from "react";
import { useCreateScenario, useSubmitTrade, getGetProgressQueryKey, getGetJournalQueryKey, getListBadgesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PremiumGate } from "@/components/PremiumGate";
import { useGetProgress } from "@workspace/api-client-react";
import { ArrowUpCircle, ArrowDownCircle, Clock, Play, Pause, FastForward, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock CandleChart until we build the real SVG one completely
function SimpleCandleChart({ candles, future, step }: { candles: any[], future: any[], step: number }) {
  const visible = [...candles, ...future.slice(0, step)];
  if (!visible.length) return null;
  
  const min = Math.min(...visible.map(c => c.l));
  const max = Math.max(...visible.map(c => c.h));
  const range = max - min || 1;
  const h = 200;
  
  return (
    <div className="w-full h-[240px] bg-card border border-border rounded-xl p-4 flex items-end gap-1 overflow-hidden relative">
      {visible.map((c, i) => {
        const isGreen = c.c >= c.o;
        const color = isGreen ? "bg-success" : "bg-destructive";
        const hPct = ((Math.max(c.o, c.c) - Math.min(c.o, c.c)) / range) * 100;
        const wickHPct = ((c.h - c.l) / range) * 100;
        const topSpace = ((max - c.h) / range) * 100;
        
        return (
          <div key={i} className="relative flex-1 flex flex-col items-center h-full" style={{ paddingTop: `${topSpace}%` }}>
             <div className="w-[1px] bg-muted-foreground/30 absolute" style={{ height: `${wickHPct}%` }} />
             <div className={cn("w-full max-w-[8px] rounded-[1px] absolute z-10", color)} style={{ height: `${Math.max(hPct, 1)}%`, top: `${((max - Math.max(c.o, c.c)) / range) * 100}%` }} />
          </div>
        );
      })}
    </div>
  );
}

export default function Simulator() {
  const { data: progress } = useGetProgress();
  const [decision, setDecision] = useState<"buy" | "sell" | "wait" | null>(null);
  const [pendingDir, setPendingDir] = useState<"buy" | "sell" | null>(null);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [riskPercent, setRiskPercent] = useState(1);
  const [replayStep, setReplayStep] = useState(0);
  
  const queryClient = useQueryClient();
  const createScenario = useCreateScenario();
  const submitTrade = useSubmitTrade({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetJournalQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListBadgesQueryKey() });
      },
    },
  });
  
  const scenario = createScenario.data;
  const result = submitTrade.data;

  if (progress && !progress.premium) {
    return <PremiumGate />;
  }

  if (!scenario && !createScenario.isPending) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <ActivityIcon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Simulateur</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Entraîne-toi avec tes 10 000€ virtuels. Analyse le marché, prends tes positions, et regarde l'évolution.
        </p>
        <button 
          onClick={() => createScenario.mutate()}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Lancer une session
        </button>
      </div>
    );
  }

  const lastClose = scenario?.candles?.length
    ? scenario.candles[scenario.candles.length - 1]!.c
    : 0;

  const openTicket = (dir: "buy" | "sell") => {
    if (!lastClose) return;
    setPendingDir(dir);
    // Pré-remplissage pédagogique : SL à ~1% de l'entrée, TP pour un R:R de 2
    const sl = dir === "buy" ? lastClose * 0.99 : lastClose * 1.01;
    const tp = dir === "buy" ? lastClose * 1.02 : lastClose * 0.98;
    setStopLoss(sl.toPrecision(6));
    setTakeProfit(tp.toPrecision(6));
  };

  const slNum = parseFloat(stopLoss);
  const tpNum = parseFloat(takeProfit);
  const ticketValid =
    pendingDir &&
    Number.isFinite(slNum) &&
    Number.isFinite(tpNum) &&
    (pendingDir === "buy"
      ? slNum < lastClose && tpNum > lastClose
      : slNum > lastClose && tpNum < lastClose);

  const confirmTrade = () => {
    if (!scenario || !pendingDir || !ticketValid) return;
    setDecision(pendingDir);
    submitTrade.mutate({
      data: {
        scenarioId: scenario.id,
        direction: pendingDir,
        entry: lastClose,
        stopLoss: slNum,
        takeProfit: tpNum,
        riskPercent,
      },
    });
    setPendingDir(null);
  };

  const handleWait = () => {
    if (!scenario) return;
    setDecision("wait");
    submitTrade.mutate({
      data: { scenarioId: scenario.id, direction: "wait", riskPercent },
    });
  };

  const nextScenario = () => {
    setDecision(null);
    setPendingDir(null);
    setReplayStep(0);
    submitTrade.reset();
    createScenario.mutate();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Session en cours</h1>
        <div className="bg-secondary px-4 py-2 rounded-lg font-mono font-bold text-lg">
          {(scenario?.balance || 10000).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </div>
      </div>

      {scenario && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
             <span>{scenario.market}</span>
             <span>{scenario.timeframe}</span>
          </div>
          
          <SimpleCandleChart 
            candles={scenario.candles} 
            future={result?.futureCandles || []} 
            step={replayStep} 
          />

          {!result && !submitTrade.isPending && !pendingDir && (
             <div className="grid grid-cols-3 gap-4">
               <button data-testid="button-buy" onClick={() => openTicket("buy")} className="flex flex-col items-center justify-center gap-2 bg-card border border-border p-4 rounded-xl hover:border-success hover:bg-success/5 transition-all text-success">
                 <ArrowUpCircle className="w-8 h-8" />
                 <span className="font-bold">Acheter</span>
               </button>
               <button data-testid="button-wait" onClick={handleWait} className="flex flex-col items-center justify-center gap-2 bg-card border border-border p-4 rounded-xl hover:border-muted-foreground hover:bg-secondary transition-all text-muted-foreground">
                 <Clock className="w-8 h-8" />
                 <span className="font-bold">Patienter</span>
               </button>
               <button data-testid="button-sell" onClick={() => openTicket("sell")} className="flex flex-col items-center justify-center gap-2 bg-card border border-border p-4 rounded-xl hover:border-destructive hover:bg-destructive/5 transition-all text-destructive">
                 <ArrowDownCircle className="w-8 h-8" />
                 <span className="font-bold">Vendre</span>
               </button>
             </div>
          )}

          {!result && !submitTrade.isPending && pendingDir && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className={cn("font-bold text-lg", pendingDir === "buy" ? "text-success" : "text-destructive")}>
                  {pendingDir === "buy" ? "Position acheteuse" : "Position vendeuse"}
                </h2>
                <span className="text-sm text-muted-foreground font-mono">Entrée : {lastClose.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stop Loss</span>
                  <input data-testid="input-stop-loss" type="number" step="any" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-destructive" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Take Profit</span>
                  <input data-testid="input-take-profit" type="number" step="any" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-success" />
                </label>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Risque par trade</span>
                <div className="flex gap-2">
                  {[0.5, 1, 2].map((r) => (
                    <button key={r} data-testid={`button-risk-${r}`} onClick={() => setRiskPercent(r)}
                      className={cn("flex-1 py-2 rounded-lg text-sm font-bold border transition-colors",
                        riskPercent === r ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50")}>
                      {r} %
                    </button>
                  ))}
                </div>
              </div>
              {!ticketValid && (
                <p className="text-xs text-destructive font-medium">
                  {pendingDir === "buy"
                    ? "Pour un achat : Stop Loss sous le prix d'entrée, Take Profit au-dessus."
                    : "Pour une vente : Stop Loss au-dessus du prix d'entrée, Take Profit en dessous."}
                </p>
              )}
              <div className="flex gap-3">
                <button data-testid="button-cancel-ticket" onClick={() => setPendingDir(null)}
                  className="flex-1 py-3 rounded-xl font-bold bg-secondary text-muted-foreground hover:bg-secondary/70 transition-colors">
                  Annuler
                </button>
                <button data-testid="button-confirm-trade" onClick={confirmTrade} disabled={!ticketValid}
                  className={cn("flex-1 py-3 rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    pendingDir === "buy" ? "bg-success text-white hover:bg-success/90" : "bg-destructive text-white hover:bg-destructive/90")}>
                  Confirmer
                </button>
              </div>
            </div>
          )}

          {submitTrade.isPending && (
            <div className="text-center py-8 text-muted-foreground animate-pulse">
              Analyse du marché en cours...
            </div>
          )}

          {result && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-6 animate-in fade-in duration-500">
               {/* Replay Controls */}
               <div className="flex items-center justify-center gap-4">
                 <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground" onClick={() => setReplayStep(Math.max(0, replayStep - 1))}><RotateCcw className="w-5 h-5" /></button>
                 <button className="p-3 rounded-full bg-primary text-primary-foreground" onClick={() => setReplayStep(Math.min(result.futureCandles.length, replayStep + 1))}><FastForward className="w-6 h-6" /></button>
                 <span className="text-sm font-mono text-muted-foreground min-w-[40px] text-center">{replayStep} / {result.futureCandles.length}</span>
               </div>

               {replayStep === result.futureCandles.length && (
                 <div className="space-y-4 animate-in slide-in-from-bottom-4">
                   <div className={cn(
                     "p-4 rounded-lg font-bold text-center text-lg border",
                     result.pnl > 0 ? "bg-success/10 border-success/20 text-success" : 
                     result.pnl < 0 ? "bg-destructive/10 border-destructive/20 text-destructive" :
                     "bg-secondary border-border text-foreground"
                   )}>
                     Résultat: {result.pnl > 0 ? '+' : ''}{result.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                   </div>
                   
                   <div className="space-y-2">
                     <h3 className="font-bold">Analyse du Coach</h3>
                     <ul className="space-y-2">
                       {result.feedback.map((line, i) => (
                         <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                           <span className="text-primary mt-0.5">•</span>
                           <span>{line}</span>
                         </li>
                       ))}
                     </ul>
                   </div>

                   <button onClick={nextScenario} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold mt-4">
                     Scénario Suivant
                   </button>
                 </div>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActivityIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
}
