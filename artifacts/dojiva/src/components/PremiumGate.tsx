import { Link } from "wouter";
import { ArrowRight, LockKeyhole } from "lucide-react";

export function PremiumGate() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-card p-7 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-primary">Premières bases validées</p>
        <h2 className="text-3xl font-bold tracking-tight">Tu veux continuer à apprendre ?</h2>
        <p className="mt-4 text-muted-foreground">
          Les cinq premières leçons sont terminées. Débloque la suite de ton parcours, les graphiques avancés et la pratique.
        </p>
        <Link
          href="/paiement"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
        >
          Voir les formules <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
