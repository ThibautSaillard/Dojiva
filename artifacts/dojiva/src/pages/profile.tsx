import { useState } from "react";
import { useLocation } from "wouter";
import { useGetProgress, useListBadges } from "@workspace/api-client-react";
import { User, Flame, Zap, Trophy, LogOut, LogIn, Loader2, CreditCard, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function Profile() {
  const { data: progress, isLoading: progressLoading } = useGetProgress();
  const { data: badges, isLoading: badgesLoading } = useListBadges();
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [signingOut, setSigningOut] = useState(false);
  const [cancellationRequested, setCancellationRequested] = useState(false);
  const [showCancellationConfirmation, setShowCancellationConfirmation] = useState(false);

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      setLocation("/");
    } finally {
      setSigningOut(false);
    }
  }

  if (progressLoading || badgesLoading || !progress || !badges) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Paramètres</h1>

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

      {/* Abonnement */}
      {progress.premium && (
        <div>
          <h2 className="text-xl font-bold mb-4">Abonnement</h2>
          <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Membre Premium</div>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Ton accès premium est actif. L’abonnement est sans engagement.
                </p>
              </div>
            </div>

            {cancellationRequested && (
              <div
                role="status"
                data-testid="text-cancellation-notice"
                className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-5 text-muted-foreground"
              >
                La résiliation sera activée dès que le paiement réel sera branché. Aucun abonnement n’a été modifié.
              </div>
            )}

            <button
              type="button"
              data-testid="button-cancel-subscription"
              onClick={() => setShowCancellationConfirmation(true)}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
            >
              <XCircle className="h-4 w-4" />
              Annuler mon abonnement
            </button>

            {showCancellationConfirmation && (
              <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="cancel-subscription-title"
                aria-describedby="cancel-subscription-description"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              >
                <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                  <h3 id="cancel-subscription-title" className="text-lg font-semibold">
                    Annuler ton abonnement ?
                  </h3>
                  <p id="cancel-subscription-description" className="mt-2 text-sm leading-6 text-muted-foreground">
                    L’abonnement est sans engagement et peut être résilié à tout moment. Le paiement réel n’est pas encore connecté : cette action ne modifiera donc pas ton accès aujourd’hui.
                  </p>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      data-testid="button-cancel-cancellation"
                      onClick={() => setShowCancellationConfirmation(false)}
                      className="min-h-11 rounded-xl border border-border px-4 py-3 text-sm font-bold hover:bg-secondary"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      data-testid="button-confirm-cancel-subscription"
                      onClick={() => {
                        setShowCancellationConfirmation(false);
                        setCancellationRequested(true);
                      }}
                      className="min-h-11 rounded-xl bg-destructive px-4 py-3 text-sm font-bold text-destructive-foreground hover:bg-destructive/90"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Compte */}
      <div>
        <h2 className="text-xl font-bold mb-4">Compte</h2>
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Connecté avec</div>
                  <div className="text-sm font-semibold truncate" data-testid="text-account-email">{user.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-destructive/30 text-destructive font-bold text-sm hover:bg-destructive/10 transition-colors disabled:opacity-60"
                data-testid="button-logout"
              >
                {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Tu n'es pas connecté. Crée un compte pour sauvegarder ta progression.
              </p>
              <button
                type="button"
                onClick={() => setLocation("/sign-in")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
                data-testid="button-go-login"
              >
                <LogIn className="w-4 h-4" />
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
