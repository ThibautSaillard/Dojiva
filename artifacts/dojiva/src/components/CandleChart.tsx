interface Candle { o: number, h: number, l: number, c: number }

export function CandleChart({ 
  candles, 
  futureCandles = [], 
  entry, 
  sl, 
  tp 
}: { 
  candles: Candle[], 
  futureCandles?: Candle[],
  entry?: number, 
  sl?: number, 
  tp?: number 
}) {
  const allCandles = [...candles, ...futureCandles];
  if (!allCandles.length) return null;

  const min = Math.min(...allCandles.map(c => c.l));
  const max = Math.max(...allCandles.map(c => c.h));
  const range = max - min || 1;
  const padding = 30;
  const height = 300;
  const width = 800;
  
  const scaleY = (val: number) => height - padding - ((val - min) / range) * (height - padding * 2);
  const candleWidth = (width - padding * 2) / Math.max(allCandles.length, 20);

  return (
    <div className="w-full overflow-x-auto bg-gray-50 rounded-3xl border-2 border-gray-200 p-4 relative">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="min-w-[600px]" preserveAspectRatio="none">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => (
          <line key={pct} x1="0" y1={padding + pct * (height - padding * 2)} x2={width} y2={padding + pct * (height - padding * 2)} stroke="#e5e5e5" strokeWidth="2" strokeDasharray="4 4" />
        ))}

        {entry && <line x1="0" y1={scaleY(entry)} x2={width} y2={scaleY(entry)} stroke="#1cb0f6" strokeWidth="3" strokeDasharray="6 6" />}
        {sl && <line x1="0" y1={scaleY(sl)} x2={width} y2={scaleY(sl)} stroke="#ea2b2b" strokeWidth="3" strokeDasharray="6 6" />}
        {tp && <line x1="0" y1={scaleY(tp)} x2={width} y2={scaleY(tp)} stroke="#58cc02" strokeWidth="3" strokeDasharray="6 6" />}

        {allCandles.map((d, i) => {
          const isFuture = i >= candles.length;
          const x = padding + i * candleWidth + candleWidth / 2;
          const isGreen = d.c >= d.o;
          const top = scaleY(Math.max(d.o, d.c));
          const bottom = scaleY(Math.min(d.o, d.c));
          const color = isGreen ? "#58cc02" : "#ff4b4b";
          const opacity = isFuture ? 0.6 : 1;

          return (
            <g key={i} opacity={opacity} className={isFuture ? "animate-in fade-in zoom-in duration-500" : ""}>
              <line x1={x} y1={scaleY(d.h)} x2={x} y2={scaleY(d.l)} stroke={color} strokeWidth="2" />
              <rect 
                x={x - candleWidth * 0.35} 
                y={top} 
                width={candleWidth * 0.7} 
                height={Math.max(bottom - top, 2)} 
                fill={color} 
                rx="2"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
