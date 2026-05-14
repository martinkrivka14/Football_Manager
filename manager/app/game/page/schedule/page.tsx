import prisma from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import ScheduleClient from "./ScheduleClient";
import NavMenuGame from "../../menu/navMenu";


export default async function Schedule() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/component_reg_log");

   const inGameDateResult = await prisma.gameSave.findFirst({
    where: { userId: userId },
    select: { inGameDate: true },
    orderBy: { updatedAt: 'desc' }
  });


 
  const activeSave = await prisma.gameSave.findFirst({
    where: { userId: userId },
    include: {
      userTeam: true,
    },
    orderBy: { updatedAt: 'desc' }
  });

  if (!activeSave || !activeSave.userTeam) return notFound();

  const userTeamId = activeSave.userTeam.id;
  const userLeagueId = activeSave.userTeam.saveLeagueId;

  if (!userLeagueId) {
    return <div className="p-8 text-white">Tvůj tým nehraje v žádné lize!</div>;
  }


  const matches = await prisma.saveMatch.findMany({
    where: { 
      saveLeagueId: userLeagueId,
      gameSaveId: activeSave.id
    },
    include: {
      homeTeam: {
        include: { originalTeam: true }
      },
      awayTeam: {
        include: { originalTeam: true }
      }
    },
    orderBy: [
      { round: 'asc' },
      { date: 'asc' }
    ]
  });

  const currentRound = await prisma.saveLeague.findFirst({
    where: { gameSaveId: matches.length > 0 ? matches[0].homeTeam.gameSaveId : undefined },
    select: { currentRound: true }
  });


  const maxRound = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 38;

  return (
    <div className="p-8 h-full flex flex-col bg-[#05080f] min-h-screen">
      <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-6">
        Rozpis Zápasů 
      </h1>

      {/* <NavMenuGame /> */}
      
      <ScheduleClient 
        matches={matches} 
        userTeamId={userTeamId} 
        maxRound={maxRound}
        inGameDate={inGameDateResult}
        currentRound={currentRound ? currentRound.currentRound : 1}
      />
    </div>
  );
}