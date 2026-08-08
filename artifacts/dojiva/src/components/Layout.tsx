import { useLocation, Link } from "wouter";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useGetProgress } from "@workspace/api-client-react";
import {
  Flame,
  Trophy,
  Menu,
  X,
  BookOpen,
  FlaskConical,
  Activity,
  Settings,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { PublicFooter } from "@/pages/legal";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: progress, isLoading } = useGetProgress();
  const [location, setLocation] = useLocation();

  const isPublicPage =
    location === "/" ||
    location === "/apprendre" ||
    location === "/inscription" ||
    location.startsWith("/sign-in") ||
    location.startsWith("/sign-up") ||
    location.startsWith("/paiement") ||
    location.startsWith("/legal");

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
        <TopBar showStats={false} progress={progress} />
        <main className="flex-1 w-full mx-auto max-w-5xl">
          {children}
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans text-foreground">
      <TopBar showStats progress={progress} />
      <main className="flex-1 max-w-2xl mx-auto w-full pb-16 pt-6 px-4">
        {children}
      </main>
    </div>
  );
}

const menuItems = [
  { label: "Académie", href: "/academie", icon: BookOpen, testid: "link-menu-academie", isActive: (path: string) => path.startsWith("/academie") || path.startsWith("/lecon") },
  { label: "Lab", href: "/laboratoire", icon: FlaskConical, testid: "link-menu-lab", isActive: (path: string) => path.startsWith("/laboratoire") },
  { label: "Simulateur", href: "/simulateur", icon: Activity, testid: "link-menu-simulateur", isActive: (path: string) => path.startsWith("/simulateur") },
  { label: "Paramètres", href: "/profil", icon: Settings, testid: "link-menu-parametres", isActive: (path: string) => path.startsWith("/profil") },
  { label: "Tarifs", href: "/paiement", icon: CreditCard, testid: "link-menu-tarifs", isActive: (path: string) => path.startsWith("/paiement") },
];

function DojivaLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-bold tracking-tight", className)}>
      <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <span>Dojiva</span>
    </div>
  );
}

function TopBar({ showStats, progress }: { showStats: boolean; progress: any }) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Fermeture systématique à chaque changement de route (clics menu, bouton retour…).
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Échap pour fermer, piège du focus (Tab reste dans le tiroir) et blocage
  // du scroll de fond tant que le tiroir est ouvert. À la fermeture — quelle
  // qu'en soit la cause — le focus revient sur le bouton hamburger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (active instanceof HTMLElement && !panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  function navigate(href: string) {
    setOpen(false);
    setLocation(href);
  }

  function goFaq() {
    setOpen(false);
    if (location === "/") {
      document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
    } else {
      setLocation("/#faq");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-4 h-16 flex items-center justify-between gap-3">
      <Link
        href={user ? "/academie" : "/"}
        className="text-xl text-foreground cursor-pointer hover:opacity-80 transition-opacity outline-none"
        data-testid="link-logo"
      >
        <DojivaLogo />
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {showStats && (
          <div className="flex items-center gap-2 font-semibold text-sm">
            <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md">
              <Flame className="w-4 h-4" />
              <span>{progress?.streak || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-1 rounded-md">
              <Trophy className="w-4 h-4" />
              <span>{progress?.xp || 0} XP</span>
            </div>
          </div>
        )}

        {!showStats && !user && (
          <Link
            href="/sign-in"
            className="text-sm font-semibold bg-secondary px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
            data-testid="link-login"
          >
            Connexion
          </Link>
        )}

        <button
          type="button"
          ref={triggerRef}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="p-2 -mr-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
          data-testid="button-menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {createPortal(
        // Rendu conditionnel SANS animation de sortie : dès que `open` passe à
        // false, React retire le nœud du DOM de façon synchrone. Une animation
        // de sortie interrompue par la navigation laissait un panneau orphelin
        // figé à l'écran — plus possible ici. Seule l'entrée est animée (CSS pur).
        open ? (
            <>
              <div
                className="fixed inset-0 z-[60] bg-black/60 animate-in fade-in-0 duration-200"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <div
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navigation"
                className="fixed inset-y-0 left-0 z-[70] w-[300px] max-w-[85vw] bg-background border-r border-border flex flex-col outline-none animate-in slide-in-from-left duration-300"
                data-testid="drawer-menu"
              >
                <div className="px-5 h-16 flex items-center justify-between border-b border-border text-xl shrink-0">
                  <DojivaLogo />
                  <button
                    type="button"
                    aria-label="Fermer le menu"
                    onClick={() => setOpen(false)}
                    className="p-2 -mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    data-testid="button-close-menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                  {menuItems.map((item) => {
                    const active = item.isActive(location);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => navigate(item.href)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-semibold transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                        )}
                        data-testid={item.testid}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={goFaq}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    data-testid="button-menu-faq"
                  >
                    <HelpCircle className="w-5 h-5 shrink-0" />
                    FAQ
                  </button>
                </nav>
                {!user && (
                  <div className="p-4 border-t border-border shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate("/sign-in")}
                      className="w-full bg-primary text-primary-foreground font-bold text-sm px-4 py-3 rounded-xl hover:bg-primary/90 transition-colors"
                      data-testid="button-menu-login"
                    >
                      Connexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : null,
        document.body,
      )}
    </header>
  );
}
