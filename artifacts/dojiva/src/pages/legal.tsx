import { ArrowLeft, ArrowRight, CheckCircle2, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";

const lastUpdated = "8 août 2026";

const legalDocuments = [
  {
    slug: "conditions-generales",
    title: "Conditions générales",
    description: "Les règles d’utilisation de Dojiva et de ses abonnements.",
    icon: FileText,
  },
  {
    slug: "remboursement",
    title: "Politique de remboursement",
    description: "Les conditions applicables aux achats et à l’accès au contenu numérique.",
    icon: CheckCircle2,
  },
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    description: "L’identité de l’éditeur, l’hébergement et les contacts.",
    icon: ShieldCheck,
  },
  {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    description: "Les données collectées, leurs usages et tes droits.",
    icon: LockKeyhole,
  },
  {
    slug: "cookies",
    title: "Politique de cookies",
    description: "Les traceurs utilisés par le site et les choix disponibles.",
    icon: FileText,
  },
  {
    slug: "avertissement-trading",
    title: "Avertissement trading",
    description: "Ce que Dojiva est — et n’est pas — dans ton apprentissage.",
    icon: ShieldCheck,
  },
];

const documentsBySlug = {
  "conditions-generales": {
    title: "Conditions générales de vente et d’utilisation",
    intro: "Ces conditions encadrent l’utilisation de Dojiva et l’achat de ses formules d’apprentissage.",
    sections: [
      {
        title: "1. Objet du service",
        paragraphs: [
          "Dojiva est une plateforme pédagogique qui aide les débutants à comprendre les bases du trading grâce à des leçons, des exercices, un simulateur en argent virtuel et des outils de suivi.",
          "Dojiva ne fournit pas de conseil en investissement personnalisé, ne gère pas de fonds et ne promet aucun rendement.",
        ],
      },
      {
        title: "2. Accès au compte",
        paragraphs: [
          "Tu dois fournir des informations exactes lors de ton inscription et garder tes identifiants confidentiels. Ton compte est personnel et tu ne peux pas revendre, partager ou transférer ton accès.",
          "Tu peux demander la fermeture de ton compte à tout moment. La fermeture ne supprime pas les obligations déjà nées, notamment les paiements dus.",
        ],
      },
      {
        title: "3. Abonnements et paiement",
        paragraphs: [
          "Les formules, leurs prix et leur périodicité sont affichés avant la validation de la commande. Le paiement est réalisé par le prestataire présenté au moment du checkout.",
          "Sauf indication contraire affichée avant la commande, un abonnement est reconduit à chaque période jusqu’à sa résiliation. La résiliation prend effet à la fin de la période déjà payée.",
          "L’accès premium est accordé uniquement après confirmation effective du paiement.",
        ],
      },
      {
        title: "4. Contenu numérique et progression",
        paragraphs: [
          "Les contenus sont destinés à un usage personnel. Il est interdit de les copier, de les diffuser, de les revendre ou de tenter d’en extraire le contenu de manière automatisée.",
          "La progression, les XP, les badges et les résultats du simulateur sont des fonctionnalités pédagogiques. Ils ne constituent ni une certification professionnelle ni une preuve de performance sur un marché réel.",
        ],
      },
      {
        title: "5. Suspension et résiliation",
        paragraphs: [
          "Dojiva peut suspendre ou fermer un compte en cas de fraude, de partage d’accès, de contournement des protections, de paiement impayé ou de violation de ces conditions.",
          "Lorsque la loi l’impose, les droits du consommateur restent applicables malgré toute suspension ou résiliation.",
        ],
      },
      {
        title: "6. Contact et droit applicable",
        paragraphs: [
          "Pour toute question, utilise l’adresse de contact indiquée dans les mentions légales. Les informations sur l’éditeur doivent être complétées avant la mise en production.",
          "Le droit applicable, la juridiction compétente et l’identité de l’éditeur doivent être adaptés à la société qui exploite réellement Dojiva et à son pays d’établissement.",
        ],
      },
    ],
  },
  remboursement: {
    title: "Politique de remboursement",
    intro: "Lis cette page avant de souscrire : elle explique comment fonctionnent le satisfait ou remboursé et la résiliation.",
    highlight: "Satisfait ou remboursé : si Dojiva ne te convient pas, tu es remboursé immédiatement, sur simple demande et sans justification.",
    sections: [
      {
        title: "1. Règle principale",
        paragraphs: [
          "Tous les abonnements Dojiva sont satisfait ou remboursé. Tu peux demander le remboursement de ta commande sur simple demande, sans avoir à te justifier.",
          "Le remboursement est déclenché immédiatement après réception de la demande. Le délai d’apparition sur ton compte dépend ensuite du moyen de paiement utilisé.",
        ],
      },
      {
        title: "2. Sans engagement",
        paragraphs: [
          "L’abonnement est sans engagement : tu peux le résilier à tout moment depuis tes paramètres.",
          "La résiliation arrête le renouvellement. Ton accès reste disponible jusqu’à la fin de la période déjà payée.",
        ],
      },
      {
        title: "3. Demander un remboursement",
        paragraphs: [
          "Envoie ta demande depuis l’adresse e-mail associée à ton compte, en indiquant ton nom, la formule concernée et la date d’achat. Le contact de remboursement doit être renseigné dans les mentions légales avant l’ouverture commerciale du service.",
          "Aucune justification n’est demandée. La demande déclenche immédiatement le remboursement de la commande concernée.",
        ],
      },
      {
        title: "4. Annulation d’un abonnement",
        paragraphs: [
          "L’annulation d’un abonnement empêche son renouvellement et peut se faire à tout moment depuis tes paramètres.",
          "Si un prélèvement est contesté, contacte-nous d’abord afin que nous puissions vérifier la commande et la situation de ton compte.",
        ],
      },
      {
        title: "5. Garanties légales",
        paragraphs: [
          "Cette politique ne limite pas les droits obligatoires dont tu bénéficies en tant que consommateur, notamment les garanties légales applicables au contenu ou au service numérique.",
        ],
      },
    ],
  },
  "mentions-legales": {
    title: "Mentions légales",
    intro: "Ces informations doivent identifier l’éditeur réel de Dojiva avant toute mise en ligne commerciale.",
    notice: "À compléter avant publication : remplace chaque élément entre crochets par les informations exactes de l’entreprise ou de l’entrepreneur qui exploite Dojiva.",
    sections: [
      {
        title: "Éditeur du site",
        paragraphs: [
          "Dojiva est édité par : [nom légal complet de l’entreprise ou de l’entrepreneur].",
          "Forme juridique : [forme juridique] — Capital social : [montant] — Immatriculation : [numéro et registre].",
          "Adresse du siège : [adresse complète]. — E-mail : [adresse e-mail légale]. — Téléphone : [numéro, si applicable].",
        ],
      },
      {
        title: "Directeur de la publication",
        paragraphs: [
          "Directeur de la publication : [nom et prénom du responsable de publication].",
        ],
      },
      {
        title: "Hébergement",
        paragraphs: [
          "Hébergeur : [nom légal de l’hébergeur].",
          "Adresse : [adresse complète de l’hébergeur]. — Téléphone : [numéro de l’hébergeur].",
        ],
      },
      {
        title: "Propriété intellectuelle",
        paragraphs: [
          "Les textes, interfaces, illustrations, marques, logos, composants et contenus de Dojiva sont protégés par les règles applicables de propriété intellectuelle. Toute reproduction ou réutilisation non autorisée est interdite.",
        ],
      },
    ],
  },
  confidentialite: {
    title: "Politique de confidentialité",
    intro: "Cette politique explique comment Dojiva protège les informations nécessaires au fonctionnement du service.",
    sections: [
      {
        title: "1. Données traitées",
        paragraphs: [
          "Selon les fonctionnalités que tu utilises, Dojiva peut traiter ton adresse e-mail, ton identité de compte, ta progression, tes résultats, ton journal de trading, tes préférences et les informations liées à ton abonnement.",
          "Les données de paiement sont traitées par le prestataire de paiement choisi. Dojiva ne doit pas stocker les coordonnées complètes de ta carte bancaire.",
        ],
      },
      {
        title: "2. Finalités",
        paragraphs: [
          "Ces données servent à créer et sécuriser ton compte, enregistrer ta progression, fournir les fonctionnalités demandées, gérer ton abonnement, répondre au support et prévenir les abus.",
          "Les données ne doivent pas être utilisées pour vendre des listes de contacts ou envoyer du marketing sans base légale et sans possibilité de retrait.",
        ],
      },
      {
        title: "3. Conservation et sécurité",
        paragraphs: [
          "Les données sont conservées pendant la durée nécessaire aux finalités décrites et aux obligations légales. Des mesures techniques et organisationnelles doivent limiter les accès non autorisés, les pertes et les divulgations.",
          "Les données de progression doivent être isolées par compte. Tu peux demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de tes données lorsque ces droits s’appliquent.",
        ],
      },
      {
        title: "4. Tes demandes",
        paragraphs: [
          "Pour exercer tes droits, contacte : [adresse e-mail dédiée à la protection des données]. Précise l’adresse liée à ton compte et la demande concernée.",
          "Tu peux également contacter l’autorité de protection des données compétente dans ton pays si tu estimes que ta demande n’a pas été traitée correctement.",
        ],
      },
      {
        title: "5. Sous-traitants",
        paragraphs: [
          "Dojiva peut s’appuyer sur des prestataires d’authentification, d’hébergement, de base de données, d’analyse technique et de paiement. La liste exacte, les pays de traitement et les durées de conservation doivent être documentés avant la mise en production.",
        ],
      },
    ],
  },
  cookies: {
    title: "Politique de cookies",
    intro: "Les cookies et technologies similaires doivent rester limités à ce qui est nécessaire au fonctionnement de Dojiva ou accepté par toi.",
    sections: [
      {
        title: "1. Cookies nécessaires",
        paragraphs: [
          "Certains traceurs sont nécessaires pour maintenir ta session, sécuriser l’authentification, mémoriser tes choix et faire fonctionner le parcours. Ils peuvent être déposés sans consentement lorsqu’ils sont strictement nécessaires.",
        ],
      },
      {
        title: "2. Mesure d’audience et personnalisation",
        paragraphs: [
          "Tout outil de mesure d’audience non strictement nécessaire, outil publicitaire ou traceur de personnalisation doit être présenté dans un bandeau de consentement et activé uniquement après ton choix, lorsque la loi l’exige.",
          "Dojiva doit tenir à jour la liste des fournisseurs, la durée de vie et la finalité de chaque traceur utilisé.",
        ],
      },
      {
        title: "3. Tes choix",
        paragraphs: [
          "Tu peux supprimer les cookies depuis les réglages de ton navigateur. Si Dojiva utilise des cookies soumis au consentement, un module de préférences doit te permettre de retirer ton accord aussi facilement que tu l’as donné.",
        ],
      },
    ],
  },
  "avertissement-trading": {
    title: "Avertissement trading et risques",
    intro: "Dojiva est un outil d’apprentissage. Ce n’est pas un service de conseil financier.",
    sections: [
      {
        title: "1. Pas de conseil en investissement",
        paragraphs: [
          "Les leçons, exemples, graphiques, réponses du Coach IA et scénarios du simulateur sont fournis à des fins éducatives générales. Ils ne constituent pas une recommandation d’achat, de vente ou de conservation d’un actif.",
          "Tu dois prendre tes propres décisions et, si nécessaire, demander conseil à un professionnel autorisé dans ton pays.",
        ],
      },
      {
        title: "2. Risque de perte",
        paragraphs: [
          "Le trading avec de l’argent réel comporte un risque élevé de perte partielle ou totale du capital. Les performances passées, les exemples et les résultats virtuels ne préjugent pas des résultats futurs.",
          "N’utilise jamais de l’argent dont tu as besoin pour vivre et ne t’endette pas pour trader.",
        ],
      },
      {
        title: "3. Simulateur",
        paragraphs: [
          "Les 10 000 € du simulateur sont virtuels. Les conditions du simulateur, les prix et les résultats peuvent être simplifiés ou différer des marchés réels. Une réussite dans Dojiva ne garantit pas une réussite avec un courtier.",
        ],
      },
      {
        title: "4. Contenu généré par IA",
        paragraphs: [
          "Les réponses générées par l’IA peuvent être incomplètes, imprécises ou inadaptées à ta situation. Vérifie toujours les informations importantes et ne prends pas de décision financière sur la seule base d’une réponse automatique.",
        ],
      },
    ],
  },
} as const;

type LegalSlug = keyof typeof documentsBySlug;

export default function LegalHub() {
  return (
    <LegalShell>
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
        <LegalEyebrow />
        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
          Les règles, en toute <span className="text-primary">transparence.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Retrouve ici les documents qui encadrent ton compte, ton abonnement et l’utilisation de Dojiva.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {legalDocuments.map((document) => {
            const Icon = document.icon;
            return (
              <Link
                key={document.slug}
                href={`/legal/${document.slug}`}
                className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/60 hover:bg-card/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <h2 className="mt-5 text-xl font-bold">{document.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{document.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm leading-6 text-muted-foreground">
          <p className="font-semibold text-foreground">À retenir pour le remboursement</p>
          <p className="mt-2">
            Tous les abonnements sont satisfait ou remboursé immédiatement, sur simple demande et sans justification. Ils sont aussi sans engagement : tu peux résilier à tout moment depuis tes paramètres.
          </p>
        </div>
      </div>
    </LegalShell>
  );
}

export function LegalDocument() {
  const [, params] = useRoute("/legal/:slug");
  const slug = params?.slug as LegalSlug | undefined;
  const document = slug ? documentsBySlug[slug] : undefined;

  if (!document) {
    return <LegalHub />;
  }

  return (
    <LegalShell>
      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <Link href="/legal" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Toutes les pages légales
        </Link>
        <LegalEyebrow />
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{document.title}</h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">{document.intro}</p>
        <p className="mt-3 text-xs text-muted-foreground">Dernière mise à jour : {lastUpdated}</p>

        {"notice" in document && (
          <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm leading-6 text-amber-100">
            {document.notice}
          </div>
        )}
        {"highlight" in document && (
          <div className="mt-8 rounded-2xl border border-primary/40 bg-primary/10 p-5 text-base font-semibold leading-7 text-foreground">
            {document.highlight}
          </div>
        )}

        <div className="mt-10 space-y-9">
          {document.sections.map((section) => (
            <section key={section.title} className="border-t border-border pt-7">
              <h2 className="text-xl font-bold sm:text-2xl">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <Link href="/legal/remboursement" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80">
            Voir la politique de remboursement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </LegalShell>
  );
}

function LegalShell({ children }: { children: React.ReactNode }) {
  // Le header global (Layout) est déjà affiché au-dessus : pas de barre locale ici.
  return <div className="min-h-[calc(100dvh-4rem)] bg-background text-foreground">{children}</div>;
}

function LegalEyebrow() {
  return <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-primary">Dojiva · informations légales</p>;
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card/40 px-5 py-8 text-sm text-muted-foreground sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Dojiva. Apprendre avant d’agir.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Pages légales">
          <Link href="/legal/conditions-generales" className="hover:text-foreground">Conditions</Link>
          <Link href="/legal/remboursement" className="hover:text-foreground">Remboursement</Link>
          <Link href="/legal/mentions-legales" className="hover:text-foreground">Mentions légales</Link>
          <Link href="/legal/confidentialite" className="hover:text-foreground">Confidentialité</Link>
          <Link href="/legal/cookies" className="hover:text-foreground">Cookies</Link>
          <Link href="/legal/avertissement-trading" className="hover:text-foreground">Risques</Link>
        </nav>
      </div>
    </footer>
  );
}