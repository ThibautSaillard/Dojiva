import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Star, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { PhoneShowcase } from "../components/PhoneShowcase";
import { motion, useReducedMotion } from "framer-motion";
import avatarYanis from "@assets/IMG_9202_1786143915237.jpeg";
import avatarLucas from "@assets/IMG_9204_1786143915237.jpeg";
import avatarMehdi from "@assets/IMG_9206_1786143915237.jpeg";
import avatarKylian from "@assets/IMG_9208_1786143915237.jpeg";
import avatarEnzo from "@assets/IMG_9209_1786143915237.jpeg";
import avatarAdam from "@assets/IMG_9210_1786143915237.jpeg";

const testimonials = [
  {
    quote: "J'étais complètement perdu devant un graphique. Là, je comprends enfin ce que je regarde et pourquoi le prix bouge. Les leçons sont courtes, ça change tout.",
    name: "Yanis B.",
    date: "28/07/2026",
    avatar: avatarYanis,
  },
  {
    quote: "Le truc qui m'a accroché, c'est le simulateur. Je peux me tromper sans stresser et revoir chaque décision. Pour débuter, c'est exactement ce qu'il me fallait.",
    name: "Lucas M.",
    date: "24/07/2026",
    avatar: avatarLucas,
  },
  {
    quote: "Je pensais que le trading c'était surtout des indicateurs compliqués. Dojiva m'a remis les bases dans le bon ordre, sans me parler comme dans un cours de finance.",
    name: "Mehdi A.",
    date: "19/07/2026",
    avatar: avatarMehdi,
  },
  {
    quote: "J'ai enfin arrêté de cliquer au hasard. Le fait de devoir expliquer pourquoi j'entre ou pourquoi j'attends m'a vraiment fait progresser.",
    name: "Kylian R.",
    date: "15/07/2026",
    avatar: avatarKylian,
  },
  {
    quote: "Je fais une leçon dans le métro presque tous les jours. C'est simple, direct, et je retiens beaucoup mieux qu'avec des vidéos de deux heures.",
    name: "Enzo T.",
    date: "11/07/2026",
    avatar: avatarEnzo,
  },
  {
    quote: "Le journal m'aide à voir mes erreurs au lieu de les oublier. Je ne cherche plus le trade parfait, je cherche surtout à être plus propre dans mes décisions.",
    name: "Adam S.",
    date: "07/07/2026",
    avatar: avatarAdam,
  },
];

const faqs = [
  {
    question: "Est-ce que Dojiva est adapté si je pars de zéro ?",
    answer: "Oui. Le parcours commence par les bases : comprendre une bougie, lire une tendance et observer un graphique. Chaque notion est découpée en petites leçons avant de passer à la pratique.",
  },
  {
    question: "Est-ce que je risque de perdre mon argent ?",
    answer: "Non, les exercices et le simulateur utilisent de l’argent virtuel. Dojiva est une plateforme d’apprentissage. Le trading réel comporte des risques importants et Dojiva ne fournit pas de conseil en investissement.",
  },
  {
    question: "Que contient l’accès premium ?",
    answer: "L’accès premium débloque la suite du parcours, les exercices avancés, le simulateur avec 10 000 € virtuels, le journal de trading et, selon la formule choisie, le laboratoire de stratégies et le Coach IA.",
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer: "Oui. Tu peux annuler le renouvellement de ton abonnement. L’accès reste disponible jusqu’à la fin de la période déjà payée, sauf disposition différente prévue par la loi.",
  },
  {
    question: "Puis-je être remboursé après avoir commencé le parcours ?",
    answer: "Tu peux demander un remboursement tant que tu n’as pas commencé la première leçon de la deuxième partie. Dès que tu ouvres ou commences cette leçon, la commande n’est plus éligible au remboursement selon notre politique, sous réserve de tes droits légaux.",
  },
  {
    question: "Dojiva garantit-il des résultats en trading ?",
    answer: "Non. Dojiva t’aide à apprendre et à pratiquer dans un environnement virtuel, mais aucun résultat financier n’est garanti. Les performances passées et les résultats du simulateur ne préjugent pas des résultats futurs.",
  },
];

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const testimonial = testimonials[activeTestimonial];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground relative overflow-x-clip">
      {/* Background glow effects — clipped in their own layer so position:sticky keeps working */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
      </div>
      
      <header className="px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          Dojiva
        </div>
        <Link href="/sign-in" className="text-sm font-semibold bg-secondary px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors">
          Connexion
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20">
          <Zap className="w-4 h-4" /> La nouvelle école du trading
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 max-w-4xl leading-tight">
          Apprends le trading <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            sans te prendre la tête.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
          Tu pars de zéro ? Parfait. On va te faire passer de "c'est quoi cette bougie ?" à "je sais exactement ce que je regarde". Des petites leçons. Des vrais graphiques. Et surtout : tu pratiques.
        </p>

        <Link href="/sign-up" className="group flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:scale-105">
          Créer mon compte
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <PhoneShowcase />

        <TestimonialsSection
          testimonial={testimonial}
          activeIndex={activeTestimonial}
          onPrevious={() => setActiveTestimonial((activeTestimonial - 1 + testimonials.length) % testimonials.length)}
          onNext={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)}
          onSelect={setActiveTestimonial}
        />

        <StackedFeatures />

        <FAQSection
          activeFaq={activeFaq}
          onToggle={(index) => setActiveFaq((current) => current === index ? null : index)}
        />
      </main>
    </div>
  );
}

const featuresData = [
  {
    icon: <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
    title: "Graphiques Interactifs",
    description: "Apprends à lire le marché sur de vrais graphiques. Identifie les structures, trace tes zones.",
    image: "/assets/feature-chart.jpg",
    number: "01"
  },
  {
    icon: <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
    title: "Simulateur Sans Risque",
    description: "Entraîne-toi avec 10 000€ virtuels. Rejoue les bougies une par une, sans risquer ton vrai capital.",
    image: "/assets/feature-simulator.jpg",
    number: "02"
  },
  {
    icon: <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
    title: "Progression Gamifiée",
    description: "Gagne de l'XP, débloque des badges et garde ton streak actif. L'apprentissage devient addictif.",
    image: "/assets/feature-gamification.jpg",
    number: "03"
  }
];

function StackedFeatures() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative mt-24 max-w-4xl w-full mx-auto pb-[10vh]">
      <style>{`
        .stack-card { top: calc(10vh + (var(--offset) * 75px)); }
        @media (min-width: 768px) {
          .stack-card { top: calc(10vh + (var(--offset) * 95px)); }
        }
      `}</style>
      
      {featuresData.map((f, i) => (
        <motion.div
          key={i}
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, delay: 0.1 * i }}
          className="stack-card sticky w-full rounded-[2rem] md:rounded-[2.5rem] bg-[#09090b] border border-white/5 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col mb-[25vh] md:mb-[40vh] last:mb-0"
          style={{ '--offset': i } as React.CSSProperties}
        >
          {/* Header Row */}
          <div className="flex items-center gap-4 p-5 md:p-8 bg-[#09090b] relative z-10">
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
              {f.icon}
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-lg md:text-2xl font-bold text-white tracking-tight">{f.title}</h3>
              <p className="text-xs md:text-sm text-white/50">{f.description}</p>
            </div>
          </div>
          
          {/* Body Image */}
          <div className="relative w-full h-[320px] md:h-[450px] bg-black overflow-hidden">
            <img 
              src={f.image} 
              alt={f.title} 
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
            />
            {/* Dark gradient overlay from bottom to blend the image seamlessly */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/10 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-6 right-8 md:bottom-10 md:right-12 text-6xl md:text-8xl font-black text-white/5 tracking-tighter select-none pointer-events-none">
              {f.number}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TestimonialsSection({
  testimonial,
  activeIndex,
  onPrevious,
  onNext,
  onSelect,
}: {
  testimonial: (typeof testimonials)[number];
  activeIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}) {
  return (
    <section className="mt-16 w-full max-w-4xl text-left" aria-labelledby="testimonials-title">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">La communauté Dojiva</p>
          <h2 id="testimonials-title" className="text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
            Ils donnent <span className="text-primary">leur avis</span>
          </h2>
        </div>
        <p className="max-w-[280px] text-xs leading-relaxed text-muted-foreground sm:text-right">
          Des débutants qui ont décidé de comprendre avant de se lancer.
        </p>
      </div>

      <div className="relative px-0 sm:px-8">
        <button
          type="button"
          aria-label="Avis précédent"
          onClick={onPrevious}
          className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary hover:text-primary sm:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <article className="min-h-[220px] rounded-[1.5rem] border border-border bg-card/90 p-5 shadow-xl shadow-black/5 transition-all duration-300 sm:min-h-[200px] sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-primary" aria-label="5 étoiles sur 5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
              ))}
            </div>

            <blockquote className="mt-4 max-w-2xl text-base font-medium leading-relaxed tracking-tight text-foreground sm:text-lg">
              “{testimonial.quote}”
            </blockquote>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-background/80 p-2.5 sm:max-w-[280px] sm:p-3">
            <img
              src={testimonial.avatar}
              alt={`Photo de profil de ${testimonial.name}`}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 sm:h-12 sm:w-12"
            />
            <div>
              <p className="font-bold text-sm text-foreground">{testimonial.name}</p>
              <p className="text-xs text-muted-foreground">{testimonial.date}</p>
            </div>
          </div>
        </article>

        <button
          type="button"
          aria-label="Avis suivant"
          onClick={onNext}
          className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-primary/40 bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/90 sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5" aria-label="Choisir un avis">
        {testimonials.map((item, index) => (
          <button
            key={item.name}
            type="button"
            aria-label={`Afficher l'avis de ${item.name}`}
            aria-current={activeIndex === index}
            onClick={() => onSelect(index)}
            className={`h-2 rounded-full transition-all ${
              activeIndex === index
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function FAQSection({
  activeFaq,
  onToggle,
}: {
  activeFaq: number | null;
  onToggle: (index: number) => void;
}) {
  return (
    <section className="mt-24 w-full max-w-3xl text-left sm:mt-32" aria-labelledby="faq-title">
      <div className="mb-8 text-center">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Questions fréquentes</p>
        <h2 id="faq-title" className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Tu veux en savoir <span className="text-primary">plus ?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Les réponses essentielles avant de commencer ton parcours Dojiva.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card/70">
        {faqs.map((faq, index) => {
          const isOpen = activeFaq === index;
          const contentId = `faq-answer-${index}`;

          return (
            <div key={faq.question} className="border-b border-border last:border-b-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => onToggle(index)}
                className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left transition hover:bg-primary/5 sm:px-6"
              >
                <span className="text-sm font-bold leading-6 text-foreground sm:text-base">{faq.question}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div
                id={contentId}
                role="region"
                aria-hidden={!isOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-6 text-muted-foreground sm:px-6">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
        Tu veux lire toutes les conditions ?{" "}
        <Link href="/legal" className="font-bold text-primary hover:text-primary/80">
          Consulte nos pages légales
        </Link>
        .
      </p>
    </section>
  );
}
