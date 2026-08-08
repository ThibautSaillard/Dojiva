import { useState } from "react";
import { useCreateScenario, useSubmitTrade, getGetProgressQueryKey, getGetJournalQueryKey, getListBadgesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PremiumGate } from "@/components/PremiumGate";
import { useGetProgress } from "@workspace/api-client-react";
import { ArrowUpCircle, ArrowDownCircle, ArrowLeft, Clock, FastForward, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// Chart simple du mode libre (les missions utilisent le vrai graphique TradingChart)
function SimpleCandleChart({ candles, future, step }: { candles: any[], future: any[], step: number }) {
  const visible = [...candles, ...future.slice(0, step)];
  if (!visible.length) return null;
  
  const min = Math.min(...visible.map(c => c.l));
  const max = Math.max(...visible.map(c => c.h));
  const range = max - min || 1;
  
  return (
    <div className="w-full h-[320px] bg-black border border-white/5 ring-1 ring-white/10 rounded-2xl p-4 flex items-end gap-1.5 overflow-hidden relative shadow-inner">
      {visible.map((c, i) => {
        const isGreen = c.c >= c.o;
        const color = isGreen ? "bg-success" : "bg-destructive";
        const hPct = ((Math.max(c.o, c.c) - Math.min(c.o, c.c)) / range) * 100;
        const wickHPct = ((c.h - c.l) / range) * 100;
        const topSpace = ((max - c.h) / range) * 100;
        
        return (
          <div key={i} className="relative flex-1 flex flex-col items-center h-full" style={{ paddingTop: `${topSpace}%` }}>
             <div className="w-[1px] bg-white/20 absolute" style={{ height: `${wickHPct}%` }} />
             <div className={cn("w-full max-w-[8px] rounded-[1px] absolute z-10", color)} style={{ height: `${Math.max(hPct, 1)}%`, top: `${((max - Math.max(c.o, c.c)) / range) * 100}%` }} />
          </div>
        );
      })}
    </div>
  );
}

export default function SimulatorLibre() {
  const { data: progress } = useGetProgress();
  const [, setDecision] = useState<"buy" | "sell" | "wait" | null>(null);
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
      <div className="flex flex-col items-center justify-center text-center py-24">
        <div className="w-20 h-20 rounded-[2rem] bg-secondary flex items-center justify-center mb-8 shadow-inner border border-border/50">
          <ActivityIcon className="w-10 h-10 text-foreground" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Mode Libre</h1>
        <p className="text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">
          Entraîne-toi sans consigne avec ton capital virtuel. Chaque trade est enregistré dans ton journal.
        </p>
        <button 
          data-testid="button-start-libre"
          onClick={() => createScenario.mutate()}
          className="bg-foreground text-background px-8 py-4 rounded-xl font-bold shadow-lg transition-all hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          Générer une session
        </button>
        <Link href="/simulateur" className="mt-6 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-simulator">
          Retour au simulateur
        </Link>
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
    <div className="flex flex-col gap-6 min-h-[calc(100dvh-5rem)]">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/simulateur" className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:scale-105" data-testid="link-back-simulator">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Mode Libre</h1>
        </div>
        <div className="flex flex-col items-end rounded-xl border border-border/50 bg-card/40 px-4 py-2 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Capital virtuel</span>
          <span className="font-mono text-lg font-bold text-foreground">
            {(scenario?.balance || 10000).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </span>
        </div>
      </header>

      {scenario && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
             <span>{scenario.market}</span>
             <span>{scenario.timeframe}</span>
          </div>
          
          <SimpleCandleChart 
            candles={scenario.candles} 
            future={result?.futureCandles || []} 
            step={replayStep} 
          />

          {!result && !submitTrade.isPending && !pendingDir && (
             <div className="grid grid-cols-3 gap-3">
               <button data-testid="button-buy" onClick={() => openTicket("buy")} className="group flex flex-col items-center gap-3 bg-card border border-border/60 p-5 rounded-2xl hover:border-success/50 hover:bg-success/5 hover:shadow-lg transition-all text-success">
                 <div className="rounded-full bg-success/10 p-3 transition-transform group-hover:scale-110">
                   <ArrowUpCircle className="w-7 h-7 stroke-[1.5]" />
                 </div>
                 <span className="font-bold">Acheter</span>
               </button>
               <button data-testid="button-wait" onClick={handleWait} className="group flex flex-col items-center gap-3 bg-card border border-border/60 p-5 rounded-2xl hover:border-muted-foreground/50 hover:bg-secondary/50 hover:shadow-lg transition-all text-muted-foreground hover:text-foreground">
                 <div className="rounded-full bg-secondary p-3 transition-transform group-hover:scale-110 group-hover:text-foreground">
                   <Clock className="w-7 h-7 stroke-[1.5]" />
                 </div>
                 <span className="font-bold">Attendre</span>
               </button>
               <button data-testid="button-sell" onClick={() => openTicket("sell")} className="group flex flex-col items-center gap-3 bg-card border border-border/60 p-5 rounded-2xl hover:border-destructive/50 hover:bg-destructive/5 hover:shadow-lg transition-all text-destructive">
                 <div className="rounded-full bg-destructive/10 p-3 transition-transform group-hover:scale-110">
                   <ArrowDownCircle className="w-7 h-7 stroke-[1.5]" />
                 </div>
                 <span className="font-bold">Vendre</span>
               </button>
             </div>
          )}

          {!result && !submitTrade.isPending && pendingDir && (
            <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6 shadow-lg animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h2 className={cn("font-bold text-lg", pendingDir === "buy" ? "text-success" : "text-destructive")}>
                  {pendingDir === "buy" ? "Position acheteuse" : "Position vendeuse"}
                </h2>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Entrée</span>
                  <span className="font-mono text-lg font-bold text-foreground">{lastClose.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-destructive">Stop Loss</span>
                  <input data-testid="input-stop-loss" type="number" step="any" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive/50 transition-all shadow-inner" />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-success">Take Profit</span>
                  <input data-testid="input-take-profit" type="number" step="any" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-success focus:ring-1 focus:ring-success/50 transition-all shadow-inner" />
                </label>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Risque par trade</span>
                <div className="flex gap-2">
                  {[0.5, 1, 2].map((r) => (
                    <button key={r} data-testid={`button-risk-${r}`} onClick={() => setRiskPercent(r)}
                      className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all",
                        riskPercent === r ? "bg-foreground text-background border-foreground shadow-md" : "bg-background border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground")}>
                      {r} %
                    </button>
                  ))}
                </div>
              </div>
              {!ticketValid && (
                <p className="flex items-start gap-2 text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <span className="text-lg leading-none mt-0.5">•</span>
                  {pendingDir === "buy"
                    ? "Pour un achat : Stop Loss sous le prix d'entrée, Take Profit au-dessus."
                    : "Pour une vente : Stop Loss au-dessus du prix d'entrée, Take Profit en dessous."}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button data-testid="button-cancel-ticket" onClick={() => setPendingDir(null)}
                  className="flex-1 py-4 rounded-xl font-bold bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all">
                  Annuler
                </button>
                <button data-testid="button-confirm-trade" onClick={confirmTrade} disabled={!ticketValid}
                  className={cn("flex-[2] py-4 rounded-xl font-bold shadow-lg transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-[1.01] active:scale-[0.98]",
                    pendingDir === "buy" ? "bg-success text-success-foreground shadow-success/20 hover:bg-success/90" : "bg-destructive text-destructive-foreground shadow-destructive/20 hover:bg-destructive/90")}>
                  Confirmer
                </button>
              </div>
            </div>
          )}

          {submitTrade.isPending && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-in fade-in duration-500">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
              <span className="text-sm font-medium tracking-wide">Analyse du marché en cours...</span>
            </div>
          )}

          {result && (
            <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6 shadow-lg animate-in fade-in duration-500">
               {/* Replay Controls */}
               <div className="flex items-center justify-center gap-6 pb-6 border-b border-border/40">
                 <button className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-secondary text-muted-foreground transition-all hover:text-foreground" onClick={() => setReplayStep(Math.max(0, replayStep - 1))}><RotateCcw className="w-5 h-5" /></button>
                 <div className="flex flex-col items-center gap-1">
                   <button className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all hover:bg-foreground/90 hover:scale-105 active:scale-95" onClick={() => setReplayStep(Math.min(result.futureCandles.length, replayStep + 1))}><FastForward className="w-7 h-7" /></button>
                   <span className="text-xs font-mono font-bold text-muted-foreground mt-2">{replayStep} / {result.futureCandles.length}</span>
                 </div>
               </div>

               {replayStep === result.futureCandles.length && (
                 <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pt-2">
                   <div className={cn(
                     "p-6 rounded-xl font-mono text-center text-3xl font-extrabold tracking-tight shadow-inner",
                     result.pnl > 0 ? "bg-success/10 border border-success/30 text-success" : 
                     result.pnl < 0 ? "bg-destructive/10 border border-destructive/30 text-destructive" :
                     "bg-secondary/50 border border-border/60 text-foreground"
                   )}>
                     {result.pnl > 0 ? '+' : ''}{result.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                   </div>
                   
                   <div className="space-y-4">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Analyse du Coach
                     </h3>
                     <ul className="space-y-3">
                       {result.feedback.map((line, i) => (
                         <li key={i} className="text-sm text-foreground/90 leading-relaxed flex items-start gap-3 bg-background border border-border/40 p-3 rounded-lg">
                           <span className="text-primary font-bold">•</span>
                           <span>{line}</span>
                         </li>
                       ))}
                     </ul>
                   </div>

                   <button onClick={nextScenario} className="w-full py-4 bg-foreground text-background rounded-xl font-bold shadow-lg transition-all hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.98]">
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
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
}
