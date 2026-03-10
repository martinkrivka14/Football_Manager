import prisma from "../../../lib/db";

export async function assignPlayersToTeamsLogic() {
  const availablePlayers = await prisma.player.findMany({
    where: { teamId: null }
  });
  const allTeams = await prisma.team.findMany();

  if (allTeams.length === 0) {
    throw new Error("Nemáš v databázi žádné týmy k naplnění!");
  }

  let playerIndex = 0;
  const PLAYERS_PER_TEAM = 22;
  let updatedCount = 0;

  for (const team of allTeams) {
    const teamSquad = availablePlayers.slice(playerIndex, playerIndex + PLAYERS_PER_TEAM);
    
    if (teamSquad.length === 0) break;

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

      await prisma.player.update({
        where: { id: player.id },
        data: {
          teamId: team.id,
          position: finalPosition,
          overall: finalOverall
        }
      });
      
      updatedCount++;
    }
    playerIndex += PLAYERS_PER_TEAM;
  }

  return { 
    message: "Paráda! Skript doběhl do konce.",
    updatedPlayersCount: updatedCount 
  };
}