import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { useGetProgress } from "@workspace/api-client-react";
import { Flame, User, BookOpen, Activity, FlaskConical, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: progress, isLoading } = useGetProgress();
  const [location, setLocation] = useLocation();

  const isPublicPage = location === "/" || location === "/apprendre";

  useEffect(() => {
    if (progress && !progress.onboarded && !isPublicPage) {
      setLocation("/apprendre");
    }
  }, [progress, location, setLocation, isPublicPage]);

  if (isLoading && !isPublicPage) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (isPublicPage) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background font-sans text-foreground">
        <main className="flex-1 w-full mx-auto max-w-5xl">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans text-foreground">
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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-4 h-16 flex items-center justify-between">
      <Link href="/academie" className="flex items-center gap-2 text-foreground font-bold text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity outline-none">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <span>Dojiva</span>
      </Link>
      
      <div className="flex items-center gap-4 font-semibold text-sm">
        <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md">
          <Flame className="w-4 h-4" />
          <span>{progress?.streak || 0}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-1 rounded-md">
          <Trophy className="w-4 h-4" />
          <span>{progress?.xp || 0} XP</span>
        </div>
      </div>
    </header>
  );
}

function BottomNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border flex justify-around items-center h-20 px-2 sm:px-6 z-50 pb-safe">
      <NavItem label="Académie" href="/academie" icon={<BookOpen className="w-5 h-5" />} active={currentPath.startsWith("/academie") || currentPath.startsWith("/lecon")} />
      <NavItem label="Lab" href="/laboratoire" icon={<FlaskConical className="w-5 h-5" />} active={currentPath.startsWith("/laboratoire")} />
      <NavItem label="Simulateur" href="/simulateur" icon={<Activity className="w-5 h-5" />} active={currentPath.startsWith("/simulateur")} />
      <NavItem label="Profil" href="/profil" icon={<User className="w-5 h-5" />} active={currentPath.startsWith("/profil")} />
    </nav>
  );
}

function NavItem({ href, icon, active, label }: { href: string, icon: React.ReactNode, active: boolean, label: string }) {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center gap-1 p-2 rounded-xl transition-all outline-none min-w-[64px]",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    )}>
      <div className={cn(
        "p-1.5 rounded-lg transition-colors",
        active ? "bg-primary/10" : ""
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
