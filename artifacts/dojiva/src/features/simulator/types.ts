/** Types du simulateur de missions. */

export interface Candle {
  /** Epoch en secondes (UTC). */
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export type Direction = "buy" | "sell";
export type Decision = Direction | "wait";
export type Difficulty = "debutant" | "intermediaire" | "avance";

/** Étapes du flux d'une mission. */
export type MissionPhaseId =
  | "analysis"
  | "decision"
  | "entry"
  | "stop"
  | "target"
  | "recap"
  | "simulation"
  | "debrief";

export type Tool = "cursor" | "hline" | "trendline" | "zone" | "measure";

export type Drawing =
  | { id: string; kind: "hline"; price: number }
  | {
      id: string;
      kind: "trendline";
      p1: { time: number; price: number };
      p2: { time: number; price: number };
    }
  | { id: string; kind: "zone"; priceTop: number; priceBottom: number };

export interface Level {
  label: string;
  price: number;
  kind: "support" | "resistance";
}

export interface TradePlan {
  direction: Direction;
  entry: number;
  stop: number;
  target: number;
}

export interface Mission {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  market: string;
  symbol: string;
  timeframe: string;
  learningObjective: string;
  /** Consigne affichée pendant l'analyse. */
  instructions: { question: string; hint: string };
  analysisChecklist: string[];
  /** Décisions considérées cohérentes avec le contexte. */
  correctDecisions: Decision[];
  bestDecision: Decision;
  /** Décimales d'affichage des prix. */
  precision: number;
  levels: Level[];
  /** Zone d'entrée cohérente (null si la mission n'attend pas de trade). */
  entryRange: { min: number; max: number } | null;
  stopLogic: {
    side: "below" | "above";
    level: number;
    /** Distance max conseillée entre entrée et stop, en % du prix. */
    maxDistancePct: number;
    label: string;
  };
  targetLogic: { level: number; minRR: number; label: string };
  /** « Ce qu'il faut retenir ». */
  explanation: string;
  mistakes: {
    wrongDirection: string;
    entryFar: string;
    stopInsideStructure: string;
    stopTooWide: string;
    lowRR: string;
    waitMissed: string;
    goodWait: string;
  };
  xpReward: number;
  /** Données complètes : bougies visibles puis futures (cachées). */
  candles: Candle[];
  visibleCount: number;
}

export type OutcomeKind =
  | "target"
  | "stop"
  | "expired"
  | "not-triggered"
  | "waited";

export interface SimOutcome {
  kind: OutcomeKind;
  /** Index absolu (dans mission.candles) de la bougie d'activation. */
  activationIndex: number | null;
  /** Index absolu de la bougie de sortie. */
  exitIndex: number | null;
  exitPrice: number | null;
  pnl: number;
  rr: number | null;
}

export interface Check {
  verdict: "good" | "warn" | "bad";
  text: string;
}

export interface EvaluationInput {
  decision: Decision;
  checkedCount: number;
  plan: TradePlan | null;
  outcome: SimOutcome | null;
}

export interface Evaluation {
  checks: Check[];
  scores: {
    analyse: number;
    entree: number | null;
    risque: number | null;
    discipline: number;
  };
  final: number;
  xp: number;
  headline: string;
  takeaway: string;
}
