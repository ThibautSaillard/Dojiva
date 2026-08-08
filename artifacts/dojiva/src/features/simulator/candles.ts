import { mulberry32 } from "./prng";
import type { Candle } from "./types";

/**
 * Générateur déterministe de bougies par phases.
 * Chaque mission décrit son scénario (tendances, ranges, cassures, mèches)
 * et obtient toujours exactement la même série : les performances sont comparables.
 */
export type PhaseSpec =
  | { kind: "trend"; bars: number; to: number; noise?: number }
  | { kind: "spike"; bars: number; to: number; noise?: number }
  | {
      kind: "range";
      bars: number;
      low: number;
      high: number;
      cycles?: number;
      noise?: number;
    }
  /** Une seule bougie « chasse de stops » : longue mèche jusqu'à `to`. */
  | { kind: "wick"; to: number };

export interface SeriesSpec {
  seed: number;
  /** Epoch secondes de la première bougie. */
  startTime: number;
  stepMinutes: number;
  open: number;
  precision: number;
  baseVolume: number;
  phases: PhaseSpec[];
}

const clamp = (x: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, x));

export function buildCandles(spec: SeriesSpec): Candle[] {
  const rnd = mulberry32(spec.seed);
  const round = (x: number) => Number(x.toFixed(spec.precision));
  const step = spec.stepMinutes * 60;
  const candles: Candle[] = [];
  let price = spec.open;
  let time = spec.startTime;

  const push = (o: number, h: number, l: number, c: number, v: number) => {
    const hi = Math.max(o, c, h);
    const lo = Math.min(o, c, l);
    candles.push({
      t: time,
      o: round(o),
      h: round(hi),
      l: round(lo),
      c: round(c),
      v: Math.max(1, Math.round(v)),
    });
    price = round(c);
    time += step;
  };

  for (const phase of spec.phases) {
    if (phase.kind === "wick") {
      const o = price;
      const depth = Math.abs(o - phase.to);
      const up = phase.to < o;
      const c = up ? o + depth * 0.12 : o - depth * 0.12;
      const h = up ? Math.max(o, c) + depth * 0.08 : phase.to;
      const l = up ? phase.to : Math.min(o, c) - depth * 0.08;
      push(o, h, l, c, spec.baseVolume * 1.9);
      continue;
    }

    if (phase.kind === "trend" || phase.kind === "spike") {
      const from = price;
      const n = phase.bars;
      const noise = phase.noise ?? 0.0035;
      for (let i = 0; i < n; i++) {
        const linear = (i + 1) / n;
        const progress =
          phase.kind === "spike" ? Math.pow(linear, 0.55) : linear;
        const target = from + (phase.to - from) * progress;
        const damp = i === n - 1 ? 0.25 : 1;
        const c = target + (rnd() - 0.5) * 2 * noise * price * damp;
        const o = price;
        const wickUp = rnd() * noise * price * 0.8;
        const wickDn = rnd() * noise * price * 0.8;
        const body = Math.abs(c - o);
        const volMult =
          (phase.kind === "spike" ? 1.7 : 1) +
          (body / (noise * price * 2)) * 0.5;
        push(
          o,
          Math.max(o, c) + wickUp,
          Math.min(o, c) - wickDn,
          c,
          spec.baseVolume * (0.55 + rnd() * 0.9) * volMult,
        );
      }
      continue;
    }

    // range
    const { low, high } = phase;
    const width = high - low;
    const n = phase.bars;
    const cycles = phase.cycles ?? Math.max(1, Math.round(n / 9));
    const noise = phase.noise ?? 0.22;
    const posNow = clamp((price - low) / width, 0, 1);
    const phase0 = Math.asin(posNow * 2 - 1);
    for (let i = 0; i < n; i++) {
      const s = Math.sin(phase0 + (2 * Math.PI * cycles * (i + 1)) / n);
      const pos = 0.5 + 0.5 * s;
      let c = low + pos * width + (rnd() - 0.5) * noise * width * 0.6;
      c = clamp(c, low + width * 0.04, high - width * 0.04);
      const o = price;
      let h = Math.max(o, c) + rnd() * noise * width * 0.6;
      let l = Math.min(o, c) - rnd() * noise * width * 0.6;
      // Aux extrêmes du cycle, la mèche touche réellement le niveau.
      if (pos > 0.88) h = Math.max(h, high);
      if (pos < 0.12) l = Math.min(l, low);
      h = Math.min(h, high + width * 0.05);
      l = Math.max(l, low - width * 0.05);
      push(o, h, l, c, spec.baseVolume * (0.5 + rnd() * 0.8));
    }
  }

  return candles;
}
