import { PrismaClient } from "@/app/generated/prisma";
import prisma from "../../../lib/db";

export async function updatePlayersStats() {
  
  const allTeams = await prisma.team.findMany({
    include: { players: true }
  });

  if (allTeams.length === 0) {
    throw new Error("Nemáš v databázi žádné týmy!");
  }

  let updatedCount = 0;

  for (const team of allTeams) {
    const teamSquad = team.players; 
    
    
    for (let i = 0; i < teamSquad.length; i++) {
      const player = teamSquad[i];
      
      let finalPosition = player.position;
      if (!finalPosition) {
        if (i < 2) finalPosition = "GK";
        else if (i < 9) finalPosition = "DEF";
        else if (i < 16) finalPosition = "MID";
        else finalPosition = "ATT";
      }

      let finalOverall = player.overall;
      if (!finalOverall) {
        finalOverall = Math.floor(Math.random() * 30) + 60; 
      }

      let finalAge = player.age;
      if (!finalAge) {
        finalAge = Math.floor(Math.random() * 19) + 17; 
      }

      let finalHeight = player.height;
      if (!finalHeight) {
        if (finalPosition === "GK" || finalPosition === "DEF") {
          finalHeight = Math.floor(Math.random() * 19) + 180; 
        } else {
          finalHeight = Math.floor(Math.random() * 21) + 170; 
        }
      }

      let finalWeight = player.weight;
      if (!finalWeight) {
        const baseWeight = finalHeight - 100;
        const variance = Math.floor(Math.random() * 11) - 5; 
        finalWeight = baseWeight + variance;
      }

      let finalJerseyNumber = player.jerseyNumber;
      if (!finalJerseyNumber) {
        finalJerseyNumber = i + 1; // Unikátní v rámci tohoto týmu
      }

      // Aktualizujeme hráče novými daty
      await prisma.player.update({
        where: { id: player.id },
        data: {
          position: finalPosition,
          overall: finalOverall,
          age: finalAge,
          height: finalHeight,
          weight: finalWeight,
          jerseyNumber: finalJerseyNumber
        }
      });
      
      updatedCount++;
    }
  }

  return { 
    message: "Paráda! Hráčům v týmech byly úspěšně doplněny fyzické parametry.",
    updatedPlayersCount: updatedCount 
  };
}