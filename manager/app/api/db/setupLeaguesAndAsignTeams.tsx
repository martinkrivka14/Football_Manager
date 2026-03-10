import prisma from "../../../lib/db";

export async function setupLeaguesAndAssignTeams() {
  // 1. Definujeme anglickou hierarchii
  const leagueNames = [
    "Premier League",
    "Championship",
    "League One",
    "League Two"
  ];

  const createdLeagues = [];

  // Vytvoříme (nebo najdeme) ligy v DB
  for (const name of leagueNames) {
    let league = await prisma.league.findFirst({ where: { name } });
    if (!league) {
      league = await prisma.league.create({ data: { name } });
    }
    createdLeagues.push(league);
  }

  // 2. Načteme všechny týmy
  const allTeams = await prisma.team.findMany();
  
  if (allTeams.length === 0) {
    throw new Error("Nemáš v databázi žádné týmy!");
  }

  const TEAMS_PER_LEAGUE = 20;
  let currentTeamIndex = 0;

  // 3. Přiřadíme týmy do lig (po 20)
  for (const league of createdLeagues) {
    const teamsForThisLeague = allTeams.slice(currentTeamIndex, currentTeamIndex + TEAMS_PER_LEAGUE);
    
    if (teamsForThisLeague.length === 0) break; // Došly nám týmy

    for (const team of teamsForThisLeague) {
      await prisma.team.update({
        where: { id: team.id },
        data: { leagueId: league.id }
      });
    }

    currentTeamIndex += TEAMS_PER_LEAGUE;
    console.log(`Liga ${league.name} byla naplněna ${teamsForThisLeague.length} týmy.`);
  }

  // 4. Smazání přebytečných týmů (pokud nějaké zbyly)
  const leftoverTeams = allTeams.slice(currentTeamIndex);
  
  if (leftoverTeams.length > 0) {
    const leftoverTeamIds = leftoverTeams.map(t => t.id);

    // Abychom mohli smazat tým, musíme nejdřív smazat jeho hráče a stadiony (Foreign Key constraints)
    await prisma.player.deleteMany({
      where: { teamId: { in: leftoverTeamIds } }
    });

    await prisma.venue.deleteMany({
      where: { teamId: { in: leftoverTeamIds } }
    });

    // Nakonec smažeme samotné týmy
    await prisma.team.deleteMany({
      where: { id: { in: leftoverTeamIds } }
    });

    console.log(`Smazáno ${leftoverTeams.length} přebytečných týmů a jejich hráčů.`);
  }

  return { 
    message: "Ligy byly vytvořeny, týmy rozřazeny a přebytečná data smazána!",
    leaguesCreated: createdLeagues.length,
    teamsDeleted: leftoverTeams.length
  };
}