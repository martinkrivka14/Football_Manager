import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TeamDetailPage({ 
  params 
}: { 
  params: Promise<{ teamId: string }> 
}) {
  
  const resolvedParams = await params;
  const currentTeamId = resolvedParams.teamId;

  
  const team = await prisma.saveTeam.findUnique({
    where: { id: currentTeamId },
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
  const venue = Array.isArray(info.venues) ? info.venues[0] : info.venues;

  console.log(info.venues);

  const getCat = (pos: string | null) => {
    if (!pos) return 'MID';
    const p = pos.toUpperCase();
    if (p === 'GOALKEEPER') return 'GK';
    if (p === 'DEFENDER') return 'DEF';
    if (p === 'MIDFIELDER') return 'MID';
    if (p === 'ATTACKER') return 'ATT';
    if (p === 'U') return 'UNI';
    return 'MID';
  };

  const pool = [...team.players].map(p => ({
    ...p,
    cat: getCat(p.originalPlayer?.position || null),
    ovr: p.overall || p.originalPlayer?.overall || 0
  })).sort((a, b) => b.ovr - a.ovr);

  const usedIds = new Set<string>(); 
  const bestXI = [];



  const pickPlayer = (allowedCategories: string[], roleName: string) => {

    let selected = pool.find(p => allowedCategories.includes(p.cat) && !usedIds.has(p.id));
    
    if (!selected) {
      selected = pool.find(p => !usedIds.has(p.id));
    }

    if (selected) {
      usedIds.add(selected.id);
      return { ...selected, displayRole: roleName }; 
    }
    return null;
  };

  bestXI.push(pickPlayer(['GK'], 'GK'));
  for (let i = 0; i < 4; i++) bestXI.push(pickPlayer(['DEF', 'UNI'], 'DEF'));
  for (let i = 0; i < 3; i++) bestXI.push(pickPlayer(['MID', 'UNI'], 'MID'));
  for (let i = 0; i < 3; i++) bestXI.push(pickPlayer(['ATT', 'UNI'], 'ATT'));

  const finalXI = bestXI.filter(p => p !== null);

  return (
    <div className="p-8 bg-[#05080f] min-h-screen text-white flex flex-col gap-8">
      
      <div className="bg-[#0a111a] p-8 rounded-2xl border border-[#1a2533] flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="w-32 h-32 bg-black/20 p-4 rounded-full border border-white/5 flex items-center justify-center">
             {info.logo ? (
               <img src={info.logo} alt="logo" className="w-24 h-24 object-contain" />
             ) : (
               <span className="font-bold text-slate-500 text-xl">{info.code || "TÝM"}</span>
             )}
          </div>
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">
              {info.name || "Neznámý tým"}
            </h1>
            <div className="flex gap-4 mt-3">
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
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-500 text-sm uppercase font-bold">Stadion</span>
                {venue?.id ? (
                  <Link 
                    href={`/game/page/venue/${venue.id}`} 
                    className="font-bold text-sky-400 hover:text-sky-300 hover:underline transition-all">
                    {venue.name && venue.name !== "null" ? venue.name : "Detail stadionu"}
                  </Link>) : (
                  <span className="font-semibold text-slate-200">Neznámý</span>)}
              </div>            
              <InfoRow label="Kapacita" value={venue?.capacity ? new Intl.NumberFormat('cs-CZ').format(venue.capacity) : "Neuvedeno"} />
             <InfoRow label="Město" value={venue?.city || "Neznámé"} />
          </div>
        </div>

       
        <div className="lg:col-span-2 bg-[#0a111a] p-6 rounded-2xl border border-[#1a2533]">
          <h2 className="text-xl font-bold mb-6 text-sky-400 border-b border-white/5 pb-2">Klíčoví hráči (Best XI)</h2>
          
          {finalXI.length === 0 ? (
            <p className="text-slate-500 italic p-4">Klub nemá na soupisce žádné hráče.</p>) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {finalXI.map((p) => (
                 <div key={p.id} className="flex items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-white/5 hover:border-sky-500/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white ">
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
          )}
        </div>
      </div>
    </div>
  );
}


function InfoRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <span className="text-slate-500 text-sm uppercase font-bold">{label}</span>
      <span className="font-semibold text-slate-200 text-right">{value}</span>
    </div>
  );
}