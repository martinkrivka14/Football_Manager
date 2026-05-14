"use server"

import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateFixturesForAllLeagues } from "./scheduleGenerator";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type PlayerUpdateData = {
  id: string;
  squadRole: string;
  pitchPosition: string | null;
};


export async function saveLineup(saveId: string, teamId: string, playerUpdates: PlayerUpdateData[], teamOverall: number) {
  try {
    await prisma.$transaction(async (tx) => {
      let lineup = await tx.saveLineup.findFirst({
        where: { saveTeamId: teamId }
      });

      if (!lineup) {
        lineup = await tx.saveLineup.create({
          data: {
            gameSaveId: saveId,
            saveTeamId: teamId,
            name: "Výchozí Sestava"
          }
        });
      }

      await tx.saveLineupEntry.deleteMany({
        where: { saveLineupId: lineup.id }
      });

      const newEntries = playerUpdates
        .filter(p => p.squadRole !== "RESERVE")
        .map(p => ({
          saveLineupId: lineup!.id,
          savePlayerId: p.id,
          role: p.squadRole,
          pitchPosition: p.pitchPosition
        }));

      if (newEntries.length > 0) {
        await tx.saveLineupEntry.createMany({
          data: newEntries
        });
      }
      
      await tx.saveTeam.update({
        where: { id: teamId },
        data: { teamOverall: teamOverall }
      });
    });

    revalidatePath("/game/page/team");
    return { success: true };
  } catch (error) {
    console.error("Chyba při ukládání sestavy:", error);
    return { success: false, error: "Nepodařilo se uložit sestavu." };
  }
}

export async function createNewGameSave(selectedGlobalTeamId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Musíš být přihlášen pro vytvoření hry.");

  const userId = session.user.id; 

  const selectedGlobalTeam = await prisma.team.findUnique({
    where: { id: selectedGlobalTeamId },
  });

  if (!selectedGlobalTeam) throw new Error("Vybraný tým neexistuje.");

  const globalLeagues = await prisma.league.findMany({
    include: {
      teams: {
        include: {
          players: true,
        },
      },
    },
  });

  const newSave = await prisma.$transaction(async (tx: any) => {

    const gameSave = await tx.gameSave.create({
      data: {
        userId,
        saveName: `Kariéra - ${selectedGlobalTeam.name ?? "Nová hra"}`,
        inGameDate: new Date("2026-08-01"),
      },
    });

    let newManagedTeamId: string | null = null;

    for (const gLeague of globalLeagues) {

      const saveLeague = await tx.saveLeague.create({
        data: {
          gameSaveId: gameSave.id,
          originalLeagueId: gLeague.id,
        },
      });

      const teamPromises = gLeague.teams.map(async (gTeam) => {
        
        const saveTeam = await tx.saveTeam.create({
          data: {
            gameSaveId: gameSave.id,
            originalTeamId: gTeam.id,
            saveLeagueId: saveLeague.id,
            budget: 15_000_000,
          },
        });

        if (gTeam.id === selectedGlobalTeamId) {
          newManagedTeamId = saveTeam.id;
        }

        if (gTeam.players.length > 0) {
          await tx.savePlayer.createMany({
            data: gTeam.players.map((gPlayer) => ({
              gameSaveId: gameSave.id,
              originalPlayerId: gPlayer.id,
              saveTeamId: saveTeam.id,
              overall: gPlayer.overall,
              age: gPlayer.age,
            })),
          });
        }
      });

      await Promise.all(teamPromises);
    }


    await generateFixturesForAllLeagues(gameSave.id, tx);

    if (newManagedTeamId) {
      await tx.gameSave.update({
        where: { id: gameSave.id },
        data: { userTeamId: newManagedTeamId },
      });
    }
    
    return gameSave;
    
  }, {
    maxWait: 5000,
    timeout: 30000 
  });   
  
  return newSave;
}
  

export async function calculateAllTeamsOvr(saveId: string) {
  try {
    const allTeams = await prisma.saveTeam.findMany({
      where: { gameSaveId: saveId },
      include: { 
        players: { include: { originalPlayer: true } },
        originalTeam: { include: { players: true } } 
      }
    });

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

    const updates = allTeams.map(team => {
      const players = team.players.length > 0 
        ? team.players.map(p => ({ ovr: p.overall || p.originalPlayer?.overall || 0, pos: p.originalPlayer?.position }))
        : team.originalTeam?.players.map(p => ({ ovr: p.overall || 0, pos: p.position })) || [];

      let teamOvr = 0;

      if (players.length === 0) {
        teamOvr = 60; 
      } else {
        const gks = players.filter(p => getCat(p.pos) === 'GK').sort((a, b) => b.ovr - a.ovr);
        const defs = players.filter(p => getCat(p.pos) === 'DEF').sort((a, b) => b.ovr - a.ovr);
        const mids = players.filter(p => getCat(p.pos) === 'MID').sort((a, b) => b.ovr - a.ovr);
        const atts = players.filter(p => getCat(p.pos) === 'ATT').sort((a, b) => b.ovr - a.ovr);
        const unis = players.filter(p => getCat(p.pos) === 'UNI').sort((a, b) => b.ovr - a.ovr);

        const selectedPlayers: number[] = [];
        const PENALTY = 40;

        const pickPlayer = (mainPool: {ovr: number}[], fallbackPool: {ovr: number}[]) => {
          if (mainPool.length > 0) return mainPool.shift()!.ovr;
          if (fallbackPool.length > 0) return fallbackPool.shift()!.ovr;
          return PENALTY;
        };
        
        selectedPlayers.push(pickPlayer(gks, unis)); 
        for (let i = 0; i < 4; i++) selectedPlayers.push(pickPlayer(defs, unis)); 
        for (let i = 0; i < 3; i++) selectedPlayers.push(pickPlayer(mids, unis)); 
        for (let i = 0; i < 3; i++) selectedPlayers.push(pickPlayer(atts, unis)); 

        teamOvr = Math.round(selectedPlayers.reduce((a, b) => a + b, 0) / 11);
      }

      return prisma.saveTeam.update({
        where: { id: team.id },
        data: { teamOverall: teamOvr }
      });
    });

    await prisma.$transaction(updates);
    revalidatePath("/game/page/league");
    
    return { success: true };
  } catch (error) {
    console.error("Kritická chyba při výpočtu:", error);
    return { success: false };
  }
}