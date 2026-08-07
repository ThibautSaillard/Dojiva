import { ChunkyButton } from "@/components/ChunkyButton";
import { CandleMascot } from "@/components/CandleMascot";
import { useActivatePremium, getGetProgressQueryKey, getListWorldsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function PremiumGate() {
  const queryClient = useQueryClient();
  const activatePremium = useActivatePremium({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListWorldsQueryKey() });
      }
    }
  });

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-[70vh]">
      <div className="w-24 h-24 bg-gradient-to-tr from-[#ffc800] to-[#e5b400] rounded-3xl rotate-12 flex items-center justify-center mb-8 shadow-xl shadow-[#ffc800]/20">
         <CandleMascot size={60} mood="happy" animate={false} />
      </div>
      <h2 className="text-3xl font-black mb-4 text-[#3c3c3c]">Section Premium</h2>
      <p className="text-gray-500 text-lg mb-8 font-medium max-w-sm">
        Débloque le simulateur, le laboratoire de stratégies, le coach IA et ton journal de trading.
      </p>
      
      <ChunkyButton 
        size="xl" 
        variant="gold" 
        onClick={() => activatePremium.mutate()}
        disabled={activatePremium.isPending}
        className="w-full max-w-sm"
      >
        {activatePremium.isPending ? "ACTIVATION..." : "Continuer mon apprentissage"}
      </ChunkyButton>
    </div>
  );
}
