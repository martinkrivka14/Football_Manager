import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import TeamSelector from "../home/components/TeamSelector";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});


export default async function CreateGamePage() {

  const allGlobalTeams = await prisma.team.findMany({
    select: { id: true, name: true, logo: true, leagueId: true },
    orderBy: { id: 'asc' }
  });
  
  const allGlobalLeagues = await prisma.league.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' }
  });;

    return(
    <div className="min-h-screen p-8 bg-slate-950 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-white mb-2 tracking-wide">
        Nová Kariéra
      </h1>
      <p className="text-slate-400 mb-8">
        Vyber si tým, který chceš dovést ke slávě.
        
      </p>
        <>
        <TeamSelector teams={allGlobalTeams} leagues={allGlobalLeagues} />
        </>
    </div>
    );
}
