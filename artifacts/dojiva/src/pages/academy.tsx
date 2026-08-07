import { Link } from "wouter";
import { useListWorlds, useGetProgress } from "@workspace/api-client-react";
import { Lock, Star, Play, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Academy() {
  const { data: worlds, isLoading } = useListWorlds();
  const { data: progress } = useGetProgress();

  if (isLoading || !worlds || !progress) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const completedIds = new Set(progress.completedLessonIds || []);

  return (
    <div className="pb-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Ton parcours</h1>
        <p className="text-muted-foreground">Continue ton apprentissage pour monter en niveau.</p>
      </div>

      <div className="space-y-12">
        {worlds.map((world, wIndex) => {
          const isWorldLocked = world.locked && !progress.premium;
          
          return (
            <div key={world.id} className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl">
                  {world.emoji}
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wide">Niveau {String(wIndex + 1).padStart(2, '0')}</h2>
                  <p className="text-muted-foreground">{world.title}</p>
                </div>
                {isWorldLocked && (
                  <div className="ml-auto p-2 bg-secondary rounded-full">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-4 pl-6 relative">
                {/* Connecting line */}
                <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-border -z-10" />

                {world.lessons.map((lesson, lIndex) => {
                  const isCompleted = completedIds.has(lesson.id);
                  const isLocked = (!lesson.free && !progress.premium) || (isWorldLocked);
                  const isNext = !isCompleted && !isLocked && (lIndex === 0 || completedIds.has(world.lessons[lIndex - 1].id));

                  return (
                    <Link 
                      key={lesson.id} 
                      href={isLocked ? "/academie" : `/lecon/${lesson.id}`}
                      className={cn(
                        "relative flex items-center p-4 rounded-2xl border-2 transition-all group",
                        isCompleted ? "border-success bg-success/5" :
                        isNext ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 hover:border-primary/80" :
                        isLocked ? "border-border bg-card/50 opacity-60 cursor-not-allowed" :
                        "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      {/* Node circle on the line */}
                      <div className={cn(
                        "absolute -left-[26px] w-4 h-4 rounded-full border-4 border-background",
                        isCompleted ? "bg-success" :
                        isNext ? "bg-primary" :
                        "bg-border"
                      )} />

                      <div className="flex-1">
                        <div className="font-semibold text-lg">{lesson.title}</div>
                        <div className="flex items-center gap-3 text-sm mt-1 text-muted-foreground">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {lesson.xpReward} XP</span>
                          {lesson.free && !progress.premium && <span className="text-primary text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10">GRATUIT</span>}
                        </div>
                      </div>

                      <div className="shrink-0 ml-4">
                        {isCompleted ? (
                          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          </div>
                        ) : isLocked ? (
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          </div>
                        ) : isNext ? (
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 ml-0.5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
