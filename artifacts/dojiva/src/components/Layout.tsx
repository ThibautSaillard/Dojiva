import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { useGetProgress } from "@workspace/api-client-react";
import { CandleMascot } from "@/components/CandleMascot";
import { Zap, Flame, User, BookOpen, Activity, FlaskConical, Bot, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: progress, isLoading } = useGetProgress();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (progress && !progress.onboarded && location !== "/apprendre") {
      setLocation("/apprendre");
    }
  }, [progress, location, setLocation]);

  if (isLoading || (progress && !progress.onboarded)) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-white">
        <CandleMascot size={150} mood="happy" animate={true} />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white font-sans">
      <TopBar progress={progress} />
      <main className="flex-1 max-w-2xl mx-auto w-full pb-32 pt-6 px-4">
        {children}
      </main>
      <BottomNav currentPath={location} />
    </div>
  );
}

function TopBar({ progress }: { progress: any }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-100 px-4 h-16 flex items-center justify-between shadow-sm">
      <Link href="/academie" className="flex items-center gap-2 text-primary font-black text-xl tracking-tighter cursor-pointer hover:opacity-80 transition-opacity outline-none">
        <CandleMascot size={24} animate={false} mood="bullish" />
        <span className="hidden sm:inline">dojiva</span>
      </Link>
      
      <div className="flex items-center gap-2 sm:gap-4 font-bold text-gray-400">
        <div className="flex items-center gap-1.5 text-orange-500 hover:bg-orange-50 px-2 py-1.5 rounded-xl transition-colors">
          <Flame className="w-5 h-5 fill-current" />
          <span>{progress?.streak || 0}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-[#ffc800] hover:bg-[#ffc800]/10 px-2 py-1.5 rounded-xl transition-colors">
          <Zap className="w-5 h-5 fill-current" />
          <span>{progress?.xp || 0}</span>
        </div>
        
        <Link href="/profil" className="flex items-center gap-1.5 text-[#1cb0f6] hover:bg-[#1cb0f6]/10 px-2 py-1.5 rounded-xl cursor-pointer transition-colors outline-none">
          <User className="w-5 h-5 fill-current" />
        </Link>
      </div>
    </header>
  );
}

function BottomNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 flex justify-around items-center h-20 px-2 sm:px-6 z-50 pb-safe">
      <NavItem href="/academie" icon={<BookOpen className="w-6 h-6" />} active={currentPath === "/academie"} />
      <NavItem href="/simulateur" icon={<Activity className="w-6 h-6" />} active={currentPath === "/simulateur"} />
      <NavItem href="/laboratoire" icon={<FlaskConical className="w-6 h-6" />} active={currentPath === "/laboratoire"} />
      <NavItem href="/coach" icon={<Bot className="w-6 h-6" />} active={currentPath === "/coach"} />
      <NavItem href="/journal" icon={<BookMarked className="w-6 h-6" />} active={currentPath === "/journal"} />
    </nav>
  );
}

function NavItem({ href, icon, active }: { href: string, icon: React.ReactNode, active: boolean }) {
  return (
    <Link href={href} className={cn(
      "p-3 rounded-2xl transition-all outline-none",
      active ? "bg-[#1cb0f6]/10 text-[#1cb0f6]" : "text-gray-400 hover:bg-gray-50"
    )}>
      <div className={cn("w-10 h-10 rounded-xl border-2 flex items-center justify-center", active ? "border-[#1cb0f6]" : "border-gray-200")}>
        {icon}
      </div>
    </Link>
  );
}
