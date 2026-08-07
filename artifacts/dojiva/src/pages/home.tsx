import { useLocation } from "wouter";
import { useListTestimonials } from "@workspace/api-client-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { CandleMascot } from "@/components/CandleMascot";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden font-sans">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const [, setLocation] = useLocation();
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-primary font-black text-2xl tracking-tighter">
        <CandleMascot size={32} animate={false} mood="bullish" />
        <span>dojiva</span>
      </div>
      <div>
        <ChunkyButton onClick={() => setLocation("/apprendre")} variant="ghost" className="text-gray-400 font-bold uppercase tracking-wider text-sm hover:text-gray-600">
          J'ai déjà un compte
        </ChunkyButton>
      </div>
    </header>
  );
}

function HeroSection() {
  const [, setLocation] = useLocation();
  return (
    <section className="max-w-4xl mx-auto px-4 pt-16 pb-24 text-center">
      <div className="relative mb-12 flex justify-center items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="relative z-10"
        >
          <CandleMascot size={180} mood="happy" />
        </motion.div>
        
        {/* Decorative elements flying around */}
        <motion.div 
          className="absolute -left-12 top-10"
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
        >
          <CandleMascot size={80} mood="bullish" />
        </motion.div>
        <motion.div 
          className="absolute -right-8 top-0"
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
        >
          <CandleMascot size={100} mood="surprised" />
        </motion.div>
        <motion.div 
          className="absolute right-10 bottom-0"
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        >
          <CandleMascot size={90} mood="bearish" />
        </motion.div>
      </div>

      <motion.h1 
        className="text-4xl md:text-5xl font-black text-[#3c3c3c] mb-10 max-w-2xl mx-auto leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        La méthode la plus fun pour apprendre le trading
      </motion.h1>

      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ChunkyButton onClick={() => setLocation("/apprendre")} size="xl" className="w-full text-lg">
          C'EST PARTI !
        </ChunkyButton>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-gray-50 border-t-2 border-b-2 border-gray-100 py-24">
      <div className="max-w-5xl mx-auto px-4 flex flex-col gap-32">
        {/* Feature 1 */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-black text-primary mb-6">gratuit. fun. efficace.</h2>
            <p className="text-lg text-gray-500 leading-relaxed font-medium">
              Apprendre avec Dojiva, c'est fun, et en plus <span className="text-[#1cb0f6] font-bold">ça marche vraiment !</span> Avec nos leçons courtes et interactives, gagne des points d'expérience, progresse dans les niveaux et développe tes compétences en analyse technique pour les vrais marchés financiers.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-64 h-80 bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden flex flex-col items-center pt-8 p-4">
              <div className="w-48 h-4 bg-gray-100 rounded-full mb-8 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2/3 bg-primary rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full px-2">
                <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-center">
                   <CandleMascot size={60} mood="bullish" animate={false} />
                </div>
                <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-center">
                   <CandleMascot size={60} mood="bearish" animate={false} />
                </div>
                <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-gray-100"></div>
                <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-gray-100"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-black text-primary mb-6">une méthode scientifique</h2>
            <p className="text-lg text-gray-500 leading-relaxed font-medium">
              On utilise des méthodes d'enseignement fondées sur la recherche associées à du contenu ludique pour créer des cours qui enseignent efficacement la lecture des graphiques, la gestion du risque et la psychologie !
            </p>
          </div>
          <div className="flex-1 flex justify-center relative">
            <motion.div 
               className="w-72 h-72 bg-[#1cb0f6]/10 rounded-full absolute -z-10 blur-3xl"
               animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }}
            />
            <CandleMascot size={200} mood="surprised" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { data: testimonials } = useListTestimonials();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-4xl font-black text-center mb-16 uppercase tracking-tight text-[#3c3c3c]">
          Ils donnent <span className="text-[#1cb0f6]">leur avis</span>
        </h2>
        
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {testimonials?.map((t) => (
                <div key={t.id} className="min-w-0 flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_40%] pl-4">
                  <div className="bg-[#f7f7f7] border-2 border-gray-100 rounded-3xl p-8 h-full flex flex-col">
                    <div className="flex gap-1 mb-6 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-current" />
                      ))}
                    </div>
                    <p className="text-[#3c3c3c] text-lg leading-relaxed font-medium mb-8 flex-1">
                      "{t.text}"
                    </p>
                    <div className="bg-white rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                        {t.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-[#3c3c3c]">{t.name}</div>
                        <div className="text-gray-400 text-sm font-medium">{t.date}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Fallback if no testimonials while loading */}
              {!testimonials && [1,2,3].map(i => (
                <div key={i} className="min-w-0 flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_40%] pl-4">
                  <div className="bg-[#f7f7f7] border-2 border-gray-100 rounded-3xl p-8 h-64 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-2 border-gray-100 shadow-sm flex items-center justify-center text-primary hover:bg-gray-50 -ml-6 md:-ml-12 z-10 transition-transform hover:scale-105 active:scale-95">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-2 border-gray-100 shadow-sm flex items-center justify-center text-primary hover:bg-gray-50 -mr-6 md:-mr-12 z-10 transition-transform hover:scale-105 active:scale-95">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials?.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "h-3 rounded-full transition-all duration-300", 
                idx === selectedIndex ? "w-8 bg-[#1cb0f6]" : "w-3 bg-gray-200"
              )} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-100 py-12 px-4 text-center">
      <div className="max-w-2xl mx-auto text-gray-500 text-sm font-medium">
        <div className="flex justify-center mb-6 opacity-50 grayscale">
           <CandleMascot size={40} animate={false} mood="neutral" />
        </div>
        <p className="mb-4">
          Dojiva est un outil d'apprentissage et de simulation. Les marchés financiers comportent des risques.
          Cette application ne promet aucun gain financier et ne constitue pas un conseil en investissement.
        </p>
        <p className="opacity-60">© {new Date().getFullYear()} Dojiva. La méthode la plus fun pour apprendre le trading.</p>
      </div>
    </footer>
  );
}
