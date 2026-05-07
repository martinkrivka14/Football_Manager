import prisma from "../../../lib/db";

export async function fillEmptyTeamsWithRegens() {
  const allTeams = await prisma.team.findMany({
    include: { players: true }
  });

  const PLAYERS_PER_TEAM = 22;
  let generatedCount = 0;

  const FIRST_NAMES = ["Jack", "Harry", "Jacob", "Charlie", "Thomas", "George", "Oscar", "James", "William", "Oliver", "Leo", "Arthur"];
  const LAST_NAMES = ["Smith", "Jones", "Taylor", "Brown", "Williams", "Davies", "Evans", "Wilson", "Johnson", "Roberts", "Robinson", "Wright"];
  const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

  for (const team of allTeams) {
    const currentCount = team.players.length;
    
  
    if (currentCount >= PLAYERS_PER_TEAM) continue;

    const needed = PLAYERS_PER_TEAM - currentCount;
    const newPlayers = [];

    for (let i = 0; i < needed; i++) {
      const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      
      const position = POSITIONS[i % POSITIONS.length];

      
      const height = position === "Goalkeeper" || position === "Defender" 
        ? Math.floor(Math.random() * 19) + 180 
        : Math.floor(Math.random() * 21) + 170;
        
      const weight = (height - 100) + (Math.floor(Math.random() * 11) - 5);

      newPlayers.push({
        teamId: team.id,
        name: `${fName} ${lName}`,
        firstname: fName,
        lastname: lName,
        age: Math.floor(Math.random() * 19) + 17,
        nationality: team.country || "England",
        height: height,
        weight: weight,
        jerseyNumber: currentCount + i + 1,
        position: position,
        overall: Math.floor(Math.random() * 15) + 55, 
        photo: "null"
      });
    }

    if (newPlayers.length > 0) {
      await prisma.player.createMany({
        data: newPlayers
      });
      generatedCount += needed;
    }
  }

  console.log(`Doplnění hotovo. Vygenerováno celkem ${generatedCount} hráčů.`);
  return { 
    message: "Hráči úspěšně doplněni!", 
    generatedPlayersCount: generatedCount 
  };
}