import type {
  Check,
  Decision,
  Direction,
  Evaluation,
  EvaluationInput,
  Mission,
  SimOutcome,
  TradePlan,
} from "./types";

/** Capital virtuel fixe des missions. */
export const CAPITAL = 10_000;
/** Risque par mission : 1 % du capital. */
export const RISK_PCT = 1;

export function riskAmount(): number {
  return (CAPITAL * RISK_PCT) / 100;
}

const clamp = (x: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, x));
const round1 = (x: number) => Math.round(x * 10) / 10;

export function computeRR(plan: TradePlan): number | null {
  const risk =
    plan.direction === "buy" ? plan.entry - plan.stop : plan.stop - plan.entry;
  const reward =
    plan.direction === "buy"
      ? plan.target - plan.entry
      : plan.entry - plan.target;
  if (!(risk > 0) || !(reward > 0)) return null;
  return Math.round((reward / risk) * 100) / 100;
}

/** Le plan est-il géométriquement valide (stop côté protection, objectif côté profit) ? */
export function planSideIssue(
  direction: Direction,
  entry: number,
  stop: number | null,
  target: number | null,
): string | null {
  if (stop != null) {
    if (direction === "buy" && stop >= entry)
      return "Pour un achat, le Stop Loss doit être placé sous ton entrée : c'est lui qui limite ta perte si le prix descend.";
    if (direction === "sell" && stop <= entry)
      return "Pour une vente, le Stop Loss doit être placé au-dessus de ton entrée : c'est lui qui limite ta perte si le prix monte.";
  }
  if (target != null) {
    if (direction === "buy" && target <= entry)
      return "Pour un achat, ton objectif se situe au-dessus de ton entrée.";
    if (direction === "sell" && target >= entry)
      return "Pour une vente, ton objectif se situe en dessous de ton entrée.";
  }
  return null;
}

/**
 * Rejoue les bougies futures : l'entrée fonctionne comme un ordre à cours limité
 * (activée quand le prix la touche), puis Stop/Objectif sont surveillés.
 * En cas de bougie touchant les deux, le stop est compté en premier (prudence).
 */
export function simulateOutcome(mission: Mission, plan: TradePlan): SimOutcome {
  const rr = computeRR(plan);
  const risk = riskAmount();
  const future = mission.candles.slice(mission.visibleCount);
  const riskDist = Math.abs(plan.entry - plan.stop);
  let activated = false;
  let activationIndex: number | null = null;

  for (let i = 0; i < future.length; i++) {
    const candle = future[i]!;
    if (!activated) {
      if (candle.l <= plan.entry && plan.entry <= candle.h) {
        activated = true;
        activationIndex = mission.visibleCount + i;
      } else {
        continue;
      }
    }
    const hitStop =
      plan.direction === "buy" ? candle.l <= plan.stop : candle.h >= plan.stop;
    const hitTarget =
      plan.direction === "buy"
        ? candle.h >= plan.target
        : candle.l <= plan.target;
    if (hitStop) {
      return {
        kind: "stop",
        activationIndex,
        exitIndex: mission.visibleCount + i,
        exitPrice: plan.stop,
        pnl: -risk,
        rr,
      };
    }
    if (hitTarget) {
      return {
        kind: "target",
        activationIndex,
        exitIndex: mission.visibleCount + i,
        exitPrice: plan.target,
        pnl: Math.round(risk * (rr ?? 0) * 100) / 100,
        rr,
      };
    }
  }

  if (!activated) {
    return {
      kind: "not-triggered",
      activationIndex: null,
      exitIndex: null,
      exitPrice: null,
      pnl: 0,
      rr,
    };
  }

  const last = future[future.length - 1]!;
  const move =
    plan.direction === "buy" ? last.c - plan.entry : plan.entry - last.c;
  const pnl =
    riskDist > 0 ? Math.round((move / riskDist) * risk * 100) / 100 : 0;
  return {
    kind: "expired",
    activationIndex,
    exitIndex: mission.candles.length - 1,
    exitPrice: last.c,
    pnl,
    rr,
  };
}

export function waitOutcome(mission: Mission): SimOutcome {
  return {
    kind: "waited",
    activationIndex: null,
    exitIndex: mission.candles.length - 1,
    exitPrice: mission.candles[mission.candles.length - 1]!.c,
    pnl: 0,
    rr: null,
  };
}

function headlineFor(kind: SimOutcome["kind"]): string {
  switch (kind) {
    case "target":
      return "Take Profit atteint — ton scénario s'est réalisé.";
    case "stop":
      return "Stop Loss touché — ton scénario a été invalidé.";
    case "expired":
      return "Fin de la séquence : ni ton stop ni ton objectif n'ont été touchés.";
    case "not-triggered":
      return "Ton entrée n'a jamais été touchée. Ne pas être exécuté fait aussi partie du trading.";
    case "waited":
      return "Tu as choisi d'attendre. Voyons ce que le marché a fait.";
  }
}

/** Évalue le PROCESSUS (pas seulement le résultat) et produit scores + retours. */
export function evaluateMission(
  mission: Mission,
  input: EvaluationInput,
): Evaluation {
  const checks: Check[] = [];
  const checklistBonus = clamp(input.checkedCount * 0.5, 0, 2);

  if (input.decision === "wait" || input.plan == null) {
    const goodWait = mission.correctDecisions.includes("wait");
    const analyse = round1(clamp((goodWait ? 8 : 5) + checklistBonus, 0, 10));
    checks.push(
      goodWait
        ? { verdict: "good", text: mission.mistakes.goodWait }
        : { verdict: "warn", text: mission.mistakes.waitMissed },
    );
    const discipline = 10;
    const final = round1(analyse * 0.6 + discipline * 0.4);
    return {
      checks,
      scores: { analyse, entree: null, risque: null, discipline },
      final,
      xp: xpFor(mission, final),
      headline: headlineFor("waited"),
      takeaway: mission.explanation,
    };
  }

  const plan = input.plan;
  const rr = computeRR(plan);
  const decisionOk = mission.correctDecisions.includes(
    plan.direction as Decision,
  );

  // — Analyse : décision cohérente avec le contexte + engagement dans la checklist
  const analyse = round1(clamp((decisionOk ? 7.5 : 3) + checklistBonus, 0, 10));
  checks.push(
    decisionOk
      ? {
          verdict: "good",
          text:
            plan.direction === "buy"
              ? "Direction cohérente avec le contexte : ton scénario acheteur se défend."
              : "Direction cohérente avec le contexte : ton scénario vendeur se défend.",
        }
      : { verdict: "bad", text: mission.mistakes.wrongDirection },
  );

  // — Entrée : position par rapport à la zone cohérente
  let entree: number;
  if (mission.entryRange) {
    const { min, max } = mission.entryRange;
    const width = Math.max(max - min, mission.candles[0]!.c * 0.0001);
    if (plan.entry >= min && plan.entry <= max) {
      entree = 9.5;
      checks.push({
        verdict: "good",
        text: "Entrée placée dans une zone cohérente avec ton scénario.",
      });
    } else {
      const dist =
        plan.entry < min ? (min - plan.entry) / width : (plan.entry - max) / width;
      entree = round1(clamp(8.5 - dist * 2.5, 2.5, 7));
      checks.push({ verdict: "warn", text: mission.mistakes.entryFar });
    }
  } else {
    entree = decisionOk ? 8 : 4;
  }
  if (!decisionOk) entree = Math.min(entree, 5);

  // — Risque : stop au-delà de l'invalidation, largeur raisonnable, R:R
  let risque = 0;
  const structureOk =
    mission.stopLogic.side === "below"
      ? plan.stop <= mission.stopLogic.level
      : plan.stop >= mission.stopLogic.level;
  // Le stop protège-t-il du bon côté pour CE plan ? (garanti par l'UI, revérifié ici)
  const stopDistPct = (Math.abs(plan.entry - plan.stop) / plan.entry) * 100;
  const tooWide = stopDistPct > mission.stopLogic.maxDistancePct;
  if (structureOk) {
    risque += 4.5;
    checks.push({
      verdict: "good",
      text: `Stop placé au-delà de ${mission.stopLogic.label} : ton invalidation est structurelle, pas arbitraire.`,
    });
  } else {
    risque += 1.5;
    checks.push({ verdict: "warn", text: mission.mistakes.stopInsideStructure });
  }
  if (tooWide) {
    checks.push({ verdict: "warn", text: mission.mistakes.stopTooWide });
  } else {
    risque += 1.5;
  }
  if (rr != null && rr >= mission.targetLogic.minRR) {
    risque += 4;
    checks.push({
      verdict: "good",
      text: `Ratio risque/rendement de 1 : ${rr.toLocaleString("fr-FR")} — le trade vaut le risque pris.`,
    });
  } else if (rr != null && rr >= 1) {
    risque += 2;
    checks.push({
      verdict: "warn",
      text: `Ratio de 1 : ${rr.toLocaleString("fr-FR")} — jouable, mais vise au moins 1 : ${mission.targetLogic.minRR.toLocaleString("fr-FR")} sur ce type de configuration.`,
    });
  } else {
    checks.push({ verdict: "bad", text: mission.mistakes.lowRR });
  }
  risque = round1(clamp(risque, 0, 10));

  // — Discipline : plan complet, risque contrôlé, pas de chasse
  let discipline = 10;
  if (rr != null && rr < 1) discipline -= 3;
  if (!structureOk) discipline -= 2;
  if (
    mission.entryRange &&
    (plan.entry < mission.entryRange.min || plan.entry > mission.entryRange.max)
  )
    discipline -= 2;
  if (!decisionOk) discipline -= 1;
  discipline = round1(clamp(discipline, 0, 10));

  const final = round1(
    analyse * 0.3 + entree * 0.2 + risque * 0.3 + discipline * 0.2,
  );

  return {
    checks,
    scores: { analyse, entree: round1(entree), risque, discipline },
    final,
    xp: xpFor(mission, final),
    headline: headlineFor(input.outcome?.kind ?? "expired"),
    takeaway: mission.explanation,
  };
}

function xpFor(mission: Mission, final: number): number {
  return Math.round(mission.xpReward * clamp(final / 10, 0.25, 1));
}

export function formatPrice(price: number, precision: number): string {
  return price.toLocaleString("fr-FR", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function formatEuro(amount: number, digits = 0): string {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
