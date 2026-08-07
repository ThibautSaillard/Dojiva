import { useState } from "react";
import { Layout } from "@/components/Layout";
import { PremiumGate } from "@/components/PremiumGate";
import { useGetProgress, useGetCoachAdvice } from "@workspace/api-client-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { CandleMascot } from "@/components/CandleMascot";
import { BrainCircuit, Activity, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Coach() {
  const { data: progress } = useGetProgress();
  const [advice, setAdvice] = useState<any>(null);
  
  const getAdvice = useGetCoachAdvice({
    mutation: { onSuccess: (data) => setAdvice(data) }
  });

  if (progress && !progress.premium) {
    return <Layout><PremiumGate /></Layout>;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center text-center gap-6 py-8">
        <CandleMascot size={160} mood={advice ? "happy" : getAdvice.isPending ? "surprised" : "bullish"} animate={true} />
        
        {!advice && !getAdvice.isPending && (
          <div className="max-w-md">
            <h1 className="text-3xl font-black text-[#3c3c3c] mb-4">Coach IA</h1>
            <p className="text-gray-500 font-medium mb-8 text-lg">
              Je vais analyser tes récentes leçons et tes trades du simulateur pour te donner des conseils personnalisés.
            </p>
            <ChunkyButton size="xl" variant="secondary" onClick={() => getAdvice.mutate()} className="w-full">
              Analyser mes progrès
            </ChunkyButton>
          </div>
        )}

        {getAdvice.isPending && (
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-black text-[#1cb0f6] animate-pulse">Analyse en cours...</h2>
            <p className="text-gray-400 font-bold mt-2">Lecture de ton journal de trading...</p>
          </div>
        )}

        <AnimatePresence>
          {advice && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-left flex flex-col gap-6"
            >
               {advice.sections.map((sec: any) => {
                  let Icon = BrainCircuit;
                  let color = "text-[#1cb0f6]";
                  let bg = "bg-[#1cb0f6]/10 border-[#1cb0f6]";
                  
                  if (sec.category === 'simulation') {
                    Icon = Activity; color = "text-[#ffc800]"; bg = "bg-[#ffc800]/10 border-[#ffc800]";
                  } else if (sec.category === 'discipline') {
                    Icon = Target; color = "text-[#58cc02]"; bg = "bg-[#58cc02]/10 border-[#58cc02]";
                  }

                  return (
                    <div key={sec.category} className={`border-2 rounded-3xl p-6 relative overflow-hidden ${bg}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 bg-white rounded-xl shadow-sm ${color}`}>
                           <Icon className="w-6 h-6" />
                        </div>
                        <h3 className={`text-xl font-black uppercase tracking-wider ${color}`}>{sec.title}</h3>
                      </div>
                      <p className="text-[#3c3c3c] font-medium text-lg leading-relaxed">{sec.message}</p>
                    </div>
                  );
               })}
               <ChunkyButton variant="ghost" onClick={() => setAdvice(null)}>Recommencer</ChunkyButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
