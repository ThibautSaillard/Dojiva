import { Layout } from "@/components/Layout";
import { PremiumGate } from "@/components/PremiumGate";
import { useGetProgress, useListStrategies, useCreateStrategy, useDeleteStrategy, getListStrategiesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

export default function Laboratory() {
  const { data: progress } = useGetProgress();
  const { data: strategies } = useListStrategies();
  const queryClient = useQueryClient();
  const deleteStrategy = useDeleteStrategy({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListStrategiesQueryKey() }) }
  });

  const [isCreating, setIsCreating] = useState(false);

  if (progress && !progress.premium) {
    return <Layout><PremiumGate /></Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-[#3c3c3c]">Laboratoire</h1>
        {!isCreating && (
          <ChunkyButton onClick={() => setIsCreating(true)} variant="secondary" size="sm">
            + Créer
          </ChunkyButton>
        )}
      </div>

      {isCreating ? (
        <StrategyForm onCancel={() => setIsCreating(false)} />
      ) : (
        <div className="grid gap-4">
          {strategies?.map(s => (
            <div key={s.id} className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm relative group hover:border-[#1cb0f6] transition-colors">
               <button 
                 onClick={() => deleteStrategy.mutate({ id: s.id })} 
                 className="absolute top-4 right-4 text-gray-300 hover:text-[#ff4b4b] transition-colors"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
               <h3 className="text-xl font-black text-[#3c3c3c] mb-1">{s.name}</h3>
               <div className="text-sm font-bold text-[#1cb0f6] mb-4">{s.market} • {s.timeframe} • {s.style}</div>
               
               <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-500">
                 <div>
                   <span className="font-bold text-gray-700 block mb-1">Entrée:</span>
                   <div className="flex flex-wrap gap-1">{s.entryRules.map(r => <span key={r} className="bg-gray-100 px-2 py-0.5 rounded-md">{r}</span>)}</div>
                 </div>
                 <div>
                   <span className="font-bold text-gray-700 block mb-1">Contexte:</span>
                   <div className="flex flex-wrap gap-1">{s.context.map(c => <span key={c} className="bg-gray-100 px-2 py-0.5 rounded-md">{c}</span>)}</div>
                 </div>
                 <div>
                   <span className="font-bold text-gray-700 block">Stop Loss:</span>
                   {s.stopLossRule}
                 </div>
                 <div>
                   <span className="font-bold text-gray-700 block">Risque:</span>
                   {s.riskPercent}%
                 </div>
               </div>
            </div>
          ))}
          {strategies?.length === 0 && (
             <div className="text-center py-12 text-gray-400 font-bold bg-gray-50 rounded-3xl border-2 border-gray-200 border-dashed">
               Aucune stratégie pour le moment.
             </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function StrategyForm({ onCancel }: { onCancel: () => void }) {
  const queryClient = useQueryClient();
  const createStrategy = useCreateStrategy({
    mutation: { 
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStrategiesQueryKey() });
        onCancel();
      }
    }
  });

  const [name, setName] = useState("");
  const [market, setMarket] = useState("Crypto");
  const [style, setStyle] = useState("Day Trading");
  const [timeframe, setTimeframe] = useState("15m");
  const [context, setContext] = useState<string[]>([]);
  const [entryRules, setEntryRules] = useState<string[]>([]);
  const [stopLossRule, setStopLossRule] = useState("");
  const [takeProfitRule, setTakeProfitRule] = useState("");
  const [riskPercent, setRiskPercent] = useState("1");

  const handleSubmit = () => {
    createStrategy.mutate({
      data: {
        name, market, style, timeframe, context, entryRules, stopLossRule, takeProfitRule, riskPercent: Number(riskPercent)
      }
    });
  };

  const toggleArray = (arr: string[], setArr: any, val: string) => {
    if (arr.includes(val)) setArr(arr.filter(a => a !== val));
    else setArr([...arr, val]);
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      <div>
        <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Nom de la stratégie</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-[#1cb0f6]" placeholder="Ex: Scalping EMA" />
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div>
           <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Marché</label>
           <select value={market} onChange={e => setMarket(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-[#1cb0f6] bg-white">
             <option>Crypto</option><option>Forex</option><option>Actions</option>
           </select>
         </div>
         <div>
           <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Style</label>
           <select value={style} onChange={e => setStyle(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-[#1cb0f6] bg-white">
             <option>Scalping</option><option>Day Trading</option><option>Swing Trading</option>
           </select>
         </div>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-500 uppercase block mb-2">Contexte de marché</label>
        <div className="flex flex-wrap gap-2">
          {["Tendance haussière", "Tendance baissière", "Range", "Support majeur", "Structure cassée"].map(opt => (
            <button key={opt} onClick={() => toggleArray(context, setContext, opt)} className={`px-4 py-2 rounded-xl font-bold border-2 transition-colors ${context.includes(opt) ? 'border-[#1cb0f6] bg-[#1cb0f6]/10 text-[#1cb0f6]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-500 uppercase block mb-2">Règles d'entrée</label>
        <div className="flex flex-wrap gap-2">
          {["Order Block", "FVG", "RSI Sur-vendu", "Cassure EMA", "Double Top"].map(opt => (
            <button key={opt} onClick={() => toggleArray(entryRules, setEntryRules, opt)} className={`px-4 py-2 rounded-xl font-bold border-2 transition-colors ${entryRules.includes(opt) ? 'border-[#58cc02] bg-[#58cc02]/10 text-[#58cc02]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div>
           <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Règle Stop Loss</label>
           <input value={stopLossRule} onChange={e => setStopLossRule(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-[#1cb0f6]" placeholder="Sous le dernier plus bas" />
         </div>
         <div>
           <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Règle Take Profit</label>
           <input value={takeProfitRule} onChange={e => setTakeProfitRule(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-[#1cb0f6]" placeholder="Prochaine liquidité" />
         </div>
      </div>

      <div className="flex gap-4 mt-4">
         <ChunkyButton onClick={onCancel} variant="gray" className="flex-1">Annuler</ChunkyButton>
         <ChunkyButton onClick={handleSubmit} disabled={!name || createStrategy.isPending} variant="primary" className="flex-1">Sauvegarder</ChunkyButton>
      </div>
    </div>
  );
}
