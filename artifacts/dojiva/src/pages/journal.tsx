import { useGetJournal, useGetProgress } from "@workspace/api-client-react";
import { PremiumGate } from "@/components/PremiumGate";
import { BookMarked, TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Journal() {
  const { data: progress } = useGetProgress();
  const { data: journal, isLoading } = useGetJournal();

  if (progress && !progress.premium) {
    return <PremiumGate />;
  }

  if (isLoading || !journal) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Ton Journal</h1>
        <p className="text-muted-foreground">La clé de la progression est l'analyse de tes erreurs.</p>
      </header>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Win Rate" value={`${journal.stats.winRate.toFixed(1)}%`} icon={<Target className="w-4 h-4 text-primary" />} />
        <StatCard label="Trades" value={journal.stats.totalTrades.toString()} icon={<BookMarked className="w-4 h-4 text-primary" />} />
        <StatCard label="P&L" value={`${journal.stats.balance > 10000 ? '+' : ''}${(journal.stats.balance - 10000).toFixed(2)}€`} valueClass={journal.stats.balance >= 10000 ? "text-success" : "text-destructive"} icon={journal.stats.balance >= 10000 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />} />
        <StatCard label="R Moyen" value={journal.stats.avgRiskReward ? journal.stats.avgRiskReward.toFixed(2) : "-"} icon={<AlertCircle className="w-4 h-4 text-primary" />} />
      </div>

      {/* Trade History */}
      <div>
        <h2 className="text-xl font-bold mb-4">Historique des trades</h2>
        {journal.entries.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-2xl text-muted-foreground">
            Aucun trade enregistré. Va sur le simulateur pour commencer.
          </div>
        ) : (
          <div className="space-y-3">
            {journal.entries.map((entry) => {
              const isWin = entry.pnl > 0;
              return (
                <div key={entry.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between group hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isWin ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {isWin ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {entry.market} <span className="text-muted-foreground text-xs uppercase bg-secondary px-1.5 py-0.5 rounded">{entry.direction}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("font-bold font-mono", isWin ? "text-success" : "text-destructive")}>
                      {isWin ? '+' : ''}{entry.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    {entry.riskReward && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        R: {entry.riskReward.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, valueClass }: { label: string, value: string, icon: React.ReactNode, valueClass?: string }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
        {icon}
        {label}
      </div>
      <div className={cn("text-2xl font-black tracking-tight", valueClass || "text-foreground")}>
        {value}
      </div>
    </div>
  );
}
