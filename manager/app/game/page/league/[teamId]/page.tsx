import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export default async function TeamDetailPage({ params }: { params: { teamId: string } }) {
  const team = await prisma.saveTeam.findUnique({
    where: { id: params.teamId },
    include: {
      originalTeam: {
        include: {
          venues: true 
        }
      },
      players: { 
        include: { originalPlayer: true } 
      }
    }
  });

  if (!team || !team.originalTeam) return notFound();

  const info = team.originalTeam;


  const sortedPlayers = [...team.players].sort((a, b) => 
    (b.overall || b.originalPlayer?.overall || 0) - (a.overall || a.originalPlayer?.overall || 0)
  );

  return (
    <div className="p-8 bg-[#05080f] min-h-screen text-white flex flex-col gap-8">
      <div className="bg-[#0a111a] p-8 rounded-2xl border border-[#1a2533] flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="w-32 h-32 bg-black/20 p-4 rounded-full border border-white/5 flex items-center justify-center">
             {info.logo ? (
               <img src={info.logo} alt="logo" className="w-24 h-24 object-contain" />
             ) : (
               <span className="font-bold text-slate-500">{info.code || "TÝM"}</span>
             )}
          </div>
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">
              {info.name || "Neznámý tým"}
            </h1>
            <div className="flex gap-4 mt-2">
               <span className="bg-sky-500/20 text-sky-400 px-3 py-1 rounded text-sm font-bold border border-sky-500/30">
                 OVR: {team.teamOverall}
               </span>
               <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-bold border border-green-500/30">
                 BUDGET: {new Intl.NumberFormat('cs-CZ').format(team.budget)} €
               </span>
               {info.national && (
                 <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded text-sm font-bold border border-amber-500/30">
                   NÁRODNÍ TÝM
                 </span>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#0a111a] p-6 rounded-2xl border border-[#1a2533] h-fit">
          <h2 className="text-xl font-bold mb-6 text-sky-400 border-b border-white/5 pb-2">Informace o klubu</h2>
          <div className="space-y-4">
             <InfoRow label="Země" value={info.country || "Neznámá"} />
             <InfoRow label="Založeno" value={info.founded?.toString() || "Neuvedeno"} />
             <InfoRow label="Stadion" value={info.venues?.name || "Neznámý"} />
             <InfoRow label="Kapacita" value={info.venues?.capacity ? new Intl.NumberFormat('cs-CZ').format(info.venues.capacity) : "Neuvedeno"} />
             <InfoRow label="Město" value={info.venues?.city || "Neznámé"} />
          </div>
        </div>
        <div className="lg:col-span-2 bg-[#0a111a] p-6 rounded-2xl border border-[#1a2533]">
          <h2 className="text-xl font-bold mb-6 text-sky-400 border-b border-white/5 pb-2">Klíčoví hráči (Best XI)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {sortedPlayers.slice(0, 11).map((p) => (
               <div key={p.id} className="flex items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-white/5 hover:border-sky-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
                      {p.overall || p.originalPlayer?.overall || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-100">{p.originalPlayer?.name || "Neznámý"}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{p.originalPlayer?.position || "MID"}</p>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string | any }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <span className="text-slate-500 text-sm uppercase font-bold">{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  );
}