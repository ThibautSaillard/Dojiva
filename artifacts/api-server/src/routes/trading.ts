import { Router, type IRouter } from "express";
import type { Request, Response, NextFunction } from "express";
import { asc, desc, eq, and, sql } from "drizzle-orm";
import {
  db,
  playerProgressTable,
  completedLessonsTable,
  lessonsTable,
  simScenariosTable,
  simTradesTable,
  strategiesTable,
  badgesTable,
  earnedBadgesTable,
} from "@workspace/db";
import {
  CreateScenarioResponse,
  SubmitTradeBody,
  SubmitTradeResponse,
  GetJournalResponse,
  ListStrategiesResponse,
  CreateStrategyBody,
  CreateStrategyResponse,
  DeleteStrategyParams,
  DeleteStrategyResponse,
  GetCoachAdviceResponse,
  ListBadgesResponse,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

type Candle = { o: number; h: number; l: number; c: number };

const MARKETS = [
  { name: "BTC/USD", base: 40000, vol: 0.018 },
  { name: "ETH/USD", base: 2500, vol: 0.022 },
  { name: "EUR/USD", base: 1.09, vol: 0.004 },
  { name: "S&P 500", base: 5200, vol: 0.008 },
  { name: "Or (XAU/USD)", base: 2300, vol: 0.007 },
  { name: "Apple (AAPL)", base: 190, vol: 0.012 },
];
const TIMEFRAMES = ["15m", "1h", "4h", "1j"];

function generateCandles(base: number, vol: number, count: number): Candle[] {
  const candles: Candle[] = [];
  let price = base * (0.9 + Math.random() * 0.2);
  // regime-based random walk: trending phases + ranges
  let drift = 0;
  for (let i = 0; i < count; i++) {
    if (i % 12 === 0) {
      const r = Math.random();
      drift = r < 0.35 ? vol * 0.6 : r < 0.7 ? -vol * 0.6 : 0;
    }
    const o = price;
    const move = drift * price + (Math.random() - 0.5) * 2 * vol * price;
    const c = Math.max(o + move, base * 0.05);
    const h = Math.max(o, c) + Math.random() * vol * price * 0.6;
    const l = Math.min(o, c) - Math.random() * vol * price * 0.6;
    const round = (x: number) => Number(x.toPrecision(6));
    candles.push({ o: round(o), h: round(h), l: round(l), c: round(c) });
    price = c;
  }
  return candles;
}

async function getProgress() {
  const [p] = await db.select().from(playerProgressTable).limit(1);
  if (p) return p;
  const [created] = await db.insert(playerProgressTable).values({}).returning();
  return created!;
}

async function awardBadge(code: string) {
  const [badge] = await db
    .select()
    .from(badgesTable)
    .where(eq(badgesTable.code, code));
  if (!badge) return;
  await db
    .insert(earnedBadgesTable)
    .values({ badgeId: badge.id })
    .onConflictDoNothing();
}

// Idempotent badge catalog seed — guarantees badge definitions exist in any environment.
const BADGE_SEED = [
  { code: "first-lesson", title: "Premier pas", description: "Termine ta première leçon", emoji: "🎓" },
  { code: "world-1", title: "Fondations solides", description: "Termine le monde « Les bases des marchés »", emoji: "🌱" },
  { code: "streak-3", title: "En feu", description: "Atteins une série de 3 jours", emoji: "🔥" },
  { code: "first-trade", title: "Premier trade", description: "Passe ton premier trade dans le simulateur", emoji: "🎮" },
  { code: "first-win", title: "Objectif atteint", description: "Gagne ton premier trade (Take Profit touché)", emoji: "🎯" },
  { code: "good-rr", title: "Maître du ratio", description: "Gagne un trade avec un ratio risque/rendement ≥ 2", emoji: "⚖️" },
  { code: "ten-trades", title: "Trader assidu", description: "Passe 10 trades dans le simulateur", emoji: "📈" },
  { code: "first-strategy", title: "Stratège", description: "Crée ta première stratégie dans le Laboratoire", emoji: "🧪" },
];
let badgesSeeded = false;
async function ensureBadges() {
  if (badgesSeeded) return;
  await db.insert(badgesTable).values(BADGE_SEED).onConflictDoNothing();
  badgesSeeded = true;
}

// Server-side premium gate: all game features require the (free) premium activation.
async function requirePremium(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const progress = await getProgress();
  if (!progress.premium) {
    res.status(403).json({
      error:
        "Section Premium : active ton accès depuis l'application pour débloquer cette fonctionnalité.",
    });
    return;
  }
  next();
}

function isFinitePositive(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

router.use(
  ["/simulator", "/journal", "/strategies", "/coach"],
  (req, res, next) => {
    requirePremium(req, res, next).catch(next);
  },
);

router.post("/simulator/scenario", async (_req, res): Promise<void> => {
  const market = MARKETS[Math.floor(Math.random() * MARKETS.length)]!;
  const timeframe = TIMEFRAMES[Math.floor(Math.random() * TIMEFRAMES.length)]!;
  const total = 60;
  const visibleCount = 40;
  const candles = generateCandles(market.base, market.vol, total);
  const [scenario] = await db
    .insert(simScenariosTable)
    .values({
      market: market.name,
      timeframe,
      candles: JSON.stringify(candles),
      visibleCount,
    })
    .returning();
  const progress = await getProgress();
  res.json(
    CreateScenarioResponse.parse({
      id: scenario!.id,
      market: market.name,
      timeframe,
      candles: candles.slice(0, visibleCount),
      balance: progress.balance,
    }),
  );
});

router.post("/simulator/trades", async (req, res): Promise<void> => {
  const body = SubmitTradeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  if (
    body.data.riskPercent != null &&
    (!Number.isFinite(body.data.riskPercent) ||
      body.data.riskPercent < 0.1 ||
      body.data.riskPercent > 5)
  ) {
    res
      .status(400)
      .json({ error: "Le risque par trade doit être entre 0,1% et 5% du capital." });
    return;
  }
  // Claim the scenario atomically: resolves exactly once even under replay/concurrency.
  const [scenario] = await db
    .update(simScenariosTable)
    .set({ used: true })
    .where(
      and(
        eq(simScenariosTable.id, body.data.scenarioId),
        eq(simScenariosTable.used, false),
      ),
    )
    .returning();
  if (!scenario) {
    res
      .status(409)
      .json({ error: "Scénario introuvable ou déjà joué. Lance un nouveau scénario." });
    return;
  }
  const all: Candle[] = JSON.parse(scenario.candles);
  const visible = all.slice(0, scenario.visibleCount);
  const future = all.slice(scenario.visibleCount);
  const lastClose = visible[visible.length - 1]!.c;
  const progress = await getProgress();
  const feedback: string[] = [];

  const { direction } = body.data;
  let outcome: "take-profit" | "stop-loss" | "expired" | "waited" = "waited";
  let exitPrice: number | null = null;
  let pnl = 0;
  let riskReward: number | null = null;

  if (direction === "wait") {
    const drift = (future[future.length - 1]!.c - lastClose) / lastClose;
    feedback.push(
      Math.abs(drift) < 0.01
        ? "Bonne patience ! Le marché n'offrait pas d'opportunité claire."
        : drift > 0
          ? "Le marché est monté sans toi. Attendre n'est pas une erreur, mais note ce que tu n'as pas su lire."
          : "Le marché a chuté : attendre t'a évité une mauvaise position. Bien joué.",
    );
  } else {
    const entry = body.data.entry ?? lastClose;
    const sl = body.data.stopLoss;
    const tp = body.data.takeProfit;
    if (sl == null || tp == null) {
      res
        .status(400)
        .json({ error: "Stop Loss et Take Profit sont obligatoires" });
      return;
    }
    if (
      !isFinitePositive(entry) ||
      !isFinitePositive(sl) ||
      !isFinitePositive(tp)
    ) {
      res
        .status(400)
        .json({ error: "Entrée, Stop Loss et Take Profit doivent être des prix positifs." });
      return;
    }
    if (body.data.strategyId != null) {
      const [strat] = await db
        .select({ id: strategiesTable.id })
        .from(strategiesTable)
        .where(eq(strategiesTable.id, body.data.strategyId));
      if (!strat) {
        res.status(400).json({ error: "Stratégie liée introuvable." });
        return;
      }
    }
    const isBuy = direction === "buy";
    if ((isBuy && (sl >= entry || tp <= entry)) || (!isBuy && (sl <= entry || tp >= entry))) {
      res.status(400).json({
        error: isBuy
          ? "Pour un achat : Stop Loss sous l'entrée et Take Profit au-dessus."
          : "Pour une vente : Stop Loss au-dessus de l'entrée et Take Profit en dessous.",
      });
      return;
    }
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    riskReward = Number((reward / risk).toFixed(2));
    const riskPercent = body.data.riskPercent ?? 1;
    const riskAmount = (progress.balance * riskPercent) / 100;

    outcome = "expired";
    exitPrice = future[future.length - 1]!.c;
    for (const candle of future) {
      const hitSl = isBuy ? candle.l <= sl : candle.h >= sl;
      const hitTp = isBuy ? candle.h >= tp : candle.l <= tp;
      if (hitSl && hitTp) {
        // conservative: assume SL hit first
        outcome = "stop-loss";
        exitPrice = sl;
        break;
      }
      if (hitSl) {
        outcome = "stop-loss";
        exitPrice = sl;
        break;
      }
      if (hitTp) {
        outcome = "take-profit";
        exitPrice = tp;
        break;
      }
    }
    if (outcome === "take-profit") pnl = riskAmount * riskReward;
    else if (outcome === "stop-loss") pnl = -riskAmount;
    else {
      const move = isBuy ? exitPrice! - entry : entry - exitPrice!;
      pnl = (move / risk) * riskAmount;
    }
    pnl = Number(pnl.toFixed(2));

    // pedagogical feedback
    if (riskReward < 1)
      feedback.push(
        `Ton ratio risque/rendement est de ${riskReward} : tu risques plus que ce que tu peux gagner. Vise au moins 1,5.`,
      );
    else if (riskReward >= 2)
      feedback.push(
        `Excellent ratio risque/rendement de ${riskReward} : c'est la marque d'un trade bien construit.`,
      );
    else feedback.push(`Ratio risque/rendement correct (${riskReward}).`);
    if (riskPercent > 2)
      feedback.push(
        `Tu as risqué ${riskPercent}% de ton capital : les pros restent souvent sous 2%.`,
      );
    const recentTrend =
      visible[visible.length - 1]!.c - visible[visible.length - 10]!.c;
    if ((recentTrend > 0 && isBuy) || (recentTrend < 0 && !isBuy))
      feedback.push("Tu as tradé dans le sens de la tendance récente : bonne lecture de structure.");
    else
      feedback.push(
        "Attention : tu as tradé contre la tendance récente. Ce n'est pas interdit, mais cela demande une zone très solide.",
      );
    if (outcome === "take-profit")
      feedback.push("🎯 Objectif atteint ! Ton plan a fonctionné.");
    else if (outcome === "stop-loss")
      feedback.push(
        "🛑 Stop touché. Perdre fait partie du jeu : l'important est que ta perte était contrôlée.",
      );
    else feedback.push("⏳ Le marché n'a touché ni ton objectif ni ton stop.");
  }

  // Atomic increment: no lost updates under concurrent trades.
  const [updated] = await db
    .update(playerProgressTable)
    .set({
      balance: sql`round((${playerProgressTable.balance} + ${pnl})::numeric, 2)::double precision`,
    })
    .where(eq(playerProgressTable.id, progress.id))
    .returning({ balance: playerProgressTable.balance });
  const newBalance = updated?.balance ?? progress.balance + pnl;
  await db.insert(simTradesTable).values({
    scenarioId: scenario.id,
    strategyId: body.data.strategyId ?? null,
    market: scenario.market,
    direction,
    entry: body.data.entry ?? null,
    stopLoss: body.data.stopLoss ?? null,
    takeProfit: body.data.takeProfit ?? null,
    riskPercent: body.data.riskPercent ?? null,
    outcome,
    exitPrice,
    pnl,
    riskReward,
    emotion: body.data.emotion ?? null,
    feedback,
  });

  const trades = await db.select().from(simTradesTable);
  const realTrades = trades.filter((t) => t.direction !== "wait");
  if (realTrades.length >= 1) await awardBadge("first-trade");
  if (realTrades.length >= 10) await awardBadge("ten-trades");
  if (outcome === "take-profit") await awardBadge("first-win");
  if (riskReward != null && riskReward >= 2 && outcome === "take-profit")
    await awardBadge("good-rr");

  res.json(
    SubmitTradeResponse.parse({
      outcome,
      pnl,
      balance: newBalance,
      exitPrice,
      riskReward,
      futureCandles: future,
      feedback,
    }),
  );
});

router.get("/journal", async (_req, res): Promise<void> => {
  const trades = await db
    .select()
    .from(simTradesTable)
    .orderBy(desc(simTradesTable.createdAt));
  const strategies = await db.select().from(strategiesTable);
  const stratName = new Map(strategies.map((s) => [s.id, s.name]));
  const progress = await getProgress();
  const real = trades.filter((t) => t.direction !== "wait");
  const wins = real.filter((t) => t.pnl > 0).length;
  const losses = real.filter((t) => t.pnl < 0).length;
  const rrs = real.filter((t) => t.riskReward != null).map((t) => t.riskReward!);
  const pnls = real.map((t) => t.pnl);
  res.json(
    GetJournalResponse.parse({
      entries: trades.map((t) => ({
        id: t.id,
        market: t.market,
        direction: t.direction,
        outcome: t.outcome,
        pnl: t.pnl,
        riskReward: t.riskReward,
        emotion: t.emotion,
        strategyName: t.strategyId ? (stratName.get(t.strategyId) ?? null) : null,
        feedback: t.feedback ?? [],
        createdAt: t.createdAt.toISOString(),
      })),
      stats: {
        totalTrades: real.length,
        wins,
        losses,
        winRate: real.length ? Number(((wins / real.length) * 100).toFixed(1)) : 0,
        avgRiskReward: rrs.length
          ? Number((rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2))
          : null,
        balance: progress.balance,
        bestPnl: pnls.length ? Math.max(...pnls) : null,
        worstPnl: pnls.length ? Math.min(...pnls) : null,
      },
    }),
  );
});

router.get("/strategies", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(strategiesTable)
    .orderBy(asc(strategiesTable.id));
  res.json(
    ListStrategiesResponse.parse(
      rows.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })),
    ),
  );
});

router.post("/strategies", async (req, res): Promise<void> => {
  const body = CreateStrategyBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const texts = [
    body.data.name,
    body.data.market,
    body.data.style,
    body.data.timeframe,
    body.data.stopLossRule ?? "",
    body.data.takeProfitRule ?? "",
    ...body.data.context,
    ...body.data.entryRules,
  ];
  if (
    body.data.name.trim().length === 0 ||
    texts.some((t) => t.length > 200) ||
    body.data.context.length > 20 ||
    body.data.entryRules.length > 20
  ) {
    res.status(400).json({ error: "Champs de stratégie invalides ou trop longs." });
    return;
  }
  if (
    !Number.isFinite(body.data.riskPercent) ||
    body.data.riskPercent < 0.1 ||
    body.data.riskPercent > 5
  ) {
    res
      .status(400)
      .json({ error: "Le risque par trade doit être entre 0,1% et 5% du capital." });
    return;
  }
  const [created] = await db
    .insert(strategiesTable)
    .values({
      name: body.data.name,
      market: body.data.market,
      style: body.data.style,
      timeframe: body.data.timeframe,
      context: body.data.context,
      entryRules: body.data.entryRules,
      stopLossRule: body.data.stopLossRule ?? null,
      takeProfitRule: body.data.takeProfitRule ?? null,
      riskPercent: body.data.riskPercent,
    })
    .returning();
  await awardBadge("first-strategy");
  res.json(
    CreateStrategyResponse.parse({
      ...created!,
      createdAt: created!.createdAt.toISOString(),
    }),
  );
});

router.delete("/strategies/:id", async (req, res): Promise<void> => {
  const params = DeleteStrategyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const deleted = await db
    .delete(strategiesTable)
    .where(eq(strategiesTable.id, params.data.id))
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Stratégie introuvable" });
    return;
  }
  res.json(DeleteStrategyResponse.parse({ ok: true }));
});

// Simple cooldown so the AI coach can't be spammed.
let lastCoachCallAt = 0;
const COACH_COOLDOWN_MS = 15_000;

router.post("/coach", async (req, res): Promise<void> => {
  const now = Date.now();
  if (now - lastCoachCallAt < COACH_COOLDOWN_MS) {
    res.status(429).json({
      error: "Le coach vient juste de te répondre. Réessaie dans quelques secondes.",
    });
    return;
  }
  lastCoachCallAt = now;
  const progress = await getProgress();
  const completed = await db
    .select({
      lessonId: completedLessonsTable.lessonId,
      score: completedLessonsTable.score,
      total: completedLessonsTable.total,
    })
    .from(completedLessonsTable);
  const lessons = await db.select().from(lessonsTable);
  const lessonTitle = new Map(lessons.map((l) => [l.id, l.title]));
  const trades = await db
    .select()
    .from(simTradesTable)
    .orderBy(desc(simTradesTable.createdAt))
    .limit(30);

  const learningSummary = completed
    .map(
      (c) =>
        `- "${lessonTitle.get(c.lessonId) ?? "Leçon"}" : ${c.score}/${c.total}`,
    )
    .join("\n");
  const tradeSummary = trades
    .map(
      (t) =>
        `- ${t.market} ${t.direction} → ${t.outcome}, PnL ${t.pnl}€, RR ${t.riskReward ?? "n/a"}, risque ${t.riskPercent ?? "n/a"}%, émotion: ${t.emotion ?? "n/a"}`,
    )
    .join("\n");

  const prompt = `Tu es le coach IA de Dojiva, une app qui apprend le trading aux débutants complets, sur le ton fun et bienveillant de Duolingo. Tutoie l'utilisateur.

Données de l'élève :
XP: ${progress.xp}, série: ${progress.streak} jours, capital virtuel: ${progress.balance}€.

Résultats de leçons (score/total) :
${learningSummary || "Aucune leçon terminée."}

Trades du simulateur (les plus récents d'abord) :
${tradeSummary || "Aucun trade effectué."}

Rédige EXACTEMENT 3 conseils courts en français, un par catégorie :
1. "apprentissage" : sur ses résultats de leçons (points faibles à retravailler, ou encouragement à continuer).
2. "simulation" : sur sa manière de trader (ratio, timing, sens de la tendance).
3. "discipline" : sur la gestion du risque et les émotions.

Réponds UNIQUEMENT avec un JSON de cette forme, sans markdown :
{"sections":[{"category":"apprentissage","title":"...", "message":"..."},{"category":"simulation","title":"...","message":"..."},{"category":"discipline","title":"...","message":"..."}]}
Chaque "title" fait 3-6 mots, chaque "message" fait 2-3 phrases maximum. Ne promets jamais de gains financiers.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = response.choices[0]?.message?.content ?? "";
    const jsonText = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonText) as {
      sections: { category: string; title: string; message: string }[];
    };
    res.json(
      GetCoachAdviceResponse.parse({
        sections: parsed.sections,
        generatedAt: new Date().toISOString(),
      }),
    );
  } catch (err) {
    req.log.error({ err }, "coach generation failed");
    res.json(
      GetCoachAdviceResponse.parse({
        sections: [
          {
            category: "apprentissage",
            title: "Continue ton parcours",
            message:
              "Termine quelques leçons de plus pour que je puisse analyser tes points forts et tes points faibles.",
          },
          {
            category: "simulation",
            title: "Entraîne-toi au simulateur",
            message:
              "Fais quelques trades dans le simulateur : j'analyserai ton timing, tes ratios et ta lecture de tendance.",
          },
          {
            category: "discipline",
            title: "Risque toujours contrôlé",
            message:
              "Règle d'or : ne risque jamais plus de 1 à 2% de ton capital sur un seul trade, même quand tu es confiant.",
          },
        ],
        generatedAt: new Date().toISOString(),
      }),
    );
  }
});

router.get("/badges", async (_req, res): Promise<void> => {
  await ensureBadges();
  const badges = await db.select().from(badgesTable).orderBy(asc(badgesTable.id));
  const earned = await db.select().from(earnedBadgesTable);
  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));
  res.json(
    ListBadgesResponse.parse(
      badges.map((b) => ({
        ...b,
        earned: earnedMap.has(b.id),
        earnedAt: earnedMap.get(b.id)?.toISOString() ?? null,
      })),
    ),
  );
});

export default router;
