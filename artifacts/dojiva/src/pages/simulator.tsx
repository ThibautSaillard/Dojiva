import { useState } from "react";
import { useGetProgress, useCreateScenario, useSubmitTrade, useListStrategies, getGetProgressQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { PremiumGate } from "@/components/PremiumGate";
import { CandleChart } from "@/components/CandleChart";
import { ChunkyButton } from "@/components/ChunkyButton";
import { useQueryClient } from "@tanstack/react-query";

export default function Simulator() {
  const { data: progress } = useGetProgress();
  const { data: strategies } = useListStrategies();
  const queryClient = useQueryClient();
  
  const [scenario, setScenario] = useState<any>(null);
  const [tradeResult, setTradeResult] = useState<any>(null);

  const createScenario = useCreateScenario({
    mutation: { onSuccess: (data) => { setScenario(data); setTradeResult(null); } }
  });

  const submitTrade = useSubmitTrade({
    mutation: { 
      onSuccess: (data) => {
        setTradeResult(data);
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() }); // update balance
      } 
    }
  });

  if (progress && !progress.premium) {
    return <Layout><PremiumGate /></Layout>;
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl border-2 border-gray-200">
           <div>
             <div className="text-sm font-bold text-gray-400 uppercase">Capital</div>
             <div className="text-2xl font-black text-[#3c3c3c]">{progress?.balance?.toFixed(2)} €</div>
           </div>
           <ChunkyButton onClick={() => createScenario.mutate()} disabled={createScenario.isPending} variant="secondary">
             {scenario ? "Nouveau Scénario" : "Démarrer"}
           </ChunkyButton>
        </div>

        {scenario && (
          <div className="flex flex-col gap-4">
             <div className="bg-white rounded-3xl border-2 border-gray-200 p-4 shadow-sm">
                <div className="font-bold text-gray-500 mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
                  <span className="text-[#1cb0f6] bg-[#1cb0f6]/10 px-2 py-1 rounded-lg">{scenario.market}</span> 
                  <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">{scenario.timeframe}</span>
                </div>
                <CandleChart 
                  candles={scenario.candles} 
                  futureCandles={tradeResult?.futureCandles} 
                />
             </div>
             
             {!tradeResult ? (
               <TradeForm scenarioId={scenario.id} onSubmit={(data: any) => submitTrade.mutate({ data })} isPending={submitTrade.isPending} strategies={strategies} />
             ) : (
               <TradeResultView result={tradeResult} />
             )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function TradeForm({ scenarioId, onSubmit, isPending, strategies }: any) {
  const [direction, setDirection] = useState<'buy'|'sell'|'wait' | null>(null);
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [risk, setRisk] = useState("1");
  const [emotion, setEmotion] = useState("");
  const [strategyId, setStrategyId] = useState("");

  const handleSubmit = () => {
    if (!direction) return;
    onSubmit({
      scenarioId,
      direction,
      stopLoss: sl ? Number(sl) : undefined,
      takeProfit: tp ? Number(tp) : undefined,
      riskPercent: Number(risk),
      emotion: emotion || undefined,
      strategyId: strategyId ? Number(strategyId) : undefined
    });
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-gray-200 p-6 flex flex-col gap-6 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        <ChunkyButton variant={direction === 'buy' ? 'primary' : 'gray'} onClick={() => setDirection('buy')}>Acheter</ChunkyButton>
        <ChunkyButton variant={direction === 'wait' ? 'secondary' : 'gray'} onClick={() => setDirection('wait')}>Attendre</ChunkyButton>
        <ChunkyButton variant={direction === 'sell' ? 'danger' : 'gray'} onClick={() => setDirection('sell')}>Vendre</ChunkyButton>
      </div>
      
      {direction && direction !== 'wait' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Stop Loss</label>
            <input type="number" value={sl} onChange={e => setSl(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-[#1cb0f6]" placeholder="Prix" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Take Profit</label>
            <input type="number" value={tp} onChange={e => setTp(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-[#1cb0f6]" placeholder="Prix" />
          </div>
        </div>
      )}

      {direction && (
        <div className="grid grid-cols-2 gap-4">
          {direction !== 'wait' && (
            <div>
              <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Risque (%)</label>
              <input type="number" value={risk} onChange={e => setRisk(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-[#1cb0f6]" />
            </div>
          )}
          <div>
            <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Émotion</label>
            <select value={emotion} onChange={e => setEmotion(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-[#1cb0f6] bg-white">
               <option value="">Aucune</option>
               <option value="confiant">Confiant</option>
               <option value="stressé">Stressé</option>
               <option value="neutre">Neutre</option>
               <option value="fomo">FOMO</option>
            </select>
          </div>
          {strategies && strategies.length > 0 && (
             <div className="col-span-2">
               <label className="text-sm font-bold text-gray-500 uppercase block mb-1">Stratégie (Optionnel)</label>
               <select value={strategyId} onChange={e => setStrategyId(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-[#1cb0f6] bg-white">
                 <option value="">Sélectionner...</option>
                 {strategies.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
             </div>
          )}
        </div>
      )}

      <ChunkyButton size="xl" disabled={!direction || isPending} onClick={handleSubmit} variant="primary" className="w-full">
        {isPending ? "ANALYSE..." : "VALIDER"}
      </ChunkyButton>
    </div>
  );
}

function TradeResultView({ result }: { result: any }) {
  const isWin = result.pnl > 0;
  const isLoss = result.pnl < 0;
  const color = isWin ? "text-[#58cc02]" : isLoss ? "text-[#ff4b4b]" : "text-gray-500";
  const bg = isWin ? "bg-[#d7ffb8]" : isLoss ? "bg-[#ffdfe0]" : "bg-gray-100";
  
  return (
    <div className={`rounded-3xl p-6 border-2 border-b-4 ${isWin ? "border-[#46a302]" : isLoss ? "border-[#ea2b2b]" : "border-gray-200"} ${bg}`}>
       <h3 className={`text-2xl font-black mb-2 ${color}`}>
         {result.outcome === 'take-profit' ? "Take Profit Touché !" :
          result.outcome === 'stop-loss' ? "Stop Loss Touché !" :
          result.outcome === 'waited' ? "Tu as attendu" : "Trade Expiré"}
       </h3>
       
       {result.pnl !== 0 && (
         <div className={`text-4xl font-black mb-4 ${color}`}>
           {result.pnl > 0 ? "+" : ""}{result.pnl.toFixed(2)} €
         </div>
       )}

       <div className="space-y-2 mt-4 bg-white/50 p-4 rounded-2xl">
         {result.feedback.map((f: string, i: number) => (
            <div key={i} className="font-bold text-[#3c3c3c] flex items-start gap-2">
              <span className="shrink-0 mt-1">•</span>
              <span>{f}</span>
            </div>
         ))}
       </div>
    </div>
  );
}
