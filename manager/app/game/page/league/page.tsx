import prisma from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import LeagueClient from "./LeagueClient";

export default async function LeaguePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return <div>Nejsi přihlášen.</div>;


  const activeSave = await prisma.gameSave.findFirst({
    where: { userId: userId },
    include: {
      userTeam: true,
      teams: {
        include: {
          originalTeam: {
            include: {
              league: true 
            }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  if (!activeSave || !activeSave.userTeam) return notFound();


  const leaguesMap = new Map();

  activeSave.teams.forEach(saveTeam => {
    const globalLeague = saveTeam.originalTeam?.league;
    const leagueId = globalLeague?.id.toString() || "unknown";
    const leagueName = globalLeague?.name || "Ostatní (bez ligy)";

    if (!leaguesMap.has(leagueId)) {
      leaguesMap.set(leagueId, {
        id: leagueId,
        name: leagueName,
        teams: []
      });
    }

    
    leaguesMap.get(leagueId).teams.push({
      id: saveTeam.id,
      name: saveTeam.originalTeam.name || "Neznámý tým",
      logo: saveTeam.originalTeam.logo,
      isUserTeam: saveTeam.id === activeSave.userTeamId,
      teamOverall: saveTeam.teamOverall,
      played: saveTeam.played,
      wins: saveTeam.wins,
      draws: saveTeam.draws,
      losses: saveTeam.losses,
      goalsFor: saveTeam.goalsFor,
      goalsAgainst: saveTeam.goalsAgainst,
      points: saveTeam.points,
      goalDifference: saveTeam.goalsFor - saveTeam.goalsAgainst
    });
  });

  
  const formattedLeagues = Array.from(leaguesMap.values());

  
  let userLeagueId = null;  
  formattedLeagues.forEach(league => {
    if ((league.teams as { isUserTeam: boolean }[]).some((t: { isUserTeam: boolean }) => t.isUserTeam)) {
      userLeagueId = league.id;
    }
  });

  return (
    <div className="p-8 h-full flex flex-col bg-[#05080f]">
      <h1 className="text-3xl font-bold text-white mb-6">Ligové soutěže</h1>
      <LeagueClient 
        leagues={formattedLeagues} 
        userLeagueId={userLeagueId} 
        saveId={activeSave.id}
      />
    </div>
  );
}