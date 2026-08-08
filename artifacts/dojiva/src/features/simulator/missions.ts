import { buildCandles, type PhaseSpec } from "./candles";
import type { Candle, Decision, Difficulty, Level, Mission } from "./types";

/**
 * Les 10 premières missions.
 * Chaque scénario est généré de façon déterministe (même graine → mêmes bougies) :
 * une mission rejouée est strictement identique, les performances sont comparables.
 * Les bougies futures existent dans les données mais ne sont jamais rendues
 * avant d'être révélées une par une pendant la simulation.
 */

interface MissionSpec {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  market: string;
  symbol: string;
  timeframe: string;
  stepMinutes: number;
  precision: number;
  baseVolume: number;
  seed: number;
  startTime: number;
  open: number;
  visiblePhases: PhaseSpec[];
  futurePhases: PhaseSpec[];
  learningObjective: string;
  instructions: { question: string; hint: string };
  analysisChecklist: string[];
  correctDecisions: Decision[];
  bestDecision: Decision;
  levels: Level[];
  entryRange: { min: number; max: number } | null;
  stopLogic: Mission["stopLogic"];
  targetLogic: Mission["targetLogic"];
  explanation: string;
  mistakes: Mission["mistakes"];
  xpReward: number;
}

function defineMission(spec: MissionSpec): Mission {
  const candles: Candle[] = buildCandles({
    seed: spec.seed,
    startTime: spec.startTime,
    stepMinutes: spec.stepMinutes,
    open: spec.open,
    precision: spec.precision,
    baseVolume: spec.baseVolume,
    phases: [...spec.visiblePhases, ...spec.futurePhases],
  });
  const visibleCount = spec.visiblePhases.reduce(
    (sum, p) => sum + (p.kind === "wick" ? 1 : p.bars),
    0,
  );
  return {
    id: spec.id,
    slug: spec.slug,
    title: spec.title,
    difficulty: spec.difficulty,
    market: spec.market,
    symbol: spec.symbol,
    timeframe: spec.timeframe,
    learningObjective: spec.learningObjective,
    instructions: spec.instructions,
    analysisChecklist: spec.analysisChecklist,
    correctDecisions: spec.correctDecisions,
    bestDecision: spec.bestDecision,
    precision: spec.precision,
    levels: spec.levels,
    entryRange: spec.entryRange,
    stopLogic: spec.stopLogic,
    targetLogic: spec.targetLogic,
    explanation: spec.explanation,
    mistakes: spec.mistakes,
    xpReward: spec.xpReward,
    candles,
    visibleCount,
  };
}

const ts = (y: number, m: number, d: number, h: number) =>
  Date.UTC(y, m - 1, d, h, 0, 0) / 1000;

export const MISSIONS: Mission[] = [
  defineMission({
    id: 1,
    slug: "bullish-ou-bearish",
    title: "Bullish ou bearish ?",
    difficulty: "debutant",
    market: "Crypto",
    symbol: "BTC/USDT",
    timeframe: "1 h",
    stepMinutes: 60,
    precision: 0,
    baseVolume: 860,
    seed: 101,
    startTime: ts(2026, 3, 9, 6),
    open: 40600,
    visiblePhases: [
      { kind: "trend", bars: 12, to: 41500, noise: 0.004 },
      { kind: "range", bars: 8, low: 41200, high: 41750 },
      { kind: "trend", bars: 12, to: 42500, noise: 0.004 },
      { kind: "range", bars: 8, low: 42200, high: 42750 },
      { kind: "trend", bars: 10, to: 43000, noise: 0.0035 },
    ],
    futurePhases: [
      { kind: "trend", bars: 12, to: 43900, noise: 0.0035 },
      { kind: "range", bars: 6, low: 43600, high: 44050 },
      { kind: "trend", bars: 12, to: 44700, noise: 0.0035 },
    ],
    learningObjective: "Identifier la direction dominante des bougies",
    instructions: {
      question: "Bullish ou bearish : que ferais-tu ici ?",
      hint: "Regarde qui domine : les bougies vertes ou les rouges ? Les sommets et les creux montent-ils ?",
    },
    analysisChecklist: [
      "La majorité des bougies sont-elles haussières ?",
      "Les sommets montent-ils ?",
      "Les creux montent-ils aussi ?",
      "Vois-tu un signe d'essoufflement ?",
    ],
    correctDecisions: ["buy"],
    bestDecision: "buy",
    levels: [{ label: "Dernier creux", price: 42200, kind: "support" }],
    entryRange: { min: 42550, max: 43250 },
    stopLogic: {
      side: "below",
      level: 42200,
      maxDistancePct: 2.6,
      label: "le dernier creux (42 200 $)",
    },
    targetLogic: {
      level: 44300,
      minRR: 1.5,
      label: "l'extension de la tendance",
    },
    explanation:
      "Quand les sommets ET les creux montent, la tendance est haussière : chercher à acheter est plus cohérent que vendre contre le mouvement. Rien n'est garanti, mais trader avec la tendance met le contexte de ton côté.",
    mistakes: {
      wrongDirection:
        "Le marché enchaînait sommets et creux montants : vendre ici, c'était trader contre la tendance visible.",
      entryFar:
        "Ton entrée est loin de la zone cohérente : trop haut, tu dégrades ton risque ; trop bas, ton ordre risque de ne jamais être exécuté.",
      stopInsideStructure:
        "Ton stop est au-dessus du dernier creux : une simple respiration du marché pouvait te sortir avant que ton scénario ait le temps de vivre.",
      stopTooWide:
        "Ton stop est très éloigné : à risque constant, l'objectif devient dur à atteindre et ton ratio s'effondre.",
      lowRR:
        "Tu risques autant ou plus que ce que tu peux espérer gagner : ce trade ne valait pas le risque pris.",
      waitMissed:
        "Attendre n'est jamais une faute. Mais la tendance était claire : note ce qui t'a retenu pour progresser.",
      goodWait:
        "Attendre se défendait, même si la tendance était déjà lisible : l'important est que ce soit un choix, pas une hésitation.",
    },
    xpReward: 100,
  }),

  defineMission({
    id: 2,
    slug: "trouve-la-tendance",
    title: "Trouve la tendance",
    difficulty: "debutant",
    market: "Forex",
    symbol: "EUR/USD",
    timeframe: "15 min",
    stepMinutes: 15,
    precision: 4,
    baseVolume: 2600,
    seed: 202,
    startTime: ts(2026, 3, 17, 7),
    open: 1.0782,
    visiblePhases: [
      { kind: "trend", bars: 10, to: 1.0836, noise: 0.0006 },
      { kind: "trend", bars: 6, to: 1.0818, noise: 0.0005 },
      { kind: "trend", bars: 10, to: 1.0868, noise: 0.0006 },
      { kind: "trend", bars: 6, to: 1.0842, noise: 0.0005 },
      { kind: "trend", bars: 8, to: 1.089, noise: 0.0006 },
      { kind: "trend", bars: 6, to: 1.0858, noise: 0.0005 },
    ],
    futurePhases: [
      { kind: "trend", bars: 10, to: 1.0902, noise: 0.0006 },
      { kind: "trend", bars: 4, to: 1.0886, noise: 0.0005 },
      { kind: "trend", bars: 12, to: 1.0938, noise: 0.0006 },
    ],
    learningObjective: "Reconnaître une tendance par ses sommets et creux",
    instructions: {
      question: "Uptrend, downtrend ou range : que ferais-tu ?",
      hint: "Compare chaque sommet au précédent, chaque creux au précédent. Le prix vient de se replier.",
    },
    analysisChecklist: [
      "Les sommets sont-ils de plus en plus hauts ?",
      "Les creux sont-ils de plus en plus hauts ?",
      "Où s'est arrêté le dernier repli ?",
      "Le repli actuel casse-t-il la structure ?",
    ],
    correctDecisions: ["buy"],
    bestDecision: "buy",
    levels: [
      { label: "Dernier creux montant", price: 1.0842, kind: "support" },
    ],
    entryRange: { min: 1.0845, max: 1.087 },
    stopLogic: {
      side: "below",
      level: 1.0842,
      maxDistancePct: 0.45,
      label: "le dernier creux montant (1,0842)",
    },
    targetLogic: {
      level: 1.093,
      minRR: 1.5,
      label: "la zone du prochain sommet",
    },
    explanation:
      "Une tendance haussière, c'est une suite de sommets et de creux montants. Tant que cette structure tient, le repli vers le dernier creux est une zone d'intérêt — pas une raison de paniquer.",
    mistakes: {
      wrongDirection:
        "La structure enchaînait sommets et creux montants : vendre dans ce contexte, c'était parier contre la tendance sans signal d'inversion.",
      entryFar:
        "Ton entrée s'éloigne de la zone de repli : plus tu entres haut, plus ton stop structurel est loin et plus ton ratio se dégrade.",
      stopInsideStructure:
        "Ton stop est au-dessus du dernier creux montant : il pouvait sauter sur une simple respiration, sans que la tendance soit remise en cause.",
      stopTooWide:
        "Stop très large pour ce timeframe : ton objectif devait presque doubler la distance pour garder un ratio correct.",
      lowRR:
        "Ratio insuffisant : sur un repli en tendance, on cherche un objectif au moins 1,5 fois plus loin que le risque.",
      waitMissed:
        "Attendre est respectable, mais la structure offrait un repli propre en tendance : c'est exactement le contexte qu'on apprend à exploiter.",
      goodWait:
        "Attendre se défendait si le repli te semblait trop profond : l'essentiel est d'avoir lu la structure.",
    },
    xpReward: 110,
  }),

  defineMission({
    id: 3,
    slug: "trouve-le-support",
    title: "Trouve le support",
    difficulty: "debutant",
    market: "Crypto",
    symbol: "ETH/USDT",
    timeframe: "4 h",
    stepMinutes: 240,
    precision: 1,
    baseVolume: 1400,
    seed: 303,
    startTime: ts(2026, 2, 2, 0),
    open: 2470,
    visiblePhases: [
      { kind: "range", bars: 28, low: 2385, high: 2520, cycles: 2 },
      { kind: "trend", bars: 6, to: 2398, noise: 0.005 },
    ],
    futurePhases: [
      { kind: "range", bars: 4, low: 2385, high: 2425 },
      { kind: "trend", bars: 8, to: 2452, noise: 0.006 },
      { kind: "trend", bars: 10, to: 2506, noise: 0.005 },
    ],
    learningObjective: "Repérer un support et l'utiliser comme zone d'intérêt",
    instructions: {
      question: "Le prix revient sur une zone déjà défendue. Que ferais-tu ?",
      hint: "Repère les niveaux où le prix a déjà rebondi plusieurs fois. Trace-les.",
    },
    analysisChecklist: [
      "Combien de fois le bas de la zone a-t-il été défendu ?",
      "Le prix est-il proche de ce niveau maintenant ?",
      "Où est le haut du range ?",
      "Y a-t-il un signe de cassure du support ?",
    ],
    correctDecisions: ["buy"],
    bestDecision: "buy",
    levels: [
      { label: "Support testé 3 fois", price: 2385, kind: "support" },
      { label: "Haut du range", price: 2515, kind: "resistance" },
    ],
    entryRange: { min: 2386, max: 2418 },
    stopLogic: {
      side: "below",
      level: 2385,
      maxDistancePct: 2.2,
      label: "le support (2 385 $)",
    },
    targetLogic: { level: 2500, minRR: 2, label: "le haut du range" },
    explanation:
      "Un support n'est pas une ligne magique : c'est une zone où les acheteurs se sont déjà montrés. Dans un range, acheter près du support avec un stop en dessous offre un risque défini et un objectif naturel : le haut du range.",
    mistakes: {
      wrongDirection:
        "Vendre juste sur un support défendu trois fois, c'est vendre là où les acheteurs ont l'habitude de réagir : le pire endroit du range pour un short.",
      entryFar:
        "Ton entrée est loin du support : au milieu du range, tu n'as ni le risque défini du bas, ni le potentiel du haut.",
      stopInsideStructure:
        "Ton stop est au-dessus du support : la zone peut être re-testée à la mèche sans que le scénario soit invalidé.",
      stopTooWide:
        "Stop trop profond sous le support : ton ratio se dégrade fortement pour un scénario de range.",
      lowRR:
        "Dans un range, le ratio vient de la distance support → résistance. Ici, il devait dépasser 1 : 2.",
      waitMissed:
        "Attendre se comprend, mais le retour sur un support défendu trois fois était le scénario type de cette leçon.",
      goodWait:
        "Prudence défendable : un support peut céder. L'important est que tu aies identifié la zone.",
    },
    xpReward: 120,
  }),

  defineMission({
    id: 4,
    slug: "trouve-la-resistance",
    title: "Trouve la résistance",
    difficulty: "debutant",
    market: "Forex",
    symbol: "GBP/USD",
    timeframe: "1 h",
    stepMinutes: 60,
    precision: 4,
    baseVolume: 2200,
    seed: 404,
    startTime: ts(2026, 3, 23, 3),
    open: 1.2618,
    visiblePhases: [
      { kind: "range", bars: 30, low: 1.26, high: 1.2684, cycles: 2.4, noise: 0.18 },
      { kind: "trend", bars: 5, to: 1.2676, noise: 0.0004 },
    ],
    futurePhases: [
      { kind: "trend", bars: 6, to: 1.2648, noise: 0.0005 },
      { kind: "trend", bars: 10, to: 1.2606, noise: 0.0005 },
      { kind: "range", bars: 4, low: 1.26, high: 1.263 },
    ],
    learningObjective: "Repérer une résistance et vendre une zone de rejet",
    instructions: {
      question: "Le prix revient sous un plafond déjà rejeté. Que ferais-tu ?",
      hint: "Trace le niveau où les vendeurs ont déjà repoussé le prix plusieurs fois.",
    },
    analysisChecklist: [
      "Combien de fois le haut de la zone a-t-il rejeté le prix ?",
      "Le prix est-il proche de ce plafond maintenant ?",
      "Où est le support du range ?",
      "Y a-t-il un signe de cassure au-dessus ?",
    ],
    correctDecisions: ["sell"],
    bestDecision: "sell",
    levels: [
      { label: "Résistance touchée 3 fois", price: 1.2684, kind: "resistance" },
      { label: "Bas du range", price: 1.26, kind: "support" },
    ],
    entryRange: { min: 1.266, max: 1.2684 },
    stopLogic: {
      side: "above",
      level: 1.2684,
      maxDistancePct: 0.35,
      label: "la résistance (1,2684)",
    },
    targetLogic: { level: 1.2612, minRR: 1.8, label: "le bas du range" },
    explanation:
      "Une résistance est une zone où les vendeurs ont déjà gagné plusieurs fois. Dans un range, vendre près de la résistance avec un stop au-dessus miroite exactement la logique de l'achat sur support.",
    mistakes: {
      wrongDirection:
        "Acheter juste sous une résistance rejetée trois fois, c'est acheter au plafond du range : le potentiel est minime et le risque mal placé.",
      entryFar:
        "Ton entrée est trop loin de la résistance : tu vends au milieu du range, sans zone de réaction dans le dos.",
      stopInsideStructure:
        "Ton stop est sous la résistance : une simple mèche de re-test pouvait te sortir du trade.",
      stopTooWide:
        "Stop trop haut au-dessus de la résistance : le ratio ne tient plus pour un scénario de range.",
      lowRR:
        "L'objectif naturel est le bas du range : en vendant si loin du plafond, le ratio passe sous 1 : 1,8.",
      waitMissed:
        "Attendre se comprend, mais le rejet sous résistance était le miroir exact de la mission précédente.",
      goodWait:
        "Prudence défendable : une résistance peut céder. L'important est que tu aies identifié le plafond.",
    },
    xpReward: 120,
  }),

  defineMission({
    id: 5,
    slug: "cassure-ou-faux-breakout",
    title: "Cassure ou faux breakout ?",
    difficulty: "intermediaire",
    market: "Indices",
    symbol: "S&P 500",
    timeframe: "15 min",
    stepMinutes: 15,
    precision: 0,
    baseVolume: 1900,
    seed: 505,
    startTime: ts(2026, 4, 6, 13),
    open: 5196,
    visiblePhases: [
      { kind: "range", bars: 26, low: 5180, high: 5232, cycles: 2 },
      { kind: "spike", bars: 3, to: 5246, noise: 0.0008 },
      { kind: "trend", bars: 4, to: 5222, noise: 0.0008 },
    ],
    futurePhases: [
      { kind: "trend", bars: 8, to: 5192, noise: 0.001 },
      { kind: "trend", bars: 8, to: 5156, noise: 0.001 },
      { kind: "range", bars: 4, low: 5150, high: 5170 },
    ],
    learningObjective: "Distinguer une vraie cassure d'un piège à acheteurs",
    instructions: {
      question: "Le prix a cassé au-dessus du range… puis est revenu dedans. Que ferais-tu ?",
      hint: "Une cassure qui ne tient pas est un signal en soi. Où le prix a-t-il clôturé par rapport à l'ancienne résistance ?",
    },
    analysisChecklist: [
      "La cassure a-t-elle clôturé au-dessus de la résistance ?",
      "Le prix est-il revenu dans le range ?",
      "Qui est piégé si le prix redescend ?",
      "Le volume a-t-il confirmé la cassure ?",
    ],
    correctDecisions: ["sell", "wait"],
    bestDecision: "sell",
    levels: [
      { label: "Résistance reperdue", price: 5232, kind: "resistance" },
      { label: "Sommet du piège", price: 5246, kind: "resistance" },
      { label: "Bas du range", price: 5180, kind: "support" },
    ],
    entryRange: { min: 5210, max: 5230 },
    stopLogic: {
      side: "above",
      level: 5246,
      maxDistancePct: 0.55,
      label: "le sommet du faux breakout (5 246)",
    },
    targetLogic: { level: 5160, minRR: 1.5, label: "le bas du range" },
    explanation:
      "Une cassure seule ne suffit pas : si le prix réintègre le range, les acheteurs de la cassure sont piégés et alimentent la baisse. Vendre la réintégration — ou ne rien faire — vaut mieux qu'acheter un breakout qui n'a pas tenu.",
    mistakes: {
      wrongDirection:
        "Acheter après la réintégration, c'est acheter un breakout déjà invalidé : les acheteurs du sommet sont piégés au-dessus de toi.",
      entryFar:
        "Ton entrée s'éloigne de la zone de réintégration : plus tu vends bas dans le range, plus ton ratio fond.",
      stopInsideStructure:
        "Ton stop est sous le sommet du piège : une dernière extension de mèche pouvait te sortir juste avant la baisse.",
      stopTooWide:
        "Stop trop éloigné au-dessus du piège : le ratio ne justifie plus le trade.",
      lowRR:
        "Le mouvement attendu va vers le bas du range : ton objectif était trop timide ou ton risque trop grand.",
      waitMissed: "",
      goodWait:
        "Bonne prudence : une cassure sans confirmation est un piège classique. Ne pas trader un contexte douteux est une vraie compétence.",
    },
    xpReward: 130,
  }),

  defineMission({
    id: 6,
    slug: "attends-le-retest",
    title: "Attends le retest",
    difficulty: "intermediaire",
    market: "Crypto",
    symbol: "BTC/USDT",
    timeframe: "15 min",
    stepMinutes: 15,
    precision: 0,
    baseVolume: 900,
    seed: 606,
    startTime: ts(2026, 4, 14, 9),
    open: 40850,
    visiblePhases: [
      { kind: "range", bars: 24, low: 40700, high: 41200, cycles: 2 },
      { kind: "spike", bars: 5, to: 41900, noise: 0.0025 },
      { kind: "trend", bars: 4, to: 41820, noise: 0.002 },
    ],
    futurePhases: [
      { kind: "trend", bars: 7, to: 41280, noise: 0.002 },
      { kind: "wick", to: 41150 },
      { kind: "trend", bars: 10, to: 42280, noise: 0.0025 },
      { kind: "trend", bars: 6, to: 42620, noise: 0.002 },
    ],
    learningObjective: "Ne pas courir après le prix : attendre le retest",
    instructions: {
      question: "La cassure est belle… mais le prix est déjà loin. Que ferais-tu ?",
      hint: "Entrer ici, c'est acheter 700 points au-dessus de la zone cassée. Où serait une entrée plus propre ?",
    },
    analysisChecklist: [
      "Où était la résistance cassée ?",
      "À quelle distance de cette zone est le prix actuel ?",
      "Où placerais-tu ton stop si tu achetais maintenant ?",
      "Que se passe-t-il souvent après une cassure impulsive ?",
    ],
    correctDecisions: ["buy", "wait"],
    bestDecision: "buy",
    levels: [
      {
        label: "Ancienne résistance (zone de retest)",
        price: 41200,
        kind: "support",
      },
    ],
    entryRange: { min: 41150, max: 41420 },
    stopLogic: {
      side: "below",
      level: 41050,
      maxDistancePct: 1.3,
      label: "la zone de retest (sous 41 050 $)",
    },
    targetLogic: {
      level: 42500,
      minRR: 1.8,
      label: "l'extension après cassure",
    },
    explanation:
      "Après une cassure impulsive, le prix revient souvent tester la zone cassée avant de continuer. Poser son ordre sur le retest — plutôt que courir après le prix — donne un stop proche, un ratio sain et une exécution sans stress. Parfois l'ordre n'est pas touché : c'est le prix de la discipline.",
    mistakes: {
      wrongDirection:
        "Vendre contre une cassure haussière impulsive, c'est se placer face au camp qui vient de gagner la bataille.",
      entryFar:
        "Entrer si loin au-dessus de la zone cassée, c'est courir après le prix : stop énorme, ratio effondré. Le retest offrait une entrée bien plus propre.",
      stopInsideStructure:
        "Ton stop est dans la zone de retest elle-même : la mèche de re-test pouvait te sortir juste avant la continuation.",
      stopTooWide:
        "Stop trop profond sous la zone : le ratio ne tient plus, même si le scénario se réalise.",
      lowRR:
        "En chassant le prix, ton ratio est passé sous le minimum : c'est exactement ce que le retest permet d'éviter.",
      waitMissed: "",
      goodWait:
        "Très bonne lecture : le prix était trop loin de la cassure pour un plan propre. Le retest est arrivé ensuite — c'est là qu'un plan devenait possible.",
    },
    xpReward: 130,
  }),

  defineMission({
    id: 7,
    slug: "ou-placer-ton-stop",
    title: "Où placer ton stop ?",
    difficulty: "intermediaire",
    market: "Forex",
    symbol: "EUR/USD",
    timeframe: "1 h",
    stepMinutes: 60,
    precision: 4,
    baseVolume: 2600,
    seed: 707,
    startTime: ts(2026, 5, 4, 2),
    open: 1.0768,
    visiblePhases: [
      { kind: "trend", bars: 12, to: 1.0846, noise: 0.0006 },
      { kind: "trend", bars: 5, to: 1.0824, noise: 0.0005 },
      { kind: "range", bars: 10, low: 1.082, high: 1.0846, cycles: 1.2, noise: 0.2 },
      { kind: "trend", bars: 4, to: 1.0834, noise: 0.0004 },
    ],
    futurePhases: [
      { kind: "trend", bars: 3, to: 1.0824, noise: 0.0004 },
      { kind: "wick", to: 1.0816 },
      { kind: "trend", bars: 9, to: 1.0872, noise: 0.0006 },
      { kind: "trend", bars: 8, to: 1.0898, noise: 0.0006 },
    ],
    learningObjective: "Placer un stop structurel qui survit aux mèches",
    instructions: {
      question: "Le contexte est acheteur. La vraie question : où meurt ton scénario ?",
      hint: "Un stop collé au support se fait chasser par une mèche. Où ton analyse serait-elle VRAIMENT invalidée ?",
    },
    analysisChecklist: [
      "Où est le support de la consolidation ?",
      "À quel prix ton scénario haussier serait-il faux ?",
      "Ton stop laisse-t-il la place à une mèche de chasse ?",
      "Ton risque reste-t-il raisonnable avec ce stop ?",
    ],
    correctDecisions: ["buy"],
    bestDecision: "buy",
    levels: [
      { label: "Support de la consolidation", price: 1.082, kind: "support" },
    ],
    entryRange: { min: 1.0824, max: 1.085 },
    stopLogic: {
      side: "below",
      level: 1.0814,
      maxDistancePct: 0.55,
      label: "la structure, marge incluse (sous 1,0815)",
    },
    targetLogic: { level: 1.089, minRR: 1.5, label: "le sommet précédent" },
    explanation:
      "Le marché va souvent chercher la liquidité juste sous les supports évidents avant de repartir. Un stop structurel se place au-delà de la zone de mèche, avec une marge — quitte à réduire la taille de position pour garder le même risque en euros.",
    mistakes: {
      wrongDirection:
        "La tendance de fond et la consolidation étaient haussières : vendre ici allait contre toute la structure.",
      entryFar:
        "Ton entrée est loin de la zone de repli : le stop structurel devient disproportionné.",
      stopInsideStructure:
        "Ton stop était collé au support : la mèche de chasse de liquidité passait exactement là. Au-delà de la structure, avec une marge — c'est toute la leçon.",
      stopTooWide:
        "Stop excessivement profond : la protection devient si chère que le trade perd son intérêt.",
      lowRR:
        "Avec un stop mal calibré, le ratio ne tient plus : le placement du stop EST le trade.",
      waitMissed:
        "Attendre se défendait si la zone te semblait fragile — mais la leçon portait sur le placement du stop.",
      goodWait:
        "Prudence entendable, mais le contexte offrait un cas d'école de stop structurel.",
    },
    xpReward: 140,
  }),

  defineMission({
    id: 8,
    slug: "trouve-ton-objectif",
    title: "Trouve ton objectif",
    difficulty: "intermediaire",
    market: "Matières premières",
    symbol: "Or (XAU/USD)",
    timeframe: "4 h",
    stepMinutes: 240,
    precision: 1,
    baseVolume: 1150,
    seed: 808,
    startTime: ts(2026, 4, 20, 0),
    open: 2341,
    visiblePhases: [
      { kind: "range", bars: 8, low: 2320, high: 2352 },
      { kind: "trend", bars: 8, to: 2318, noise: 0.0022 },
      { kind: "range", bars: 10, low: 2312, high: 2336, cycles: 1.4 },
      { kind: "trend", bars: 5, to: 2327, noise: 0.002 },
    ],
    futurePhases: [
      { kind: "trend", bars: 10, to: 2359, noise: 0.002 },
      { kind: "trend", bars: 6, to: 2366, noise: 0.0015 },
      { kind: "trend", bars: 8, to: 2354, noise: 0.002 },
    ],
    learningObjective: "Choisir un objectif réaliste, devant un obstacle connu",
    instructions: {
      question: "Le rebond démarre. Jusqu'où peut-il raisonnablement aller ?",
      hint: "Regarde ce qui bloque au-dessus. Un bon objectif se place AVANT l'obstacle, pas après.",
    },
    analysisChecklist: [
      "Où est le support qui soutient le rebond ?",
      "Où est la résistance majeure au-dessus ?",
      "Ton objectif est-il avant ou après cette résistance ?",
      "Le ratio reste-t-il correct avec cet objectif ?",
    ],
    correctDecisions: ["buy"],
    bestDecision: "buy",
    levels: [
      { label: "Support du range", price: 2312, kind: "support" },
      { label: "Résistance majeure", price: 2368, kind: "resistance" },
    ],
    entryRange: { min: 2316, max: 2334 },
    stopLogic: {
      side: "below",
      level: 2311,
      maxDistancePct: 1.1,
      label: "le support (2 312 $), marge incluse",
    },
    targetLogic: {
      level: 2362,
      minRR: 1.8,
      label: "juste sous la résistance (2 368 $)",
    },
    explanation:
      "Un objectif se place là où ton scénario a de bonnes chances d'être servi : juste AVANT l'obstacle suivant. Viser au-delà de la résistance, c'est offrir ton gain au marché — le prix a rejeté 2 368 $ sans jamais l'atteindre.",
    mistakes: {
      wrongDirection:
        "Vendre au-dessus d'un support défendu, pendant un rebond naissant : le timing jouait contre toi.",
      entryFar:
        "Ton entrée est trop haute dans le rebond : l'essentiel du chemin vers la résistance était déjà consommé.",
      stopInsideStructure:
        "Ton stop était au-dessus du support : un re-test banal pouvait te sortir avant le rebond.",
      stopTooWide:
        "Stop trop profond : sur ce scénario, le ratio dépendait d'un risque serré sous le support.",
      lowRR:
        "Objectif trop timide ou risque trop grand : le trajet support → résistance devait offrir au moins 1 : 1,8.",
      waitMissed:
        "Attendre se comprenait, mais la leçon portait sur le choix de l'objectif face à une résistance connue.",
      goodWait:
        "Prudence défendable — retiens surtout l'idée : l'objectif se place avant l'obstacle.",
    },
    xpReward: 140,
  }),

  defineMission({
    id: 9,
    slug: "construis-ton-plan",
    title: "Construis ton plan",
    difficulty: "avance",
    market: "Indices",
    symbol: "NASDAQ",
    timeframe: "1 h",
    stepMinutes: 60,
    precision: 0,
    baseVolume: 1700,
    seed: 909,
    startTime: ts(2026, 5, 18, 12),
    open: 18120,
    visiblePhases: [
      { kind: "range", bars: 22, low: 18060, high: 18250, cycles: 2 },
      { kind: "spike", bars: 4, to: 18330, noise: 0.0012 },
      { kind: "trend", bars: 5, to: 18262, noise: 0.0012 },
    ],
    futurePhases: [
      { kind: "wick", to: 18232 },
      { kind: "trend", bars: 9, to: 18420, noise: 0.0015 },
      { kind: "trend", bars: 8, to: 18540, noise: 0.0015 },
      { kind: "range", bars: 4, low: 18480, high: 18560 },
    ],
    learningObjective: "Assembler entrée, stop et objectif en un plan cohérent",
    instructions: {
      question: "Cassure, puis retest en cours. Construis ton plan complet.",
      hint: "Entrée sur la zone de retest, stop au-delà de l'invalidation, objectif mesuré sur l'extension : chaque pièce doit être cohérente avec les autres.",
    },
    analysisChecklist: [
      "La cassure du range a-t-elle clôturé au-dessus ?",
      "Le prix retest-t-il la zone cassée ?",
      "Où ton scénario serait-il invalidé ?",
      "Ton objectif correspond-il à l'extension du range ?",
    ],
    correctDecisions: ["buy"],
    bestDecision: "buy",
    levels: [
      { label: "Zone de cassure (retest)", price: 18250, kind: "support" },
    ],
    entryRange: { min: 18235, max: 18300 },
    stopLogic: {
      side: "below",
      level: 18190,
      maxDistancePct: 0.85,
      label: "sous la zone de retest (18 190)",
    },
    targetLogic: {
      level: 18500,
      minRR: 1.8,
      label: "l'extension de la cassure",
    },
    explanation:
      "Un plan complet se lit comme une phrase : « J'achète le retest de 18 250, je suis invalidé sous 18 190, je vise l'extension vers 18 500. » Si une des trois pièces ne s'accorde pas avec les autres, ce n'est pas un plan — c'est un pari.",
    mistakes: {
      wrongDirection:
        "Vendre un retest de cassure haussière confirmée, c'est trader contre la structure ET contre l'élan.",
      entryFar:
        "Ton entrée s'écarte de la zone de retest : le plan perd sa cohérence géométrique.",
      stopInsideStructure:
        "Ton stop est dans la zone de retest : la mèche de re-test l'aurait chassé avant la continuation.",
      stopTooWide:
        "Stop trop profond : l'objectif d'extension ne suffit plus à justifier le risque.",
      lowRR:
        "Le plan type de cette configuration offre plus de 1 : 1,8 : le tien risquait plus qu'il ne visait.",
      waitMissed:
        "Attendre restait possible, mais toutes les pièces du plan étaient sur la table : c'était l'exercice.",
      goodWait:
        "Prudence entendable — mais l'exercice consistait justement à assembler le plan.",
    },
    xpReward: 150,
  }),

  defineMission({
    id: 10,
    slug: "prends-la-decision",
    title: "Prends la décision",
    difficulty: "avance",
    market: "Crypto",
    symbol: "BTC/USDT",
    timeframe: "4 h",
    stepMinutes: 240,
    precision: 0,
    baseVolume: 880,
    seed: 1010,
    startTime: ts(2026, 6, 1, 0),
    open: 41300,
    visiblePhases: [
      { kind: "range", bars: 6, low: 41000, high: 41450 },
      { kind: "trend", bars: 8, to: 40600, noise: 0.003 },
      { kind: "range", bars: 10, low: 39900, high: 40550, cycles: 1.6 },
      { kind: "spike", bars: 4, to: 39420, noise: 0.003 },
      { kind: "trend", bars: 5, to: 39780, noise: 0.0035 },
    ],
    futurePhases: [
      { kind: "trend", bars: 4, to: 39860, noise: 0.002 },
      { kind: "trend", bars: 9, to: 38900, noise: 0.0035 },
      { kind: "trend", bars: 8, to: 38250, noise: 0.0035 },
      { kind: "range", bars: 4, low: 38150, high: 38500 },
    ],
    learningObjective: "Analyser seul un contexte complet et décider",
    instructions: {
      question: "Plus d'indice cette fois. Analyse, décide, construis.",
      hint: "Structure de fond, dernier événement marquant, zone actuelle : déroule ta lecture dans l'ordre.",
    },
    analysisChecklist: [
      "Quelle est la tendance de fond ?",
      "Que s'est-il passé sur le dernier support ?",
      "Que devient un support cassé ?",
      "Où le prix se situe-t-il par rapport à cette zone ?",
    ],
    correctDecisions: ["sell"],
    bestDecision: "sell",
    levels: [
      {
        label: "Ancien support devenu résistance",
        price: 39900,
        kind: "resistance",
      },
    ],
    entryRange: { min: 39650, max: 39900 },
    stopLogic: {
      side: "above",
      level: 40100,
      maxDistancePct: 1.6,
      label: "au-dessus de la zone de retest (40 100 $)",
    },
    targetLogic: {
      level: 38400,
      minRR: 1.8,
      label: "l'extension de la cassure",
    },
    explanation:
      "Tendance baissière, support cassé, pullback vers la zone perdue : chaque élément racontait la même histoire. Un support cassé change de camp — il devient résistance. Quand tout s'aligne, la décision se construit seule… mais c'est à toi de la voir.",
    mistakes: {
      wrongDirection:
        "Acheter sous un support cassé, en tendance baissière, c'est parier contre la structure entière du graphique.",
      entryFar:
        "Ton entrée s'éloigne de la zone de pullback : le stop gonfle et le ratio fond.",
      stopInsideStructure:
        "Ton stop est dans la zone de retest : le pullback final pouvait te sortir juste avant la continuation baissière.",
      stopTooWide:
        "Stop trop haut : même un bon scénario ne justifiait plus ce risque.",
      lowRR:
        "L'extension de cassure offrait mieux que 1 : 1,8 : ton plan risquait trop pour trop peu.",
      waitMissed:
        "Attendre n'est pas une faute — mais tous les signaux étaient alignés. Relis la structure : c'était l'examen final.",
      goodWait:
        "Prudence entendable sur un dernier exercice — mais les signaux étaient alignés pour un scénario vendeur.",
    },
    xpReward: 160,
  }),
];

export function findMission(id: number): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};
