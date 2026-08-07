import { Link, useLocation } from "wouter";
import { useGetProgress, useListWorlds } from "@workspace/api-client-react";
import { CandleMascot } from "@/components/CandleMascot";
import { motion } from "framer-motion";
import { Heart, Flame, Zap, Lock, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Academy() {
  const { data: progress, isLoading: loadingProgress } = useGetProgress();
  const { data: worlds, isLoading: loadingWorlds } = useListWorlds();
  const [, setLocation] = useLocation();

  if (loadingProgress || loadingWorlds) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <CandleMascot size={150} mood="happy" animate={true} />
      </div>
    );
  }

  // Redirect to onboarding if not onboarded
  if (progress && !progress.onboarded) {
    setLocation("/apprendre");
    return null;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white font-sans">
      <TopBar progress={progress} />
      
      <main className="flex-1 max-w-2xl mx-auto w-full pb-32">
        {worlds?.map((world, worldIndex) => (
          <WorldSection 
            key={world.id} 
            world={world} 
            isFirst={worldIndex === 0}
            progress={progress}
          />
        ))}
      </main>
      
      <BottomNav />
    </div>
  );
}

function TopBar({ progress }: { progress: any }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-100 px-4 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 text-primary font-black text-xl tracking-tighter">
        <CandleMascot size={24} animate={false} mood="bullish" />
        <span className="hidden sm:inline">dojiva</span>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6 font-bold text-gray-400">
        <div className="flex items-center gap-1.5 hover:bg-gray-50 px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
          <img src="https://img.icons8.com/color/48/000000/france-circular.png" alt="FR" className="w-6 h-6" />
        </div>
        
        <div className="flex items-center gap-1.5 text-orange-500 hover:bg-orange-50 px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
          <Flame className="w-5 h-5 fill-current" />
          <span>{progress?.streak || 0}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-[#ffc800] hover:bg-[#ffc800]/10 px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
          <Zap className="w-5 h-5 fill-current" />
          <span>{progress?.xp || 0}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
          <Heart className="w-5 h-5 fill-current" />
          <span>{progress?.hearts || 5}</span>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 flex justify-around items-center h-20 px-2 sm:px-6 z-50 pb-safe">
      <NavItem icon={<div className="w-8 h-8 rounded-xl border-2 border-[#1cb0f6] bg-[#1cb0f6]/10 flex items-center justify-center"><Star className="w-5 h-5 text-[#1cb0f6]" /></div>} active />
      <NavItem icon={<div className="w-8 h-8 rounded-xl border-2 border-gray-200 flex items-center justify-center"><Flame className="w-5 h-5 text-gray-400" /></div>} />
      <NavItem icon={<div className="w-8 h-8 rounded-xl border-2 border-gray-200 flex items-center justify-center"><div className="w-5 h-5 bg-gray-400 rounded-full" /></div>} />
    </nav>
  );
}

function NavItem({ icon, active }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <button className={cn("p-4 rounded-2xl transition-all", active ? "bg-[#1cb0f6]/10" : "hover:bg-gray-50")}>
      {icon}
    </button>
  );
}

function WorldSection({ world, isFirst, progress }: { world: any, isFirst: boolean, progress: any }) {
  const isLocked = world.locked;
  
  return (
    <div className="mb-8">
      {/* World Header */}
      <div className={cn(
        "px-4 py-6 text-white relative overflow-hidden",
        isLocked ? "bg-gray-300" : "bg-primary"
      )}>
        <div className="relative z-10 flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <div className="text-white/80 font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-1">
              Unité {world.order} {world.emoji}
            </div>
            <h2 className="text-2xl font-black">{world.title}</h2>
            <p className="font-bold text-white/90">{world.subtitle}</p>
          </div>
          <button className={cn(
            "h-10 px-4 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center gap-1 border-b-4",
            isLocked ? "bg-gray-200 text-gray-400 border-gray-300" : "bg-white text-primary border-white/20"
          )}>
            <Star className={cn("w-4 h-4", isLocked ? "text-gray-400" : "text-primary")} /> Guide
          </button>
        </div>
      </div>

      {/* Path */}
      <div className={cn("py-12 relative", isLocked ? "opacity-60 pointer-events-none grayscale" : "")}>
        {/* Mascot decoration */}
        {!isLocked && (
          <div className="absolute right-4 md:right-20 top-1/3 hidden sm:block">
            <CandleMascot size={120} mood="happy" animate={true} />
          </div>
        )}

        <div className="flex flex-col items-center gap-4 relative">
          {world.lessons.map((lesson: any, i: number) => {
            const isCompleted = progress?.completedLessonIds?.includes(lesson.id);
            const isNext = !isCompleted && (!progress?.completedLessonIds || progress?.completedLessonIds.length === lesson.id - 1);
            const isLessonLocked = !isCompleted && !isNext && lesson.id > 1;

            // Calculate x offset for sine wave pattern
            const xOffset = Math.sin(i * 0.8) * 60;
            
            return (
              <LessonBubble 
                key={lesson.id} 
                lesson={lesson}
                isCompleted={isCompleted}
                isNext={isNext}
                isLocked={isLessonLocked || isLocked}
                xOffset={xOffset}
              />
            );
          })}
        </div>
        
        {isLocked && (
           <div className="absolute inset-0 flex items-center justify-center flex-col mt-20">
             <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6 max-w-sm text-center">
                <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-[#3c3c3c] mb-2">Section verrouillée</h3>
                <p className="text-gray-500 font-medium mb-4">Termine les leçons précédentes pour débloquer cette section.</p>
                <button className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl uppercase tracking-wider text-sm border-b-4 border-gray-200">
                  Sauter ici ?
                </button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}

function LessonBubble({ lesson, isCompleted, isNext, isLocked, xOffset }: any) {
  const [, setLocation] = useLocation();
  let bubbleColor = "bg-primary border-[#46a302]";
  let iconColor = "text-white";
  
  if (isCompleted) {
    bubbleColor = "bg-[#ffc800] border-[#e5b400]";
  } else if (isLocked) {
    bubbleColor = "bg-gray-200 border-gray-300";
    iconColor = "text-gray-400";
  }

  const Bubble = (
    <div 
      className={cn(
        "relative w-[70px] h-[70px] rounded-full flex items-center justify-center border-b-[6px]",
        bubbleColor
      )}
    >
      {isCompleted ? (
        <Star className={cn("w-8 h-8 fill-current", iconColor)} />
      ) : isLocked ? (
        <Lock className={cn("w-8 h-8", iconColor)} />
      ) : (
        <Star className={cn("w-8 h-8", iconColor)} /> // use appropriate icon based on lesson.icon
      )}

      {/* Floating Crown/Tooltip if it's the current next lesson */}
      {isNext && (
        <motion.div 
          className="absolute -top-14 bg-white border-2 border-gray-200 rounded-xl px-4 py-2 font-bold text-primary shadow-sm uppercase tracking-wider text-sm whitespace-nowrap"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          COMMENCER
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-gray-200 rotate-45" />
        </motion.div>
      )}

      {/* Pulse ring if next */}
      {isNext && (
         <div className="absolute inset-0 rounded-full border-4 border-primary/30 -z-10 animate-ping" />
      )}
    </div>
  );

  return (
    <motion.div 
      style={{ x: xOffset }} 
      className={cn("relative", (isCompleted || isNext) ? "cursor-pointer" : "cursor-default")}
      whileHover={(isCompleted || isNext) ? { scale: 1.05 } : {}}
      whileTap={(isCompleted || isNext) ? { scale: 0.95 } : {}}
      onClick={() => !isLocked && setLocation(`/lecon/${lesson.id}`)}
    >
       {isLocked ? (
         <div className="opacity-80 pointer-events-none">{Bubble}</div>
       ) : (
         <div>{Bubble}</div>
       )}
    </motion.div>
  );
}
