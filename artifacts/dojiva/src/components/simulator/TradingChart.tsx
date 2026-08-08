import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  HistogramSeries,
  createChart,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle, Direction, Drawing, Tool } from "@/features/simulator/types";

/**
 * Graphique de trading du simulateur.
 * - Chandeliers + volume, zoom/pan natifs (lightweight-charts)
 * - Outils de dessin : ligne horizontale, ligne de tendance, zone, mesure
 * - Lignes Entrée / Stop / Objectif déplaçables au doigt ou à la souris
 * Le futur n'est jamais rendu : seules les `revealedCount` premières bougies existent à l'écran.
 */

export type LineKind = "entry" | "stop" | "target";

export interface PriceLines {
  entry?: number | null;
  stop?: number | null;
  target?: number | null;
}

interface TradingChartProps {
  candles: Candle[];
  revealedCount: number;
  precision: number;
  tool: Tool;
  drawings: Drawing[];
  onDrawingsChange: (drawings: Drawing[]) => void;
  lines: PriceLines;
  editableLines: LineKind[];
  onLineChange: (kind: LineKind, price: number) => void;
  direction: Direction | null;
  className?: string;
}

const COLORS = {
  up: "#22c55e",
  down: "#ef4444",
  volUp: "rgba(34, 197, 94, 0.32)",
  volDown: "rgba(239, 68, 68, 0.30)",
  grid: "rgba(148, 163, 184, 0.07)",
  text: "#8b98ad",
  border: "rgba(148, 163, 184, 0.15)",
  entry: "#4f7cff",
  stop: "#ef4444",
  target: "#22c55e",
  drawing: "#8b5cf6",
  measure: "#eab308",
};

const LINE_LABELS: Record<LineKind, string> = {
  entry: "Entrée",
  stop: "Stop",
  target: "Objectif",
};

interface PendingPoint {
  time: number;
  price: number;
}

export function TradingChart({
  candles,
  revealedCount,
  precision,
  tool,
  drawings,
  onDrawingsChange,
  lines,
  editableLines,
  onLineChange,
  direction,
  className,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const priceLineRefs = useRef<Partial<Record<LineKind, IPriceLine>>>({});
  const [, setTick] = useState(0);
  const [ready, setReady] = useState(false);
  const [pendingTrend, setPendingTrend] = useState<PendingPoint | null>(null);
  const [pendingZone, setPendingZone] = useState<number | null>(null);
  const [hover, setHover] = useState<PendingPoint | null>(null);
  const [measure, setMeasure] = useState<{
    p1: PendingPoint;
    p2: PendingPoint;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const draggingRef = useRef<LineKind | null>(null);

  const minMove = useMemo(() => Number((10 ** -precision).toFixed(precision)), [precision]);
  const revealed = useMemo(
    () => candles.slice(0, Math.max(1, Math.min(revealedCount, candles.length))),
    [candles, revealedCount],
  );

  // — Création du graphique
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: COLORS.text,
        fontSize: 11,
        attributionLogo: false,
      },
      localization: { locale: "fr-FR" },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      rightPriceScale: {
        borderColor: COLORS.border,
        scaleMargins: { top: 0.06, bottom: 0.24 },
      },
      timeScale: {
        borderColor: COLORS.border,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
      },
      crosshair: {
        horzLine: { labelBackgroundColor: "#334155" },
        vertLine: { labelBackgroundColor: "#334155" },
      },
    });
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.up,
      downColor: COLORS.down,
      wickUpColor: COLORS.up,
      wickDownColor: COLORS.down,
      borderVisible: false,
      priceFormat: { type: "price", precision, minMove: 10 ** -precision },
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
      lastValueVisible: false,
      priceLineVisible: false,
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const redraw = () => setTick((t) => t + 1);
    chart.timeScale().subscribeVisibleLogicalRangeChange(redraw);
    const ro = new ResizeObserver(redraw);
    ro.observe(el);
    setReady(true);

    return () => {
      ro.disconnect();
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(redraw);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      priceLineRefs.current = {};
      setReady(false);
    };
  }, [precision]);

  // — Données révélées (jamais le futur)
  const prevRevealedRef = useRef(0);
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    const chart = chartRef.current;
    if (!candleSeries || !volumeSeries || !chart) return;
    candleSeries.setData(
      revealed.map((k) => ({
        time: k.t as UTCTimestamp,
        open: k.o,
        high: k.h,
        low: k.l,
        close: k.c,
      })),
    );
    volumeSeries.setData(
      revealed.map((k) => ({
        time: k.t as UTCTimestamp,
        value: k.v,
        color: k.c >= k.o ? COLORS.volUp : COLORS.volDown,
      })),
    );
    const prev = prevRevealedRef.current;
    if (prev === 0) {
      chart.timeScale().setVisibleLogicalRange({
        from: -1,
        to: revealed.length + 6,
      });
    } else if (revealed.length > prev) {
      chart.timeScale().scrollToRealTime();
    }
    prevRevealedRef.current = revealed.length;
    setTick((t) => t + 1);
  }, [revealed]);

  // — Lignes Entrée / Stop / Objectif (libellés d'axe natifs)
  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series || !ready) return;
    (Object.keys(LINE_LABELS) as LineKind[]).forEach((kind) => {
      const price = lines[kind];
      const existing = priceLineRefs.current[kind];
      if (price == null) {
        if (existing) {
          series.removePriceLine(existing);
          delete priceLineRefs.current[kind];
        }
        return;
      }
      if (existing) {
        existing.applyOptions({ price });
      } else {
        priceLineRefs.current[kind] = series.createPriceLine({
          price,
          color: COLORS[kind],
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: LINE_LABELS[kind],
        });
      }
    });
    setTick((t) => t + 1);
  }, [lines, ready]);

  // — Le graphique ne bouge pas pendant qu'on dessine
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const interactive = tool === "cursor";
    chart.applyOptions({
      handleScroll: interactive,
      handleScale: interactive,
    });
    if (tool !== "trendline") setPendingTrend(null);
    if (tool !== "zone") setPendingZone(null);
    if (tool !== "measure") setMeasure(null);
  }, [tool]);

  // — Suppression d'un tracé sélectionné
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        onDrawingsChange(drawings.filter((d) => d.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, drawings, onDrawingsChange]);

  // — Conversions coordonnées ↔ prix/temps
  const chart = chartRef.current;
  const series = candleSeriesRef.current;

  const priceToY = (price: number): number | null =>
    series?.priceToCoordinate(price) ?? null;
  const timeToX = (time: number): number | null =>
    chart?.timeScale().timeToCoordinate(time as UTCTimestamp) ?? null;
  const yToPrice = (y: number): number | null => {
    const p = series?.coordinateToPrice(y);
    return p == null ? null : Math.round(p / minMove) * minMove;
  };
  const xToTime = (x: number): number | null => {
    const logical = chart?.timeScale().coordinateToLogical(x);
    if (logical == null) return null;
    const idx = Math.max(0, Math.min(revealed.length - 1, Math.round(logical)));
    return revealed[idx]?.t ?? null;
  };

  const paneWidth = (() => {
    const el = containerRef.current;
    if (!el || !chart) return 0;
    try {
      return el.clientWidth - chart.priceScale("right").width();
    } catch {
      return el.clientWidth;
    }
  })();
  const paneHeight = (() => {
    const el = containerRef.current;
    if (!el || !chart) return 0;
    return el.clientHeight - chart.timeScale().height();
  })();

  const localPoint = (e: React.PointerEvent): { x: number; y: number } => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // — Interactions outils
  const toolActive = tool !== "cursor";

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!toolActive || !chart || !series) return;
    const { x, y } = localPoint(e);
    if (x > paneWidth || y > paneHeight) return;
    const price = yToPrice(y);
    const time = xToTime(x);
    if (price == null || time == null) return;
    e.preventDefault();

    if (tool === "hline") {
      onDrawingsChange([
        ...drawings,
        { id: `h${Date.now()}`, kind: "hline", price },
      ]);
      return;
    }
    if (tool === "trendline") {
      if (!pendingTrend) {
        setPendingTrend({ time, price });
      } else {
        onDrawingsChange([
          ...drawings,
          {
            id: `t${Date.now()}`,
            kind: "trendline",
            p1: pendingTrend,
            p2: { time, price },
          },
        ]);
        setPendingTrend(null);
      }
      return;
    }
    if (tool === "zone") {
      if (pendingZone == null) {
        setPendingZone(price);
      } else {
        onDrawingsChange([
          ...drawings,
          {
            id: `z${Date.now()}`,
            kind: "zone",
            priceTop: Math.max(pendingZone, price),
            priceBottom: Math.min(pendingZone, price),
          },
        ]);
        setPendingZone(null);
      }
      return;
    }
    if (tool === "measure") {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setMeasure({ p1: { time, price }, p2: { time, price } });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!toolActive || !chart || !series) return;
    const { x, y } = localPoint(e);
    const price = yToPrice(y);
    const time = xToTime(x);
    if (price == null || time == null) return;
    if (tool === "measure" && measure && e.buttons > 0) {
      setMeasure({ p1: measure.p1, p2: { time, price } });
      return;
    }
    if (tool === "trendline" || tool === "zone") {
      setHover({ time, price });
    }
  };

  const handlePointerUp = () => {
    if (tool === "measure") setMeasure(null);
  };

  // — Poignées Entrée / Stop / Objectif
  const startLineDrag = (kind: LineKind) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = kind;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const moveLineDrag = (e: React.PointerEvent) => {
    const kind = draggingRef.current;
    if (!kind) return;
    const { y } = localPoint(e);
    const price = yToPrice(Math.max(2, Math.min(paneHeight - 2, y)));
    if (price != null) onLineChange(kind, Number(price.toFixed(precision)));
  };
  const endLineDrag = () => {
    draggingRef.current = null;
  };

  // — Rendu des éléments d'overlay
  const fmt = (p: number) =>
    p.toLocaleString("fr-FR", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });

  const drawingElements = ready
    ? drawings.map((d) => {
        const selected = d.id === selectedId;
        const stroke = selected ? "#c4b5fd" : COLORS.drawing;
        if (d.kind === "hline") {
          const y = priceToY(d.price);
          if (y == null) return null;
          return (
            <g key={d.id}>
              <line
                x1={0}
                y1={y}
                x2={paneWidth}
                y2={y}
                stroke={stroke}
                strokeWidth={1}
                strokeDasharray="5 3"
              />
              <line
                x1={0}
                y1={y}
                x2={paneWidth}
                y2={y}
                stroke="transparent"
                strokeWidth={12}
                style={{ pointerEvents: tool === "cursor" ? "stroke" : "none", cursor: "pointer" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelectedId(selected ? null : d.id);
                }}
              />
              {selected && (
                <DeleteChip
                  x={Math.max(30, paneWidth - 26)}
                  y={y}
                  onDelete={() => {
                    onDrawingsChange(drawings.filter((x) => x.id !== d.id));
                    setSelectedId(null);
                  }}
                />
              )}
            </g>
          );
        }
        if (d.kind === "trendline") {
          const x1 = timeToX(d.p1.time);
          const y1 = priceToY(d.p1.price);
          const x2 = timeToX(d.p2.time);
          const y2 = priceToY(d.p2.price);
          if (x1 == null || y1 == null || x2 == null || y2 == null) return null;
          return (
            <g key={d.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={1.5} />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={12}
                style={{ pointerEvents: tool === "cursor" ? "stroke" : "none", cursor: "pointer" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelectedId(selected ? null : d.id);
                }}
              />
              {selected && (
                <DeleteChip
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2}
                  onDelete={() => {
                    onDrawingsChange(drawings.filter((x) => x.id !== d.id));
                    setSelectedId(null);
                  }}
                />
              )}
            </g>
          );
        }
        const yTop = priceToY(d.priceTop);
        const yBottom = priceToY(d.priceBottom);
        if (yTop == null || yBottom == null) return null;
        return (
          <g key={d.id}>
            <rect
              x={0}
              y={Math.min(yTop, yBottom)}
              width={paneWidth}
              height={Math.abs(yBottom - yTop)}
              fill="rgba(139, 92, 246, 0.10)"
              stroke={stroke}
              strokeWidth={selected ? 1.5 : 1}
              strokeDasharray="4 3"
              style={{ pointerEvents: tool === "cursor" ? "all" : "none", cursor: "pointer" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelectedId(selected ? null : d.id);
              }}
            />
            {selected && (
              <DeleteChip
                x={Math.max(30, paneWidth - 26)}
                y={Math.min(yTop, yBottom) + 10}
                onDelete={() => {
                  onDrawingsChange(drawings.filter((x) => x.id !== d.id));
                  setSelectedId(null);
                }}
              />
            )}
          </g>
        );
      })
    : null;

  // — Zones risque/gain entre les lignes
  const zoneRects: React.ReactNode[] = [];
  if (ready && direction && lines.entry != null) {
    const yEntry = priceToY(lines.entry);
    if (yEntry != null) {
      if (lines.stop != null) {
        const yStop = priceToY(lines.stop);
        if (yStop != null) {
          zoneRects.push(
            <rect
              key="risk"
              x={0}
              y={Math.min(yEntry, yStop)}
              width={paneWidth}
              height={Math.abs(yStop - yEntry)}
              fill="rgba(239, 68, 68, 0.07)"
            />,
          );
        }
      }
      if (lines.target != null) {
        const yTarget = priceToY(lines.target);
        if (yTarget != null) {
          zoneRects.push(
            <rect
              key="reward"
              x={0}
              y={Math.min(yEntry, yTarget)}
              width={paneWidth}
              height={Math.abs(yTarget - yEntry)}
              fill="rgba(34, 197, 94, 0.07)"
            />,
          );
        }
      }
    }
  }

  // — Aperçus pendant le dessin
  const previews: React.ReactNode[] = [];
  if (ready && pendingTrend && hover && tool === "trendline") {
    const x1 = timeToX(pendingTrend.time);
    const y1 = priceToY(pendingTrend.price);
    const x2 = timeToX(hover.time);
    const y2 = priceToY(hover.price);
    if (x1 != null && y1 != null && x2 != null && y2 != null) {
      previews.push(
        <line
          key="pt"
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={COLORS.drawing}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.7}
        />,
      );
    }
  }
  if (ready && pendingZone != null && hover && tool === "zone") {
    const y1 = priceToY(pendingZone);
    const y2 = priceToY(hover.price);
    if (y1 != null && y2 != null) {
      previews.push(
        <rect
          key="pz"
          x={0}
          y={Math.min(y1, y2)}
          width={paneWidth}
          height={Math.abs(y2 - y1)}
          fill="rgba(139, 92, 246, 0.08)"
          stroke={COLORS.drawing}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.8}
        />,
      );
    }
  }
  if (ready && measure) {
    const x1 = timeToX(measure.p1.time);
    const y1 = priceToY(measure.p1.price);
    const x2 = timeToX(measure.p2.time);
    const y2 = priceToY(measure.p2.price);
    if (x1 != null && y1 != null && x2 != null && y2 != null) {
      const dPrice = measure.p2.price - measure.p1.price;
      const dPct = (dPrice / measure.p1.price) * 100;
      const up = dPrice >= 0;
      previews.push(
        <g key="measure">
          <rect
            x={Math.min(x1, x2)}
            y={Math.min(y1, y2)}
            width={Math.abs(x2 - x1)}
            height={Math.abs(y2 - y1)}
            fill={up ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)"}
            stroke={COLORS.measure}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <g transform={`translate(${Math.min(x1, x2)}, ${Math.min(y1, y2) - 24})`}>
            <rect width={150} height={20} rx={4} fill="#1e293b" opacity={0.95} />
            <text x={8} y={14} fill="#e2e8f0" fontSize={11} fontFamily="inherit">
              {`${up ? "+" : ""}${fmt(dPrice)} (${dPct.toFixed(2)} %)`}
            </text>
          </g>
        </g>,
      );
    }
  }

  // — Poignées des lignes de plan
  const handles = ready
    ? editableLines
        .filter((kind) => lines[kind] != null)
        .map((kind) => {
          const y = priceToY(lines[kind]!);
          if (y == null) return null;
          return (
            <g
              key={kind}
              transform={`translate(8, ${y - 12})`}
              style={{ pointerEvents: "all", cursor: "ns-resize", touchAction: "none" }}
              onPointerDown={startLineDrag(kind)}
              onPointerMove={moveLineDrag}
              onPointerUp={endLineDrag}
              onPointerCancel={endLineDrag}
              data-testid={`handle-${kind}`}
            >
              <rect
                width={86}
                height={24}
                rx={6}
                fill="#0f172a"
                stroke={COLORS[kind]}
                strokeWidth={1.2}
              />
              <g transform="translate(8, 8)" fill={COLORS[kind]}>
                <circle cx={2} cy={1} r={1.4} />
                <circle cx={8} cy={1} r={1.4} />
                <circle cx={2} cy={7} r={1.4} />
                <circle cx={8} cy={7} r={1.4} />
              </g>
              <text x={24} y={16} fill="#e2e8f0" fontSize={11} fontFamily="inherit">
                {LINE_LABELS[kind]}
              </text>
            </g>
          );
        })
    : null;

  return (
    <div className={`relative ${className ?? ""}`} data-testid="trading-chart">
      <div ref={containerRef} className="absolute inset-0" />
      <svg
        className="absolute inset-0 h-full w-full"
        style={{
          pointerEvents: toolActive ? "all" : "none",
          touchAction: toolActive ? "none" : "auto",
          cursor: toolActive ? "crosshair" : "default",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        data-testid="chart-overlay"
      >
        {zoneRects}
        {drawingElements}
        {previews}
        {handles}
      </svg>
    </div>
  );
}

function DeleteChip({
  x,
  y,
  onDelete,
}: {
  x: number;
  y: number;
  onDelete: () => void;
}) {
  return (
    <g
      transform={`translate(${x - 10}, ${y - 10})`}
      style={{ pointerEvents: "all", cursor: "pointer" }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      data-testid="drawing-delete"
    >
      <circle cx={10} cy={10} r={9} fill="#334155" />
      <path
        d="M6.5 6.5 L13.5 13.5 M13.5 6.5 L6.5 13.5"
        stroke="#f1f5f9"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </g>
  );
}
