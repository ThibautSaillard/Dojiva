import { Link } from "wouter";
import { ArrowRight, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
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
