import { Layout } from "@/components/Layout";
import { useGetProgress, useListBadges } from "@workspace/api-client-react";
import { Zap, Flame, ShieldCheck } from "lucide-react";
import { CandleMascot } from "@/components/CandleMascot";

export default function Profile() {
  const { data: progress } = useGetProgress();
  const { data: badges } = useListBadges();

  return (
    <Layout>
      <div className="flex flex-col items-center bg-[#1cb0f6]/10 border-2 border-[#1cb0f6]/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-20"><CandleMascot size={200} mood="happy" /></div>
        
        <div className="w-24 h-24 bg-white rounded-full border-4 border-[#1cb0f6] flex items-center justify-center text-4xl font-black text-[#1cb0f6] shadow-sm mb-4 relative z-10">
          N{progress?.level || 1}
        </div>
        <h1 className="text-3xl font-black text-[#3c3c3c] mb-6 relative z-10">Ton Profil</h1>
        
        <div className="grid grid-cols-2 gap-4 w-full relative z-10">
          <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 flex flex-col items-center">
            <Zap className="w-8 h-8 text-[#ffc800] mb-2" />
            <div className="text-2xl font-black text-[#3c3c3c]">{progress?.xp || 0}</div>
            <div className="text-xs font-bold text-gray-400 uppercase">XP Total</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 flex flex-col items-center">
            <Flame className="w-8 h-8 text-orange-500 mb-2" />
            <div className="text-2xl font-black text-[#3c3c3c]">{progress?.streak || 0}</div>
            <div className="text-xs font-bold text-gray-400 uppercase">Série (Jours)</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#3c3c3c] mb-6 flex items-center gap-2">
          <ShieldCheck className="text-[#58cc02]" /> Tes Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {badges?.map(b => (
            <div key={b.id} className={`border-2 rounded-3xl p-4 flex flex-col items-center text-center transition-all ${b.earned ? 'bg-white border-[#e5e5e5] shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60 grayscale'}`}>
              <div className="text-4xl mb-3">{b.emoji}</div>
              <div className="font-black text-[#3c3c3c] mb-1 leading-tight">{b.title}</div>
              <div className="text-xs font-bold text-gray-400">{b.description}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
