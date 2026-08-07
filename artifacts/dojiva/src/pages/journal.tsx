import { Layout } from "@/components/Layout";
import { PremiumGate } from "@/components/PremiumGate";
import { useGetProgress, useGetJournal } from "@workspace/api-client-react";
import { Target, TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function Journal() {
  const { data: progress } = useGetProgress();
  const { data: journal } = useGetJournal();

  if (progress && !progress.premium) {
    return <Layout><PremiumGate /></Layout>;
  }

  const stats = journal?.stats;
  const entries = journal?.entries || [];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#3c3c3c] mb-6">Journal</h1>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Trades" value={stats.totalTrades} icon={<Activity className="w-5 h-5 text-[#1cb0f6]" />} />
            <StatCard label="Win Rate" value={`${Math.round(stats.winRate)}%`} icon={<Target className="w-5 h-5 text-[#ffc800]" />} />
            <StatCard label="Meilleur" value={stats.bestPnl ? `+${stats.bestPnl.toFixed(2)}€` : "-"} icon={<TrendingUp className="w-5 h-5 text-[#58cc02]" />} />
            <StatCard label="Pire" value={stats.worstPnl ? `${stats.worstPnl.toFixed(2)}€` : "-"} icon={<TrendingDown className="w-5 h-5 text-[#ff4b4b]" />} />
          </div>
        )}

        <div className="flex flex-col gap-4">
          {entries.map((e: any) => {
            const isWin = e.pnl > 0;
            const isLoss = e.pnl < 0;
            const color = isWin ? "text-[#58cc02]" : isLoss ? "text-[#ff4b4b]" : "text-gray-500";
            return (
              <div key={e.id} className="bg-white border-2 border-gray-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className={`font-black uppercase tracking-wider text-sm ${color}`}>
                       {e.outcome === 'take-profit' ? 'TP Touché' : e.outcome === 'stop-loss' ? 'SL Touché' : e.outcome}
                     </span>
                     <span className="text-gray-300 font-bold">•</span>
                     <span className="text-gray-500 font-bold text-sm">{e.market}</span>
                   </div>
                   <div className="text-[#3c3c3c] font-bold">
                     {e.direction === 'buy' ? 'Achat' : e.direction === 'sell' ? 'Vente' : 'Attente'}
                     {e.strategyName && <span className="text-gray-400 ml-2">({e.strategyName})</span>}
                   </div>
                 </div>
                 <div className={`text-xl font-black ${color}`}>
                   {e.pnl > 0 ? "+" : ""}{e.pnl.toFixed(2)}€
                 </div>
              </div>
            );
          })}
          {entries.length === 0 && (
             <div className="text-center py-12 text-gray-400 font-bold bg-gray-50 rounded-3xl border-2 border-gray-200 border-dashed">
               Aucun trade enregistré pour le moment.
             </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="mb-2 bg-gray-50 p-2 rounded-xl border border-gray-100">{icon}</div>
      <div className="text-2xl font-black text-[#3c3c3c] mb-1">{value}</div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}
