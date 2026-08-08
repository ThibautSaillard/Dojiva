import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "monthly" | "yearly";

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthly: "19,90 €",
    yearly: "199 €",
    yearlyPerMonth: "16,58 €",
    description: "L’académie complète pour apprendre les bases, leçon par leçon.",
    included: [
      "Académie complète (tous les modules)",
      "Exercices sur graphiques réels",
      "Progression, XP et badges",
    ],
    excluded: ["Simulateur de trading", "Création de stratégies", "Coach IA"],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: "29,90 €",
    yearly: "299 €",
    yearlyPerMonth: "24,92 €",
    description: "Apprends, puis entraîne-toi sur de vrais graphiques.",
    included: [
      "Toute l’académie",
      "Simulateur : missions guidées",
      "Mode libre — 10 000 € virtuels",
      "Journal de trading",
    ],
    excluded: ["Création de stratégies", "Coach IA"],
    popular: true,
  },
  {
    id: "master",
    name: "Master",
    monthly: "39,90 €",
    yearly: "399 €",
    yearlyPerMonth: "33,25 €",
    description: "Toutes les fonctionnalités Dojiva, en illimité.",
    included: [
      "Académie en illimité",
      "Simulation en illimité",
      "Création de stratégies illimitée",
      "Coach IA personnalisé",
    ],
    excluded: [],
  },
];

const comparisonSections = [
  {
    title: "Apprendre",
    rows: [
      { label: "Parcours débutant complet", tiers: [true, true, true] },
      { label: "Exercices sur graphiques", tiers: [true, true, true] },
      { label: "Progression, XP et badges", tiers: [true, true, true] },
    ],
  },
  {
    title: "Pratiquer",
    rows: [
      { label: "Missions guidées du simulateur", tiers: [false, true, true] },
      { label: "Mode libre — 10 000 € virtuels", tiers: [false, true, true] },
      { label: "Journal de trading", tiers: [false, true, true] },
    ],
  },
  {
    title: "Aller plus loin",
    rows: [
      { label: "Création de stratégies", tiers: [false, false, true] },
      { label: "Backtest de stratégies", tiers: [false, false, true] },
      { label: "Coach IA personnalisé", tiers: [false, false, true] },
      { label: "Tout en illimité", tiers: [false, false, true] },
    ],
  },
];

const pricingFaqs = [
  {
    question: "Comment fonctionne le satisfait ou remboursé ?",
    answer:
      "Si Dojiva ne te convient pas, tu es remboursé immédiatement, sur simple demande et sans justification.",
  },
  {
    question: "Y a-t-il un engagement ?",
    answer:
      "Aucun. Tu peux résilier à tout moment depuis tes paramètres. Ton accès reste actif jusqu’à la fin de la période déjà payée.",
  },
  {
    question: "Que gagne-t-on avec l’abonnement annuel ?",
    answer:
      "L’équivalent de 2 mois offerts. Par exemple, Starter revient à 199 € par an au lieu de 238,80 € en payant chaque mois.",
  },
  {
    question: "Puis-je changer de formule plus tard ?",
    answer:
      "Oui, à tout moment. Tu peux passer à une formule supérieure ou inférieure, le changement s’applique à la période suivante.",
  },
  {
    question: "L’argent du simulateur est-il réel ?",
    answer:
      "Non. Le simulateur et les exercices utilisent uniquement de l’argent virtuel : tu pratiques sans risquer d’argent réel, et aucun gain n’est promis.",
  },
];

function Guarantees() {
  return (
    <div className="mt-5 space-y-1.5 rounded-xl bg-success/10 p-3.5 text-xs leading-5">
      <p className="font-bold text-success">Satisfait ou remboursé immédiatement</p>
      <p className="text-muted-foreground">
        <strong className="font-bold text-foreground">Sans engagement</strong> — résiliable à tout
        moment dans tes paramètres.
      </p>
    </div>
  );
}

export default function Payment() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState<Period>("monthly");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const yearly = period === "yearly";

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/academie"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au parcours
        </Link>

        <header className="mx-auto mt-10 max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold text-primary">
            Tarifs
          </span>
          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Choisis ton plan.
            <span className="block">
              Progresse <span className="text-primary">dès aujourd’hui.</span>
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Sans engagement. Tu peux résilier à tout moment depuis tes paramètres.
          </p>

          <div className="mt-8 inline-flex rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-bold transition-colors",
                !yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              data-testid="button-period-monthly"
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setPeriod("yearly")}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-bold transition-colors",
                yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              data-testid="button-period-yearly"
            >
              Annuel
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Économise <span className="font-bold text-primary">2 mois</span> avec l’annuel
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6",
                plan.popular
                  ? "border-primary bg-gradient-to-b from-primary/15 to-card shadow-xl shadow-primary/15"
                  : "border-border bg-card",
              )}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Le plus choisi
                </span>
              )}
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-2 min-h-10 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-5" data-testid={`text-price-${plan.id}`}>
                <span className="text-4xl font-black tracking-tight">
                  {yearly ? plan.yearly : plan.monthly}
                </span>
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  {yearly ? "/an" : "/mois"}
                </span>
                {yearly && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    soit {plan.yearlyPerMonth}/mois
                  </p>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.included.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.excluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-muted-foreground/60">
                    <X className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-through">{feature}</span>
                  </li>
                ))}
              </ul>

              <Guarantees />

              <button
                type="button"
                onClick={() => setLocation(`/paiement/checkout?plan=${plan.id}&period=${period}`)}
                className={cn(
                  "mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold transition-colors",
                  plan.popular
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                    : "border border-primary/40 text-foreground hover:bg-primary/10",
                )}
                data-testid={`button-choose-${plan.id}`}
              >
                Choisir ce plan <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        <section className="mt-20 sm:mt-24" aria-labelledby="compare-title">
          <h2 id="compare-title" className="text-center text-2xl font-bold tracking-tight sm:text-4xl">
            Compare les formules en détail
          </h2>
          <div className="mt-8 space-y-8">
            {comparisonSections.map((section) => (
              <div key={section.title} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center gap-2 border-b border-border bg-primary/10 px-4 py-3 text-xs font-bold sm:px-6 sm:text-sm">
                  <span className="text-primary">{section.title}</span>
                  {plans.map((plan) => (
                    <span key={plan.id} className="text-center text-foreground">
                      {plan.name}
                    </span>
                  ))}
                </div>
                {section.rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center gap-2 border-b border-border/60 px-4 py-3.5 text-xs last:border-b-0 sm:px-6 sm:text-sm"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    {row.tiers.map((included, tierIndex) => (
                      <span key={tierIndex} className="flex justify-center">
                        {included ? (
                          <Check className="h-4 w-4 text-success sm:h-5 sm:w-5" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 sm:h-5 sm:w-5" />
                        )}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-3xl sm:mt-24" aria-labelledby="pricing-faq-title">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold text-primary">
              FAQ
            </span>
            <h2 id="pricing-faq-title" className="mt-5 text-2xl font-bold tracking-tight sm:text-4xl">
              Tes questions sur l’abonnement
            </h2>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            {pricingFaqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              const contentId = `pricing-faq-answer-${index}`;
              return (
                <div key={faq.question} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                    data-testid={`button-pricing-faq-${index}`}
                  >
                    <span className="text-sm font-bold leading-6 text-foreground sm:text-base">
                      {faq.question}
                    </span>
                    <Plus
                      className={cn(
                        "h-4 w-4 shrink-0 text-primary transition-transform duration-200",
                        isOpen && "rotate-45",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <p id={contentId} className="px-5 pb-5 text-sm leading-6 text-muted-foreground sm:px-6">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export function PaymentCheckout() {
  const params = new URLSearchParams(window.location.search);
  const planId = params.get("plan") || "pro";
  const period: Period = params.get("period") === "yearly" ? "yearly" : "monthly";
  const plan = plans.find((candidate) => candidate.id === planId) ?? plans[1];
  const yearly = period === "yearly";

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link
          href="/paiement"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Modifier la formule
        </Link>
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Paiement</p>
          <h1 className="mt-3 text-3xl font-bold">Débloque ton parcours {plan.name}.</h1>
          <div className="mt-4 flex items-baseline gap-2" data-testid="text-checkout-price">
            <span className="text-3xl font-black">{yearly ? plan.yearly : plan.monthly}</span>
            <span className="text-sm text-muted-foreground">
              {yearly ? "/an (soit " + plan.yearlyPerMonth + "/mois)" : "/mois"}
            </span>
          </div>
          <Guarantees />
          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <LockKeyhole className="h-4 w-4 shrink-0" /> Aucun accès premium n’est activé avant
            confirmation du paiement.
          </p>
          <div className="mt-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
            Le checkout est prêt côté interface. La connexion au prestataire de paiement est le
            prochain branchement à activer.
          </div>
          <Link
            href="/academie"
            className="mt-6 block w-full rounded-xl bg-secondary px-5 py-3 text-center font-bold hover:bg-secondary/80"
          >
            Revenir à l’académie
          </Link>
        </div>
      </div>
    </div>
  );
}
