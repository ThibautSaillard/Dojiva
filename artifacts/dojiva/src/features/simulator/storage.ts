/**
 * Progression des missions, persistée en localStorage (MVP).
 * Le branchement au compte joueur côté serveur suivra la mise en place
 * des comptes individuels.
 */
export interface MissionRecord {
  bestScore: number;
  xp: number;
  completedAt: string;
}

export interface SimProgress {
  missions: Record<number, MissionRecord>;
  totalXp: number;
}

const KEY = "dojiva.sim.progress.v1";

function emptyProgress(): SimProgress {
  return { missions: {}, totalXp: 0 };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Normalise une progression potentiellement corrompue (JSON valide mais
 * structure inattendue) vers une forme sûre : les entrées invalides sont
 * ignorées plutôt que de faire planter l'interface.
 */
function sanitizeProgress(parsed: unknown): SimProgress {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return emptyProgress();
  }
  const rawMissions = (parsed as { missions?: unknown }).missions;
  if (!rawMissions || typeof rawMissions !== "object" || Array.isArray(rawMissions)) {
    return emptyProgress();
  }

  const missions: Record<number, MissionRecord> = {};
  let xpSum = 0;
  for (const [key, value] of Object.entries(rawMissions as Record<string, unknown>)) {
    const id = Number(key);
    if (!Number.isInteger(id) || id < 1) continue;
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const record = value as Partial<MissionRecord>;
    if (!isFiniteNumber(record.bestScore) || !isFiniteNumber(record.xp)) continue;
    const clean: MissionRecord = {
      bestScore: Math.min(10, Math.max(0, record.bestScore)),
      xp: Math.max(0, record.xp),
      completedAt:
        typeof record.completedAt === "string" ? record.completedAt : "",
    };
    missions[id] = clean;
    xpSum += clean.xp;
  }

  const rawTotal = (parsed as { totalXp?: unknown }).totalXp;
  const totalXp =
    isFiniteNumber(rawTotal) && rawTotal >= 0 ? rawTotal : xpSum;

  return { missions, totalXp };
}

export function loadSimProgress(): SimProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    return sanitizeProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function recordMissionResult(
  missionId: number,
  score: number,
  xp: number,
): SimProgress {
  const progress = loadSimProgress();
  const safeScore = isFiniteNumber(score)
    ? Math.min(10, Math.max(0, score))
    : 0;
  const safeXp = isFiniteNumber(xp) ? Math.max(0, xp) : 0;
  const prev = progress.missions[missionId];
  const xpGained = prev ? Math.max(0, safeXp - prev.xp) : safeXp;
  progress.missions[missionId] = {
    bestScore: Math.max(prev?.bestScore ?? 0, safeScore),
    xp: Math.max(prev?.xp ?? 0, safeXp),
    completedAt: new Date().toISOString(),
  };
  progress.totalXp += xpGained;
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // stockage indisponible : la session continue sans persistance
  }
  return progress;
}

export function completedCount(progress: SimProgress): number {
  return Object.keys(progress.missions).length;
}

/** Première mission non terminée (1-indexée), pour « Continuer ». */
export function nextMissionId(progress: SimProgress, total: number): number {
  for (let id = 1; id <= total; id++) {
    if (!progress.missions[id]) return id;
  }
  return total;
}
