import { useMemo } from "react";
import { Link } from "wouter";
import { useGetProgress } from "@workspace/api-client-react";
import { PremiumGate } from "@/components/PremiumGate";
import {
  DIFFICULTY_LABELS,
  MISSIONS,
} from "@/features/simulator/missions";
import { CAPITAL } from "@/features/simulator/engine";
import {
  completedCount,
  loadSimProgress,
  nextMissionId,
} from "@/features/simulator/storage";
import {
  Activity,
  History,
  Lock,
  ScanLine,
  Target,
  Trophy,
  ChevronRight,
  Check,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Simulator() {
  const { data: progress } = useGetProgress();
  const simProgress = useMemo(() => loadSimProgress(), []);

  if (progress && !progress.premium) {
    return <PremiumGate />;
  }

  const done = completedCount(simProgress);
  const nextId = nextMissionId(simProgress, MISSIONS.length);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight">Simulateur</h1>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Entraîne-toi en conditions réelles, sans risquer un centime. Le marché, tes choix, ton journal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end rounded-xl border border-border/50 bg-card/40 px-4 py-2.5 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Capital virtuel</span>
            <span className="font-mono font-bold text-foreground" data-testid="text-capital">
              {CAPITAL.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="flex flex-col items-end rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">XP Missions</span>
            <span className="font-mono font-bold text-primary" data-testid="text-sim-xp">
              {simProgress.totalXp}
            </span>
          </div>
        </div>
      </header>

      {/* Modes Principaux */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href={`/simulateur/mission/${nextId}`}
          className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5"
          data-testid="card-mode-missions"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-20">
            <Target className="w-24 h-24 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                <Target className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
                {done}/{MISSIONS.length}
              </span>
            </div>
            <h2 className="mt-5 text-xl font-bold">Missions guidées</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              Apprends en tradant : scénarios encadrés, objectif clair et débriefing noté par le coach.
            </p>
            <div className="mt-6 flex items-center gap-2 font-bold text-primary">
              {done === 0 ? "Commencer le parcours" : done >= MISSIONS.length ? "Rejouer les missions" : "Continuer la mission"}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        <Link
          href="/simulateur/libre"
          className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-foreground/20 hover:bg-card/80 hover:shadow-lg"
          data-testid="card-mode-libre"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-10">
            <Activity className="w-24 h-24 text-foreground" />
          </div>
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground shadow-inner">
              <Activity className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-bold">Mode Libre</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              Le bac à sable. Trade ton capital virtuel sans consigne, et construis ton journal de trading.
            </p>
            <div className="mt-6 flex items-center gap-2 font-bold text-foreground">
              S'entraîner
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </div>

      {/* Modes à venir */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: ScanLine,
            title: "Analyse",
            desc: "Entraîne ton œil : tendances, niveaux, structures.",
          },
          {
            icon: Trophy,
            title: "Challenges",
            desc: "Défis chronométrés pour tester tes réflexes.",
          },
          {
            icon: History,
            title: "Backtest",
            desc: "Rejoue des marchés passés et vérifie tes idées.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group rounded-2xl border border-border/40 bg-card/20 p-5 transition-colors hover:border-border/60"
            data-testid={`card-mode-${title.toLowerCase()}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground">
                <Icon className="h-5 w-5 opacity-50" />
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3 w-3" /> Bientôt
              </span>
            </div>
            <h3 className="mt-4 font-bold text-muted-foreground/80">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground/60 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Liste des missions */}
      <section className="space-y-5">
        <h2 className="text-xl font-bold tracking-tight">Le Dojo (10 missions)</h2>
        <div className="relative">
          {/* Vertical path line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border/40 md:left-[31px]" />
          
          <ul className="space-y-4">
            {MISSIONS.map((mission, index) => {
              const record = simProgress.missions[mission.id];
              const unlocked =
                mission.id === 1 || !!simProgress.missions[mission.id - 1];
              const isNext = unlocked && !record;
              
              return (
                <motion.li 
                  key={mission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative z-10"
                >
                  {unlocked ? (
                    <Link
                      href={`/simulateur/mission/${mission.id}`}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all hover:shadow-md",
                        isNext ? "border-primary/50 hover:border-primary shadow-sm shadow-primary/5" : "border-border/60 hover:border-border"
                      )}
                      data-testid={`card-mission-${mission.id}`}
                    >
                      <MissionBadge id={mission.id} done={!!record} active={isNext} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("truncate font-bold", isNext ? "text-foreground" : "text-foreground/90")}>
                            {mission.title}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <span className={cn("font-medium", 
                            mission.difficulty === "debutant" ? "text-success/80" : 
                            mission.difficulty === "intermediaire" ? "text-primary/80" : "text-destructive/80"
                          )}>
                            {DIFFICULTY_LABELS[mission.difficulty]}
                          </span>
                          <span className="opacity-50">•</span>
                          <span className="font-mono text-[11px]">{mission.symbol}</span>
                          <span className="opacity-50">•</span>
                          <span className="font-mono text-[11px]">{mission.timeframe}</span>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground/80 line-clamp-1">
                          {mission.learningObjective}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        {record ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className={cn("rounded-lg px-2.5 py-1 font-mono text-xs font-bold",
                              record.bestScore >= 8 ? "bg-success/10 text-success" : 
                              record.bestScore >= 5 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                            )}>
                              {record.bestScore.toLocaleString("fr-FR")}/10
                            </span>
                          </div>
                        ) : isNext ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm">
                            <Play className="h-3.5 w-3.5 fill-current" /> Jouer
                          </span>
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div
                      className="flex items-center gap-4 rounded-2xl border border-border/30 bg-card/20 p-4 opacity-50 grayscale-[0.5]"
                      data-testid={`card-mission-${mission.id}`}
                    >
                      <MissionBadge id={mission.id} done={false} locked />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-muted-foreground">
                          {mission.title}
                        </span>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          Termine la mission {mission.id - 1} pour débloquer
                        </div>
                      </div>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="flex items-center justify-center py-6">
        <p className="max-w-md text-center text-xs text-muted-foreground/60 leading-relaxed">
          Simulation uniquement — aucun argent réel n'est utilisé.<br/>
          Les performances passées, même simulées, ne préjugent pas de résultats futurs.
        </p>
      </div>
    </div>
  );
}

function MissionBadge({
  id,
  done,
  locked,
  active
}: {
  id: number;
  done: boolean;
  locked?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl font-mono text-lg font-bold shadow-sm transition-all",
        done
          ? "bg-success/10 text-success border border-success/20"
          : active
            ? "bg-primary text-primary-foreground shadow-primary/20 scale-105"
            : locked
              ? "bg-secondary/50 text-muted-foreground border border-border/30"
              : "bg-card text-foreground border border-border"
      )}
    >
      {done ? <Check className="h-6 w-6 stroke-[3]" /> : id}
    </div>
  );
}
