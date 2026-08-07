import { useGetProgress, useListBadges } from "@workspace/api-client-react";
import { User, Flame, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { data: progress, isLoading: progressLoading } = useGetProgress();
  const { data: badges, isLoading: badgesLoading } = useListBadges();

  if (progressLoading || badgesLoading || !progress || !badges) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header Profile */}
      <div className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-3xl">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4 relative">
          <User className="w-10 h-10 text-muted-foreground" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full border-4 border-card flex items-center justify-center text-primary-foreground font-bold text-xs">
            {progress.level}
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1">Trader Débutant</h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mt-2">
          {progress.premium ? "Membre Premium" : "Plan Gratuit"}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black">{progress.streak}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Jours de suite</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black">{progress.xp}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total XP</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Tes Badges
          </h2>
          <span className="text-sm font-medium text-muted-foreground">
            {badges.filter(b => b.earned).length} / {badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className={cn(
                "flex flex-col items-center text-center p-3 rounded-2xl border transition-all",
                badge.earned ? "border-primary bg-primary/5 opacity-100" : "border-border bg-secondary opacity-50 grayscale"
              )}
            >
              <div className="text-3xl mb-2">{badge.emoji}</div>
              <div className="text-[10px] font-bold uppercase leading-tight line-clamp-2">{badge.title}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
