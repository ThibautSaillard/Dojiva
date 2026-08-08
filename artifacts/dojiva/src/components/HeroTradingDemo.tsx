import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

/**
 * Mini-widget de trading jouable de la hero.
 * - Chandeliers animés en continu (marche aléatoire douce, aucune vraie donnée).
 * - Acheter / Vendre ouvre une "position" de ~2,5 s ; le résultat (gagné/perdu)
 *   est tiré au sort, puis le graphique est doucement biaisé dans ce sens :
 *   le pourcentage affiché correspond TOUJOURS au mouvement réellement visible.
 *
 * Architecture : le moteur (bougies + position) vit dans une ref mutée
 * impérativement par un seul setInterval, PUIS ses résultats sont publiés
 * vers React via des setState à valeur. Aucune logique dans un state updater :
 * la double invocation des updaters en StrictMode ne peut donc ni accélérer
 * les ticks ni écourter une position.
 */

type Candle = { open: number; high: number; low: number; close: number };
type Phase = "idle" | "holding" | "result";
type Side = "buy" | "sell";

type EngineState = {
  candles: Candle[];
  tickInCandle: number;
  phase: Phase;
  side: Side | null;
  entry: number | null;
  target: number | null;
  holdTicksLeft: number;
};

const CANDLE_COUNT = 28;
const TICK_MS = 170; // ~6 mises à jour/seconde
const TICKS_PER_CANDLE = 7; // une bougie se clôture toutes les ~1,2 s
const HOLD_TICKS = 15; // position tenue ~2,5 s
const START_PRICE = 1.0842; // clin d'œil EUR/USD, purement décoratif
const MIN_RESULT_MOVE = 0.001; // ±0,1 % minimum, garanti dans la trajectoire elle-même

const GREEN = "#22c55e";
const RED = "#ef4444";

function makeInitialCandles(): Candle[] {
  const candles: Candle[] = [];
  let price = START_PRICE;
  for (let i = 0; i < CANDLE_COUNT; i++) {
    const open = price;
    let high = open;
    let low = open;
    let close = open;
    for (let t = 0; t < TICKS_PER_CANDLE; t++) {
      close += (Math.random() - 0.5) * 0.0011;
      high = Math.max(high, close);
      low = Math.min(low, close);
    }
    candles.push({ open, high, low, close });
    price = close;
  }
  return candles;
}

function createEngine(): EngineState {
  return {
    candles: makeInitialCandles(),
    tickInCandle: 0,
    phase: "idle",
    side: null,
    entry: null,
    target: null,
    holdTicksLeft: 0,
  };
}

/** Avance le moteur d'exactement un tick. Retourne le résultat si la position vient de se clôturer. */
function stepEngine(engine: EngineState): number | null {
  const current = engine.candles[engine.candles.length - 1];

  // Marche aléatoire douce + léger retour vers le prix de départ.
  let delta = (Math.random() - 0.5) * 0.0011 + (START_PRICE - current.close) * 0.004;

  // Position en cours : dérive discrète vers le résultat tiré au sort.
  if (engine.phase === "holding" && engine.target !== null) {
    delta += (engine.target - current.close) * 0.16;
  }

  current.close = Number((current.close + delta).toFixed(5));
  current.high = Math.max(current.high, current.close);
  current.low = Math.min(current.low, current.close);

  engine.tickInCandle += 1;
  if (engine.tickInCandle >= TICKS_PER_CANDLE) {
    engine.tickInCandle = 0;
    engine.candles.push({ open: current.close, high: current.close, low: current.close, close: current.close });
    if (engine.candles.length > CANDLE_COUNT) engine.candles.shift();
  }

  if (engine.phase !== "holding") return null;

  engine.holdTicksLeft -= 1;
  if (engine.holdTicksLeft > 0 || engine.entry === null) return null;

  // Clôture. Si le mouvement net est sous ±0,1 %, on pousse la trajectoire
  // elle-même jusqu'au minimum : le % affiché reste le mouvement réel à l'écran.
  const lastCandle = engine.candles[engine.candles.length - 1];
  const raw = (lastCandle.close - engine.entry) / engine.entry;
  if (Math.abs(raw) < MIN_RESULT_MOVE) {
    const direction =
      raw !== 0 ? Math.sign(raw) : Math.sign((engine.target ?? lastCandle.close) - engine.entry) || 1;
    lastCandle.close = Number((engine.entry * (1 + direction * MIN_RESULT_MOVE)).toFixed(5));
    lastCandle.high = Math.max(lastCandle.high, lastCandle.close);
    lastCandle.low = Math.min(lastCandle.low, lastCandle.close);
  }

  const move = (lastCandle.close - engine.entry) / engine.entry;
  const pct = (engine.side === "sell" ? -move : move) * 100;
  engine.phase = "result";
  engine.target = null;
  return Number(pct.toFixed(1));
}

export function HeroTradingDemo() {
  const engineRef = useRef<EngineState | null>(null);
  if (engineRef.current === null) engineRef.current = createEngine();

  const [candles, setCandles] = useState<Candle[]>(() =>
    engineRef.current!.candles.map((candle) => ({ ...candle })),
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [side, setSide] = useState<Side | null>(null);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [resultPct, setResultPct] = useState<number | null>(null);
  const [ctaRevealed, setCtaRevealed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Onglet en arrière-plan : tout est gelé, une position en cours attend
      // le retour de l'utilisateur (choix assumé : il ne rate jamais son résultat).
      if (document.hidden) return;

      const engine = engineRef.current!;
      const closedPct = stepEngine(engine);
      setCandles(engine.candles.map((candle) => ({ ...candle })));
      if (closedPct !== null) {
        setResultPct(closedPct);
        setPhase("result");
        setCtaRevealed(true);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  const openPosition = (chosen: Side) => {
    const engine = engineRef.current!;
    if (engine.phase === "holding") return;
    const current = engine.candles[engine.candles.length - 1].close;

    // Résultat tiré au sort (léger biais positif pour rester encourageant),
    // puis converti en prix cible que le graphique va viser pendant ~2,5 s.
    const willWin = Math.random() < 0.55;
    const magnitude = 0.004 + Math.random() * 0.014; // amplitude visée 0,4 % à 1,8 %
    const direction = (chosen === "buy") === willWin ? 1 : -1;

    engine.target = current * (1 + direction * magnitude);
    engine.entry = current;
    engine.side = chosen;
    engine.holdTicksLeft = HOLD_TICKS;
    engine.phase = "holding";

    setEntryPrice(current);
    setSide(chosen);
    setResultPct(null);
    setPhase("holding");
  };

  // --- Géométrie du graphique ---
  const width = 600;
  const height = 210;
  const prices = candles.flatMap((candle) => [candle.high, candle.low]);
  if (entryPrice !== null) prices.push(entryPrice);
  const rawMin = Math.min(...prices);
  const rawMax = Math.max(...prices);
  const pad = (rawMax - rawMin || 0.001) * 0.12;
  const min = rawMin - pad;
  const max = rawMax + pad;
  const y = (price: number) => height - ((price - min) / (max - min)) * height;
  const step = width / CANDLE_COUNT;
  const bodyWidth = step * 0.55;

  const lastCandle = candles[candles.length - 1];
  const lastUp = lastCandle.close >= lastCandle.open;
  const livePct =
    phase === "holding" && entryPrice !== null
      ? ((lastCandle.close - entryPrice) / entryPrice) * 100 * (side === "sell" ? -1 : 1)
      : null;

  const formatPct = (value: number) =>
    `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(1).replace(".", ",")} %`;

  const won = resultPct !== null && resultPct >= 0;

  return (
    <div
      data-testid="widget-trading-demo"
      className="w-full md:w-[65%] max-w-[640px] mx-auto rounded-2xl border border-white/10 bg-[#0b0e14]/90 backdrop-blur shadow-2xl shadow-black/50 text-left select-none"
    >
      {/* En-tête du widget */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          EUR/USD · Démo
        </div>
        <div
          data-testid="text-demo-price"
          className={`text-sm font-bold tabular-nums ${lastUp ? "text-green-400" : "text-red-400"}`}
        >
          {lastCandle.close.toFixed(4)}
        </div>
      </div>

      {/* Graphique en chandeliers */}
      <div className="px-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-[170px] md:h-[190px]"
          aria-hidden="true"
        >
          {entryPrice !== null && (phase === "holding" || phase === "result") && (
            <line
              x1="0"
              x2={width}
              y1={y(entryPrice)}
              y2={y(entryPrice)}
              stroke="#60a5fa"
              strokeWidth="1"
              strokeDasharray="5 4"
              opacity="0.7"
            />
          )}
          {candles.map((candle, index) => {
            const up = candle.close >= candle.open;
            const color = up ? GREEN : RED;
            const center = index * step + step / 2;
            const bodyTop = y(Math.max(candle.open, candle.close));
            const bodyHeight = Math.max(Math.abs(y(candle.open) - y(candle.close)), 1.5);
            return (
              <g key={index}>
                <line x1={center} x2={center} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="1.2" opacity="0.85" />
                <rect x={center - bodyWidth / 2} y={bodyTop} width={bodyWidth} height={bodyHeight} rx="1" fill={color} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bandeau d'état : position en cours (silencieux pour les lecteurs d'écran) ou résultat (annoncé) */}
      <div className="px-4 pt-1 min-h-[38px]">
        {phase === "holding" && livePct !== null && (
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold">
            <span className="text-muted-foreground">
              Position {side === "buy" ? "achat" : "vente"} ouverte…
            </span>
            <span className={`tabular-nums ${livePct >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatPct(livePct)}
            </span>
          </div>
        )}
        <div aria-live="polite">
          {phase === "result" && resultPct !== null && (
            <div
              data-testid="text-demo-result"
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold ${
                won ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}
            >
              {formatPct(resultPct)} · {won ? "Bien joué !" : "Pas cette fois"}
            </div>
          )}
        </div>
      </div>

      {/* Boutons Acheter / Vendre */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-2 pb-4">
        <button
          type="button"
          data-testid="button-demo-buy"
          onClick={() => openPosition("buy")}
          disabled={phase === "holding"}
          className="touch-manipulation min-h-[44px] rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition hover:bg-green-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          Acheter
        </button>
        <button
          type="button"
          data-testid="button-demo-sell"
          onClick={() => openPosition("sell")}
          disabled={phase === "holding"}
          className="touch-manipulation min-h-[44px] rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          Vendre
        </button>
      </div>

      {/* Invitation vers le vrai parcours, révélée après le premier essai */}
      {ctaRevealed && (
        <div className="border-t border-white/5 px-4 py-3 text-center text-xs md:text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-300">
          Ça, c'était juste un aperçu. Le vrai parcours t'apprend à lire ça avant de cliquer{" "}
          <Link
            href="/sign-up"
            data-testid="link-demo-signup"
            className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
          >
            Créer mon compte
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
