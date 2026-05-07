import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

export default async function VenueDetailPage({ 
  params 
}: { 
  params: Promise<{ venueId: string }> 
}) {
  
  const resolvedParams = await params;

  const currentVenueId = Number(resolvedParams.venueId);

  if (isNaN(currentVenueId)) return notFound();


  const venue = await prisma.venue.findUnique({
    where: { id: currentVenueId },
    include: {
      team: true
    }
  });

  if (!venue) return notFound();

  const session = await auth();
  const userId = session?.user?.id;


  let saveTeamId = null;
  
  if (userId && venue.teamId) {
    const activeSaveTeam = await prisma.saveTeam.findFirst({
      where: {
        originalTeamId: venue.teamId,
        gameSave: {
          userId: userId 
        }
      },
      select: { id: true } 
    });
    
    saveTeamId = activeSaveTeam?.id;
  }

  return (
    <div className="p-8 bg-[#05080f] min-h-screen text-white flex flex-col gap-8">
      
      <div className="bg-[#0a111a] p-8 rounded-2xl border border-[#1a2533] flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-8">
          
          <div className="w-64 h-36 bg-black/20 p-2 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden shadow-inner">
             {venue.image && venue.image !== "null" ? (
               <img src={venue.image} alt="Stadion" className="w-full h-full object-cover rounded-lg" />
             ) : (
               <span className="font-bold text-slate-500 text-xl">STADION</span>
             )}
          </div>
          
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">
              {venue.name || "Neznámý stadion"}
            </h1>
            <div className="flex gap-4 mt-4">
               <span className="bg-sky-500/20 text-sky-400 px-3 py-1 rounded text-sm font-bold border border-sky-500/30">
                 KAPACITA: {venue.capacity ? new Intl.NumberFormat('cs-CZ').format(venue.capacity) : "Neznámá"}
               </span>
               <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-sm font-bold border border-emerald-500/30 uppercase">
                 POVRCH: {venue.surface || "Neznámý"}
               </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        

        <div className="bg-[#0a111a] p-6 rounded-2xl border border-[#1a2533] h-fit">
          <h2 className="text-xl font-bold mb-6 text-sky-400 border-b border-white/5 pb-2">Detailní informace</h2>
          <div className="space-y-4">
             <InfoRow label="Město" value={venue.city || "Neznámé"} />
             <InfoRow label="Adresa" value={venue.address || "Neznámá"} />
             <InfoRow label="Kapacita" value={venue.capacity ? `${new Intl.NumberFormat('cs-CZ').format(venue.capacity)} diváků` : "Neznámá"} />
             <InfoRow label="Typ povrchu" value={venue.surface === "grass" ? "Přírodní tráva" : venue.surface || "Neznámý"} />
          </div>
        </div>

        <div className="bg-[#0a111a] p-6 rounded-2xl border border-[#1a2533] h-fit flex flex-col justify-center items-center text-center py-12">
           <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Domovský stánek týmu</h2>
           
           {venue.team ? (
             <>
                {venue.team.logo && (
                  <img src={venue.team.logo} alt="Logo týmu" className="w-24 h-24 object-contain mb-4" />
                )}
                <h3 className="text-3xl font-black text-white italic">{venue.team.name}</h3>

                <Link 
                  href={`/game/page/league/${saveTeamId}`}
                  className="mt-6 bg-slate-800 hover:bg-sky-600 text-white px-6 py-2 rounded-full font-bold transition-all"
                >
                  Zpět na profil klubu
                </Link>
             </>) : (
             <p className="text-slate-400 italic">Tento stadion aktuálně nevyužívá žádný tým.</p>)}
        </div>

      </div>
    </div>
  );
}


function InfoRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5">
      <span className="text-slate-500 text-sm uppercase font-bold">{label}</span>
      <span className="font-semibold text-slate-200 text-right">{value}</span>
    </div>
  );
}