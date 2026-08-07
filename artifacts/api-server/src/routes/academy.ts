import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import {
  db,
  worldsTable,
  lessonsTable,
  lessonStepsTable,
  playerProgressTable,
  completedLessonsTable,
  testimonialsTable,
  badgesTable,
  earnedBadgesTable,
} from "@workspace/db";
import {
  ListWorldsResponse,
  GetLessonParams,
  GetLessonResponse,
  CompleteLessonParams,
  CompleteLessonBody,
  CompleteLessonResponse,
  GetProgressResponse,
  SaveOnboardingBody,
  SaveOnboardingResponse,
  ListTestimonialsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function awardBadge(code: string) {
  const [badge] = await db
    .select()
    .from(badgesTable)
    .where(eq(badgesTable.code, code));
  if (!badge) return;
  const earned = await db
    .select()
    .from(earnedBadgesTable)
    .where(eq(earnedBadgesTable.badgeId, badge.id));
  if (earned.length === 0) {
    await db.insert(earnedBadgesTable).values({ badgeId: badge.id });
  }
}

async function getOrCreateProgress() {
  const [existing] = await db.select().from(playerProgressTable).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(playerProgressTable)
    .values({})
    .returning();
  return created!;
}

async function buildProgressPayload() {
  const progress = await getOrCreateProgress();
  const completed = await db
    .select({ lessonId: completedLessonsTable.lessonId })
    .from(completedLessonsTable);
  return {
    xp: progress.xp,
    level: Math.floor(progress.xp / 100) + 1,
    streak: progress.streak,
    hearts: progress.hearts,
    completedLessonIds: [...new Set(completed.map((c) => c.lessonId))],
    onboarded: progress.onboarded,
    goal: progress.goal,
    experienceLevel: progress.experienceLevel,
    markets: progress.markets ?? [],
    style: progress.style,
    premium: progress.premium,
    plan: progress.plan,
    balance: progress.balance,
  };
}

router.get("/worlds", async (_req, res): Promise<void> => {
  const worlds = await db
    .select()
    .from(worldsTable)
    .orderBy(asc(worldsTable.order));
  const lessons = await db
    .select()
    .from(lessonsTable)
    .orderBy(asc(lessonsTable.order));
  const progress = await getOrCreateProgress();
  const payload = worlds.map((w) => ({
    ...w,
    locked: progress.premium ? false : w.locked,
    lessons: lessons
      .filter((l) => l.worldId === w.id)
      .map((l) => (progress.premium ? { ...l, free: true } : l)),
  }));
  res.json(ListWorldsResponse.parse(payload));
});

router.post("/premium/activate", async (_req, res): Promise<void> => {
  res.status(402).json({
    error: "Paiement requis. Le premium est activé après confirmation du paiement.",
  });
});

router.get("/lessons/:id", async (req, res): Promise<void> => {
  const params = GetLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, params.data.id));
  if (!lesson) {
    res.status(404).json({ error: "Leçon introuvable" });
    return;
  }
  const progress = await getOrCreateProgress();
  if (!lesson.free && !progress.premium) {
    res.status(402).json({ error: "Cette leçon nécessite un accès premium." });
    return;
  }
  const steps = await db
    .select()
    .from(lessonStepsTable)
    .where(eq(lessonStepsTable.lessonId, lesson.id))
    .orderBy(asc(lessonStepsTable.order));
  res.json(
    GetLessonResponse.parse({
      ...lesson,
      steps: steps.map((s) => ({
        id: s.id,
        type: s.type,
        prompt: s.prompt,
        body: s.body,
        options: s.options ?? [],
        correctIndex: s.correctIndex,
        explanation: s.explanation,
        chart: s.chart,
      })),
    }),
  );
});

router.post("/lessons/:id/complete", async (req, res): Promise<void> => {
  const params = CompleteLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = CompleteLessonBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, params.data.id));
  if (!lesson) {
    res.status(404).json({ error: "Leçon introuvable" });
    return;
  }

  const progress = await getOrCreateProgress();
  if (!lesson.free && !progress.premium) {
    res.status(402).json({ error: "Cette leçon nécessite un accès premium." });
    return;
  }
  const [already] = await db
    .select()
    .from(completedLessonsTable)
    .where(eq(completedLessonsTable.lessonId, lesson.id))
    .limit(1);

  await db.insert(completedLessonsTable).values({
    lessonId: lesson.id,
    score: body.data.score,
    total: body.data.total,
  });

  const now = new Date();
  const last = progress.lastActivityAt;
  let streak = progress.streak;
  if (!last) {
    streak = 1;
  } else {
    const dayMs = 24 * 60 * 60 * 1000;
    const lastDay = Math.floor(last.getTime() / dayMs);
    const today = Math.floor(now.getTime() / dayMs);
    if (today === lastDay + 1) streak += 1;
    else if (today > lastDay + 1) streak = 1;
    else if (streak === 0) streak = 1;
  }

  await db
    .update(playerProgressTable)
    .set({
      xp: progress.xp + (already ? 5 : lesson.xpReward),
      streak,
      lastActivityAt: now,
    })
    .where(eq(playerProgressTable.id, progress.id));

  await awardBadge("first-lesson");
  if (streak >= 3) await awardBadge("streak-3");
  const world1Lessons = (
    await db
      .select({ id: lessonsTable.id })
      .from(lessonsTable)
      .where(eq(lessonsTable.worldId, 1))
  ).map((l) => l.id);
  const done = await db
    .select({ lessonId: completedLessonsTable.lessonId })
    .from(completedLessonsTable);
  const doneSet = new Set(done.map((d) => d.lessonId));
  if (world1Lessons.length > 0 && world1Lessons.every((id) => doneSet.has(id)))
    await awardBadge("world-1");

  res.json(CompleteLessonResponse.parse(await buildProgressPayload()));
});

router.get("/progress", async (_req, res): Promise<void> => {
  res.json(GetProgressResponse.parse(await buildProgressPayload()));
});

router.post("/progress/onboarding", async (req, res): Promise<void> => {
  const body = SaveOnboardingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const progress = await getOrCreateProgress();
  await db
    .update(playerProgressTable)
    .set({
      onboarded: true,
      goal: body.data.goal,
      experienceLevel: body.data.experienceLevel,
      markets: body.data.markets,
      style: body.data.style,
    })
    .where(eq(playerProgressTable.id, progress.id));
  res.json(SaveOnboardingResponse.parse(await buildProgressPayload()));
});

router.get("/testimonials", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(testimonialsTable)
    .orderBy(asc(testimonialsTable.id));
  res.json(ListTestimonialsResponse.parse(rows));
});

export default router;
