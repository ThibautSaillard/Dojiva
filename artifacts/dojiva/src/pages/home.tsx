import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight, Star, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { PhoneShowcase } from "../components/PhoneShowcase";
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

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonial = testimonials[activeTestimonial];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
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

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            title="Graphiques Interactifs"
            description="Apprends à lire le marché sur de vrais graphiques. Identifie les structures, trace tes zones."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-primary" />}
            title="Simulateur Sans Risque"
            description="Entraîne-toi avec 10 000€ virtuels. Rejoue les bougies une par une, sans risquer ton vrai capital."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-primary" />}
            title="Progression Gamifiée"
            description="Gagne de l'XP, débloque des badges et garde ton streak actif. L'apprentissage devient addictif."
          />
        </div>
      </main>
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
    <section className="mt-28 w-full max-w-5xl text-left" aria-labelledby="testimonials-title">
      <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-primary">La communauté Dojiva</p>
          <h2 id="testimonials-title" className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
            Ils donnent <span className="text-primary">leur avis</span>
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-right">
          Des débutants qui ont décidé de comprendre avant de se lancer.
        </p>
      </div>

      <div className="relative px-0 sm:px-10">
        <button
          type="button"
          aria-label="Avis précédent"
          onClick={onPrevious}
          className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition hover:border-primary hover:text-primary sm:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <article className="min-h-[360px] rounded-[2rem] border border-border bg-card/90 p-6 shadow-2xl shadow-black/10 transition-all duration-300 sm:min-h-[330px] sm:p-10">
          <div className="flex items-center gap-1 text-primary" aria-label="5 étoiles sur 5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-6 w-6 fill-current sm:h-7 sm:w-7" />
            ))}
          </div>

          <blockquote className="mt-8 max-w-3xl text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-3xl">
            “{testimonial.quote}”
          </blockquote>

          <div className="mt-9 flex items-center gap-4 rounded-2xl bg-background/80 p-3 sm:max-w-sm sm:p-4">
            <img
              src={testimonial.avatar}
              alt={`Photo de profil de ${testimonial.name}`}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20 sm:h-16 sm:w-16"
            />
            <div>
              <p className="font-bold text-foreground">{testimonial.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{testimonial.date}</p>
            </div>
          </div>
        </article>

        <button
          type="button"
          aria-label="Avis suivant"
          onClick={onNext}
          className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-primary/40 bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 sm:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-7 flex items-center justify-center gap-2" aria-label="Choisir un avis">
        {testimonials.map((item, index) => (
          <button
            key={item.name}
            type="button"
            aria-label={`Afficher l'avis de ${item.name}`}
            aria-current={activeIndex === index}
            onClick={() => onSelect(index)}
            className={`h-3 rounded-full transition-all ${
              activeIndex === index
                ? "w-10 bg-primary"
                : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
