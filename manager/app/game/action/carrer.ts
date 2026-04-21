"use server"

import { PrismaClient } from "@/prisma/..app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});


type PlayerUpdateData = {
  id: string;
  squadRole: string;
  pitchPosition: string | null;
};


export async function saveLineup(saveId: string, teamId: string, playerUpdates: PlayerUpdateData[]) {
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

  const newSave = await prisma.$transaction(async (tx) => {

    const gameSave = await tx.gameSave.create({
      data: {
        userId,
        saveName: `Kariéra - ${selectedGlobalTeam.name ?? "Nová hra"}`,
        inGameDate: new Date("2025-07-01"),
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

      for (const gTeam of gLeague.teams) {

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
      }
    }

    if (newManagedTeamId) {
      await tx.gameSave.update({
        where: { id: gameSave.id },
        data: { userTeamId: newManagedTeamId },
      });
    }

    return gameSave;
  });

    
  return newSave;
}