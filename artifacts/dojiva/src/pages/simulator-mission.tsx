import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetProgress } from "@workspace/api-client-react";
import { PremiumGate } from "@/components/PremiumGate";
import { TradingChart, type LineKind } from "@/components/simulator/TradingChart";
import { ChartToolbar } from "@/components/simulator/ChartToolbar";
import {
  DIFFICULTY_LABELS,
  MISSIONS,
  findMission,
} from "@/features/simulator/missions";
import {
  CAPITAL,
  RISK_PCT,
  computeRR,
  evaluateMission,
  formatEuro,
  formatPrice,
  planSideIssue,
  riskAmount,
  simulateOutcome,
  waitOutcome,
} from "@/features/simulator/engine";
import { loadSimProgress, recordMissionResult } from "@/features/simulator/storage";
import type {
  Decision,
  Direction,
  Drawing,
  Evaluation,
  MissionPhaseId,
  SimOutcome,
  Tool,
  TradePlan,
} from "@/features/simulator/types";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Check,
  ChevronRight,
  Clock,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  X,
  Target,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

function headlineText(outcome: SimOutcome): string {
  switch (outcome.kind) {
    case "target":
      return "Take Profit atteint — ton scénario s'est réalisé.";
    case "stop":
      return "Stop Loss touché — ton scénario a été invalidé.";
    case "expired":
      return "Fin de la séquence : trade non clôturé.";
    case "not-triggered":
      return "Ton ordre n'a jamais été déclenché.";
    case "waited":
      return "Tu as choisi d'attendre.";
  }
}

export default function SimulatorMissionPage({ id }: { id: string }) {
  const { data: progress } = useGetProgress();
  const mission = findMission(Number(id));
  const [, navigate] = useLocation();

  // Déblocage séquentiel réel : la mission N exige la mission N−1 terminée,
  // même en accédant directement par l'URL.
  const missionLocked = useMemo(() => {
    if (!mission || mission.id === 1) return false;
    const sim = loadSimProgress();
    return !sim.missions[mission.id - 1] && !sim.missions[mission.id];
  }, [mission]);

  useEffect(() => {
    if (missionLocked) navigate("/simulateur", { replace: true });
  }, [missionLocked, navigate]);

  if (progress && !progress.premium) {
    return <PremiumGate />;
  }
  if (missionLocked) {
    return null;
  }
  if (!mission) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center h-[60dvh]">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <p className="mb-6 text-muted-foreground">Cette mission n'existe pas.</p>
        <Link href="/simulateur" className="rounded-xl bg-foreground px-6 py-3 font-bold text-background transition-all hover:bg-foreground/90" data-testid="link-back-simulator">
          Retour au simulateur
        </Link>
      </div>
    );
  }
  // key force un état neuf quand on change de mission
  return <MissionFlow key={mission.id} missionId={mission.id} navigate={navigate} />;
}

function MissionFlow({
  missionId,
  navigate,
}: {
  missionId: number;
  navigate: (to: string) => void;
}) {
  const mission = findMission(missionId)!;
  const [phase, setPhase] = useState<MissionPhaseId>("analysis");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [tool, setTool] = useState<Tool>("cursor");
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [entry, setEntry] = useState<number | null>(null);
  const [stop, setStop] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<SimOutcome | null>(null);
  const [revealedCount, setRevealedCount] = useState(mission.visibleCount);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const recordedRef = useRef(false);

  const lastClose = mission.candles[mission.visibleCount - 1]!.c;
  const direction: Direction | null =
    decision === "buy" || decision === "sell" ? decision : null;
  const risk = riskAmount();

  const plan: TradePlan | null =
    direction && entry != null && stop != null && target != null
      ? { direction, entry, stop, target }
      : null;
  const rr = plan ? computeRR(plan) : null;

  const revealTarget = useMemo(() => {
    if (!outcome) return mission.candles.length;
    return outcome.exitIndex != null ? outcome.exitIndex + 1 : mission.candles.length;
  }, [outcome, mission]);

  const simDone = phase === "simulation" && revealedCount >= revealTarget;

  // Révélation bougie par bougie
  useEffect(() => {
    if (phase !== "simulation" || !playing) return;
    const interval = setInterval(() => {
      setRevealedCount((c) => {
        if (c >= revealTarget) return c;
        return c + 1;
      });
    }, 650 / speed);
    return () => clearInterval(interval);
  }, [phase, playing, speed, revealTarget]);

  useEffect(() => {
    if (simDone) setPlaying(false);
  }, [simDone]);

  const evaluation: Evaluation | null = useMemo(() => {
    if (phase !== "debrief" || !decision) return null;
    return evaluateMission(mission, {
      decision,
      checkedCount: checked.size,
      plan,
      outcome,
    });
  }, [phase, decision, checked.size, plan, outcome, mission]);

  useEffect(() => {
    if (evaluation && !recordedRef.current) {
      recordedRef.current = true;
      recordMissionResult(mission.id, evaluation.final, evaluation.xp);
    }
  }, [evaluation, mission.id]);

  // — Actions de flux
  const chooseDecision = (d: Decision) => {
    setDecision(d);
    if (d === "wait") {
      setEntry(null);
      setStop(null);
      setTarget(null);
      setPhase("recap");
    } else {
      setEntry((prev) => prev ?? Number(lastClose.toFixed(mission.precision)));
      setPhase("entry");
      setTool("cursor");
    }
  };

  const validateEntry = () => {
    if (entry == null || !direction) return;
    if (stop == null) {
      const offset = Math.abs(entry) * 0.01;
      setStop(
        Number(
          (direction === "buy" ? entry - offset : entry + offset).toFixed(
            mission.precision,
          ),
        ),
      );
    }
    setPhase("stop");
  };

  const stopIssue =
    direction && entry != null
      ? planSideIssue(direction, entry, stop, null)
      : null;

  const validateStop = () => {
    if (stop == null || stopIssue || entry == null || !direction) return;
    if (target == null) {
      const dist = Math.abs(entry - stop) * 1.5;
      setTarget(
        Number(
          (direction === "buy" ? entry + dist : entry - dist).toFixed(
            mission.precision,
          ),
        ),
      );
    }
    setPhase("target");
  };

  const targetIssue =
    direction && entry != null
      ? planSideIssue(direction, entry, null, target)
      : null;

  const validateTarget = () => {
    if (target == null || targetIssue) return;
    setPhase("recap");
  };

  const launchSimulation = () => {
    const oc =
      decision === "wait" || !plan
        ? waitOutcome(mission)
        : simulateOutcome(mission, plan);
    setOutcome(oc);
    setPhase("simulation");
    setTool("cursor");
    setPlaying(true);
  };

  const restart = () => {
    setPhase("analysis");
    setChecked(new Set());
    setDrawings([]);
    setDecision(null);
    setEntry(null);
    setStop(null);
    setTarget(null);
    setOutcome(null);
    setRevealedCount(mission.visibleCount);
    setPlaying(false);
    recordedRef.current = false;
  };

  // — Lignes affichées et éditables selon la phase
  const lines = {
    entry: phase === "analysis" || phase === "decision" ? null : entry,
    stop: ["analysis", "decision", "entry"].includes(phase) ? null : stop,
    target: ["analysis", "decision", "entry", "stop"].includes(phase)
      ? null
      : target,
  };
  const editableLines: LineKind[] =
    phase === "entry"
      ? ["entry"]
      : phase === "stop"
        ? ["stop"]
        : phase === "target"
          ? ["target"]
          : [];

  const onLineChange = (kind: LineKind, price: number) => {
    if (kind === "entry") setEntry(price);
    if (kind === "stop") setStop(price);
    if (kind === "target") setTarget(price);
  };

  const fmt = (p: number | null) =>
    p == null ? "—" : formatPrice(p, mission.precision);

  const futureTotal = mission.candles.length - mission.visibleCount;
  const revealedFuture = Math.max(0, revealedCount - mission.visibleCount);

  const shouldReduceMotion = useReducedMotion();
  const animProps = shouldReduceMotion ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  };

  return (
    <div className="flex flex-col gap-5 min-h-[calc(100dvh-5rem)]">
      {/* En-tête mission */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/simulateur"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:scale-105"
            data-testid="link-back-simulator"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span data-testid="text-mission-number" className="text-primary">Mission {mission.id}/10</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{DIFFICULTY_LABELS[mission.difficulty]}</span>
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-foreground leading-tight mt-0.5" data-testid="text-mission-title">
              {mission.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span>{mission.symbol}</span>
              <span>•</span>
              <span>{mission.timeframe}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono font-bold text-foreground" data-testid="text-capital">
                {formatEuro(CAPITAL)}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                Risque {RISK_PCT}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Graphique */}
      <div className="relative group rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/5 ring-1 ring-white/10">
        <TradingChart
          candles={mission.candles}
          revealedCount={revealedCount}
          precision={mission.precision}
          tool={tool}
          drawings={drawings}
          onDrawingsChange={setDrawings}
          lines={lines}
          editableLines={editableLines}
          onLineChange={onLineChange}
          direction={direction}
          className="h-[55dvh] min-h-[360px] w-full lg:h-[60dvh]"
        />
        {(phase === "analysis" ||
          phase === "decision" ||
          phase === "entry" ||
          phase === "stop" ||
          phase === "target") && (
          <ChartToolbar
            tool={tool}
            onToolChange={setTool}
            onClearDrawings={() => setDrawings([])}
            canClear={drawings.length > 0}
            className="absolute top-3 left-3 z-10"
          />
        )}
      </div>
      <p className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 -mt-1">
        Simulation uniquement — aucun argent réel n'est utilisé.
      </p>

      {/* Panneau de phase */}
      <div className="relative min-h-[300px]">
        <AnimatePresence mode="wait">
        
          {phase === "analysis" && (
            <motion.section key="analysis" {...animProps} className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Étape 1 · Analyse</p>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground" data-testid="text-mission-question">
                  {mission.instructions.question}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {mission.instructions.hint}
                </p>
              </div>
              <ul className="space-y-2.5">
                {mission.analysisChecklist.map((item, i) => (
                  <li key={i}>
                    <label className={cn(
                      "group flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200",
                      checked.has(i) ? "border-primary/40 bg-primary/5" : "border-border/60 bg-background hover:border-primary/30 hover:bg-secondary/20"
                    )}>
                      <div className="mt-0.5 relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={checked.has(i)}
                          onChange={(e) => {
                            const next = new Set(checked);
                            if (e.target.checked) next.add(i);
                            else next.delete(i);
                            setChecked(next);
                          }}
                          data-testid={`checkbox-analysis-${i}`}
                        />
                        <div className="h-5 w-5 rounded border-2 border-muted-foreground/30 transition-all peer-checked:border-primary peer-checked:bg-primary" />
                        <Check className="absolute h-3 w-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
                      </div>
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        checked.has(i) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                      )}>{item}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setPhase("decision")}
                className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98]"
                data-testid="button-finish-analysis"
              >
                J'ai terminé mon analyse
              </button>
            </motion.section>
          )}

          {phase === "decision" && (
            <motion.section key="decision" {...animProps} className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Étape 2 · Décision</p>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Que ferais-tu ici ?</h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Attendre est une vraie décision : ne pas trader un contexte flou, c'est aussi du trading.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => chooseDecision("buy")}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background p-5 transition-all duration-200 hover:border-success/50 hover:bg-success/5 hover:shadow-lg hover:shadow-success/10"
                  data-testid="button-buy"
                >
                  <div className="rounded-full bg-success/10 p-3 text-success transition-transform group-hover:scale-110">
                    <ArrowUpCircle className="h-8 w-8 stroke-[1.5]" />
                  </div>
                  <span className="font-bold text-success">Acheter</span>
                </button>
                <button
                  onClick={() => chooseDecision("wait")}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background p-5 transition-all duration-200 hover:border-muted-foreground/50 hover:bg-secondary/50 hover:shadow-lg"
                  data-testid="button-wait"
                >
                  <div className="rounded-full bg-secondary p-3 text-muted-foreground transition-transform group-hover:scale-110 group-hover:text-foreground">
                    <Clock className="h-8 w-8 stroke-[1.5]" />
                  </div>
                  <span className="font-bold text-muted-foreground group-hover:text-foreground">Attendre</span>
                </button>
                <button
                  onClick={() => chooseDecision("sell")}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background p-5 transition-all duration-200 hover:border-destructive/50 hover:bg-destructive/5 hover:shadow-lg hover:shadow-destructive/10"
                  data-testid="button-sell"
                >
                  <div className="rounded-full bg-destructive/10 p-3 text-destructive transition-transform group-hover:scale-110">
                    <ArrowDownCircle className="h-8 w-8 stroke-[1.5]" />
                  </div>
                  <span className="font-bold text-destructive">Vendre</span>
                </button>
              </div>
              <button
                onClick={() => setPhase("analysis")}
                className="w-full rounded-xl bg-secondary py-3.5 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground"
                data-testid="button-back-analysis"
              >
                Revenir à l'analyse
              </button>
            </motion.section>
          )}

          {phase === "entry" && direction && (
            <motion.section key="entry" {...animProps} className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Étape 3 · Entrée</p>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Où entrerais-tu selon ton analyse ?</h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Fais glisser la ligne <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">Entrée</span> sur le graphique. Si le prix ne la touche jamais, ton ordre ne sera pas exécuté — comme en réel.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-4 shadow-inner">
                <span className="text-sm font-medium text-muted-foreground">Prix d'entrée</span>
                <span className="font-mono text-lg font-bold tracking-tight text-foreground" data-testid="text-entry-price">
                  {fmt(entry)}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPhase("decision")}
                  className="flex-1 rounded-xl bg-secondary py-4 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground"
                  data-testid="button-back-decision"
                >
                  Retour
                </button>
                <button
                  onClick={validateEntry}
                  className="flex-[2] rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98]"
                  data-testid="button-validate-entry"
                >
                  Valider mon entrée
                </button>
              </div>
            </motion.section>
          )}

          {phase === "stop" && direction && entry != null && (
            <motion.section key="stop" {...animProps} className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-destructive">Étape 4 · Stop Loss</p>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Où ton scénario est-il invalidé ?</h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Fais glisser la ligne <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">Stop</span>. C'est elle qui limite ta perte si le marché te donne tort.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-background p-4 shadow-inner">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Stop Loss</div>
                  <div className="font-mono text-lg font-bold tracking-tight text-foreground" data-testid="text-stop-price">{fmt(stop)}</div>
                </div>
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 shadow-inner">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-destructive/80 mb-1">Risque ({RISK_PCT}%)</div>
                  <div className="font-mono text-lg font-bold tracking-tight text-destructive" data-testid="text-risk">
                    {formatEuro(risk)}
                  </div>
                </div>
              </div>
              
              <div className="min-h-[40px] flex flex-col justify-center">
                {stop != null && entry != null && !stopIssue && (
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    Distance : <span className="font-mono font-medium text-muted-foreground">{fmt(Math.abs(entry - stop) as number)}</span> ({((Math.abs(entry - stop) / entry) * 100).toFixed(2)}%). Ta taille de position est ajustée pour risquer exactement {formatEuro(risk)}.
                  </p>
                )}
                {stopIssue && (
                  <motion.p initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-start gap-2 text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20" data-testid="text-stop-issue">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    {stopIssue}
                  </motion.p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setPhase("entry")}
                  className="flex-1 rounded-xl bg-secondary py-4 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground"
                  data-testid="button-back-entry"
                >
                  Retour
                </button>
                <button
                  onClick={validateStop}
                  disabled={!!stopIssue || stop == null}
                  className="flex-[2] rounded-xl bg-destructive py-4 text-sm font-bold text-destructive-foreground shadow-lg shadow-destructive/20 transition-all hover:bg-destructive/90 hover:scale-[1.01] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                  data-testid="button-validate-stop"
                >
                  Valider mon Stop Loss
                </button>
              </div>
            </motion.section>
          )}

          {phase === "target" && direction && entry != null && stop != null && (
            <motion.section key="target" {...animProps} className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-success">Étape 5 · Take Profit</p>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Où prends-tu tes gains ?</h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Fais glisser la ligne <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">Objectif</span>. Un bon objectif se place avant l'obstacle suivant, pas après.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border/60 bg-background p-3 shadow-inner flex flex-col justify-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Objectif</div>
                  <div className="font-mono text-base font-bold tracking-tight text-foreground truncate" data-testid="text-target-price">{fmt(target)}</div>
                </div>
                <div className="rounded-xl border border-success/20 bg-success/5 p-3 shadow-inner flex flex-col justify-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-success/80 mb-1">Gain pot.</div>
                  <div className="font-mono text-base font-bold tracking-tight text-success truncate" data-testid="text-potential-gain">
                    {rr != null ? `+${formatEuro(risk * rr)}` : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background p-3 shadow-inner flex flex-col justify-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Ratio R:R</div>
                  <div
                    className={cn(
                      "font-mono text-base font-bold tracking-tight truncate",
                      rr != null && rr >= mission.targetLogic.minRR ? "text-success" : "text-foreground",
                    )}
                    data-testid="text-rr"
                  >
                    {rr != null ? `1:${rr.toLocaleString("fr-FR")}` : "—"}
                  </div>
                </div>
              </div>
              
              <div className="min-h-[40px] flex flex-col justify-center">
                {targetIssue ? (
                  <motion.p initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-start gap-2 text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20" data-testid="text-target-issue">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    {targetIssue}
                  </motion.p>
                ) : rr != null && rr < 1 ? (
                  <motion.p initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-start gap-2 text-sm font-medium text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    Tu risques plus que ce que tu peux gagner. Ce plan sera pénalisé en réel.
                  </motion.p>
                ) : rr != null && rr < mission.targetLogic.minRR ? (
                  <motion.p initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-start gap-2 text-sm font-medium text-warning text-[#eab308] bg-[#eab308]/5 p-3 rounded-lg border border-[#eab308]/20">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    Ratio un peu faible : vise au moins 1:{mission.targetLogic.minRR.toLocaleString("fr-FR")}.
                  </motion.p>
                ) : null}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPhase("stop")}
                  className="flex-1 rounded-xl bg-secondary py-4 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground"
                  data-testid="button-back-stop"
                >
                  Retour
                </button>
                <button
                  onClick={validateTarget}
                  disabled={!!targetIssue || target == null}
                  className="flex-[2] rounded-xl bg-success py-4 text-sm font-bold text-success-foreground shadow-lg shadow-success/20 transition-all hover:bg-success/90 hover:scale-[1.01] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                  data-testid="button-validate-target"
                >
                  Valider mon objectif
                </button>
              </div>
            </motion.section>
          )}

          {phase === "recap" && (
            <motion.section key="recap" {...animProps} className="space-y-5 rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Target className="w-32 h-32 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Récapitulatif</p>
                </div>
                
                {decision === "wait" ? (
                  <div className="space-y-3 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Tu as choisi d'attendre.</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[90%]">
                      C'est une décision forte. Regardons ce que le marché a fait ensuite — et si ton attente était la bonne lecture.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Ton plan de trade</h2>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-4 backdrop-blur shadow-inner space-y-3 font-mono text-sm" data-testid="recap-plan">
                      <RecapRow
                        label="Direction"
                        value={direction === "buy" ? "ACHAT" : "VENTE"}
                        accent={direction === "buy" ? "text-success font-bold" : "text-destructive font-bold"}
                      />
                      <div className="h-px w-full bg-border/40" />
                      <RecapRow label="Entrée" value={fmt(entry)} />
                      <div className="h-px w-full bg-border/40" />
                      <RecapRow
                        label="Stop Loss"
                        value={`${fmt(stop)}  (-${formatEuro(risk)})`}
                        accent="text-destructive font-bold"
                      />
                      <div className="h-px w-full bg-border/40" />
                      <RecapRow
                        label="Take Profit"
                        value={`${fmt(target)}  (+${rr != null ? formatEuro(risk * rr) : "—"})`}
                        accent="text-success font-bold"
                      />
                      <div className="h-px w-full bg-border/40" />
                      <RecapRow
                        label="Ratio R:R"
                        value={rr != null ? `1 : ${rr.toLocaleString("fr-FR")}` : "—"}
                        accent="text-primary font-bold"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => decision === "wait" ? setPhase("decision") : setPhase("entry")}
                    className="flex-1 rounded-xl border border-border/60 bg-card py-4 text-sm font-bold text-foreground transition-all hover:bg-secondary/50 hover:shadow-sm"
                    data-testid="button-edit-plan"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={launchSimulation}
                    className="flex-[2] rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98]"
                    data-testid="button-launch-simulation"
                  >
                    Lancer la simulation
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {phase === "simulation" && (
            <motion.section key="simulation" {...animProps} className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-lg text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Simulation en cours</p>
                <div className="font-mono text-sm font-semibold text-muted-foreground" data-testid="text-sim-progress">
                  Bougie <span className="text-foreground">{Math.min(revealedFuture, futureTotal)}</span> / {futureTotal}
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-5">
                <button
                  onClick={() => setPlaying(!playing)}
                  disabled={simDone}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                  data-testid="button-play-pause"
                >
                  {playing ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current ml-1" />}
                </button>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setRevealedCount((c) => Math.min(revealTarget, c + 1))}
                    disabled={playing || simDone}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-all hover:bg-secondary/70 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                    title="Bougie suivante"
                    data-testid="button-next-candle"
                  >
                    <StepForward className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 4 : 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background font-mono text-[11px] font-bold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:scale-105 active:scale-95"
                    data-testid="button-speed"
                  >
                    ×{speed}
                  </button>
                </div>
              </div>

              {simDone && outcome && (
                <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} transition={{duration: 0.4}} className="space-y-5 pt-5 border-t border-border/40">
                  <div
                    className={cn(
                      "rounded-xl p-5 text-center shadow-inner",
                      outcome.pnl > 0
                        ? "border border-success/30 bg-success/10"
                        : outcome.pnl < 0
                          ? "border border-destructive/30 bg-destructive/10"
                          : "border border-border/60 bg-secondary/50",
                    )}
                    data-testid="text-outcome"
                  >
                    <div className={cn("text-sm font-bold leading-snug", 
                      outcome.pnl > 0 ? "text-success" : 
                      outcome.pnl < 0 ? "text-destructive" : "text-foreground"
                    )}>{headlineText(outcome)}</div>
                    
                    {decision !== "wait" && outcome.kind !== "not-triggered" && (
                      <div className={cn("mt-2 font-mono text-3xl font-extrabold tracking-tight",
                        outcome.pnl > 0 ? "text-success" : "text-destructive"
                      )}>
                        {outcome.pnl > 0 ? "+" : ""}
                        {formatEuro(outcome.pnl, 2)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setPhase("debrief")}
                    className="w-full rounded-xl bg-foreground py-4 text-sm font-bold text-background shadow-lg transition-all hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.98]"
                    data-testid="button-view-analysis"
                  >
                    Voir le débriefing
                  </button>
                </motion.div>
              )}
            </motion.section>
          )}

          {phase === "debrief" && evaluation && (
            <motion.section key="debrief" {...animProps} className="space-y-6">
              <div className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Le Verdict</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="font-mono text-xs font-bold" data-testid="text-xp-earned">+{evaluation.xp} XP</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ScoreCard label="Analyse" value={evaluation.scores.analyse} />
                  {decision !== "wait" && (
                    <>
                      <ScoreCard label="Entrée" value={evaluation.scores.entree} />
                      <ScoreCard label="Risque" value={evaluation.scores.risque} />
                    </>
                  )}
                  <ScoreCard label="Discipline" value={evaluation.scores.discipline} />
                  {decision === "wait" && (
                    <div className="col-span-2 rounded-xl bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground font-medium p-3 shadow-inner">
                      Pas de trade exécuté
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-xl bg-background border border-border/60 p-5 shadow-sm">
                  <span className="font-bold text-foreground">Score Final</span>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-3xl font-extrabold tracking-tight", 
                      evaluation.final >= 8 ? "text-success" : 
                      evaluation.final >= 5 ? "text-primary" : "text-destructive"
                    )} data-testid="text-score-final">
                      {evaluation.final}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">/10</span>
                  </div>
                </div>

                <div className="h-px w-full bg-border/40" />

                <ul className="space-y-3">
                  {evaluation.checks.map((check, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-lg bg-background border border-border/40 p-4 shadow-sm">
                      {check.verdict === "good" ? (
                        <div className="mt-0.5 rounded-full bg-success/20 p-1 shrink-0"><Check className="h-3 w-3 text-success stroke-[3]" /></div>
                      ) : check.verdict === "warn" ? (
                        <div className="mt-0.5 rounded-full bg-[#eab308]/20 p-1 shrink-0"><AlertTriangle className="h-3 w-3 text-[#eab308] stroke-[3]" /></div>
                      ) : (
                        <div className="mt-0.5 rounded-full bg-destructive/20 p-1 shrink-0"><X className="h-3 w-3 text-destructive stroke-[3]" /></div>
                      )}
                      <span className="text-sm font-medium text-foreground/90 leading-relaxed">{check.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-inner relative overflow-hidden mt-4">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <TrendingUp className="w-24 h-24 text-primary" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                      Ce qu'il faut retenir
                    </p>
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {evaluation.takeaway}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={restart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-secondary py-4 text-sm font-bold text-foreground transition-all hover:bg-secondary/80 hover:shadow-sm"
                  data-testid="button-restart"
                >
                  <RotateCcw className="h-4 w-4" /> Rejouer
                </button>
                <button
                  onClick={() => {
                    const nextId = mission.id + 1;
                    const nextMission = findMission(nextId);
                    if (nextMission) {
                      navigate(`/simulateur/mission/${nextId}`);
                    } else {
                      navigate("/simulateur");
                    }
                  }}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-foreground py-4 text-sm font-bold text-background shadow-lg transition-all hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.98]"
                  data-testid="button-next-action"
                >
                  {mission.id < 10 ? "Mission suivante" : "Retour au simulateur"} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.section>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function RecapRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground/80 font-medium">{label}</span>
      <span className={cn("tracking-tight", accent || "text-foreground font-semibold")}>{value}</span>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-background border border-border/60 p-4 shadow-sm">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className={cn("text-2xl font-extrabold tracking-tight", 
          value >= 8 ? "text-success" : value >= 5 ? "text-primary" : "text-destructive"
        )}>{value}</span>
        <span className="text-[10px] font-bold text-muted-foreground">/10</span>
      </div>
    </div>
  );
}
