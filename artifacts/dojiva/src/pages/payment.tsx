import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Check, CreditCard, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "9 €",
    description: "Les fondamentaux pour vraiment comprendre les marchés.",
    features: ["Parcours débutant complet", "Exercices graphiques", "Progression et badges"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "19 €",
    description: "Apprends et pratique avec des outils pour progresser.",
    features: ["Tout Starter", "Simulateur 10 000 € virtuels", "Journal de trading"],
    popular: true,
  },
  {
    id: "master",
    name: "Master",
    price: "29 €",
    description: "L’expérience complète, de la première bougie au backtest.",
    features: ["Tout Pro", "Laboratoire de stratégies", "Coach IA personnalisé"],
  },
];

export default function Payment() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState("pro");

  return (
    <div className="min-h-[100dvh] bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/academie" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour au parcours
        </Link>

        <header className="mx-auto mt-10 max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">Ton parcours continue ici</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Choisis ton accès à Dojiva.</h1>
          <p className="mt-4 text-muted-foreground">
            Tu as posé les premières bases. Débloque la suite et continue à pratiquer sur de vrais graphiques — sans promesse de gains.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className={cn(
                "relative rounded-2xl border p-5 text-left transition-all",
                selected === plan.id
                  ? "border-primary bg-primary/10 shadow-xl shadow-primary/10"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Le plus choisi
                </span>
              )}
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <span className="text-2xl font-black">{plan.price}<small className="text-xs font-medium text-muted-foreground">/mois</small></span>
              </div>
              <p className="mt-3 min-h-12 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-5 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-md">
          <button
            type="button"
            onClick={() => setLocation(`/paiement/checkout?plan=${selected}`)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 transition hover:bg-primary/90"
          >
            <LockKeyhole className="h-5 w-5" /> Continuer vers le paiement
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Paiement sécurisé. L’abonnement pourra être annulé à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PaymentCheckout() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan") || "pro";

  return (
    <div className="min-h-[100dvh] bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link href="/paiement" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Modifier la formule
        </Link>
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Paiement</p>
          <h1 className="mt-3 text-3xl font-bold">Débloque ton parcours {plan === "starter" ? "Starter" : plan === "master" ? "Master" : "Pro"}.</h1>
          <p className="mt-3 text-muted-foreground">
            Le paiement sécurisé sera relié à l’abonnement choisi. Aucun accès premium n’est activé avant confirmation du paiement.
          </p>
          <div className="mt-8 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
            Le checkout est prêt côté interface. La connexion au prestataire de paiement est le prochain branchement à activer.
          </div>
          <Link href="/academie" className="mt-6 block w-full rounded-xl bg-secondary px-5 py-3 text-center font-bold hover:bg-secondary/80">
            Revenir à l’académie
          </Link>
        </div>
      </div>
    </div>
  );
}