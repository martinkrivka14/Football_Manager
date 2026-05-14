function shuffleArray(array: any[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getMatchDate(baseRoundDate: Date) {
  const matchDate = new Date(baseRoundDate);
  const randomDate = Math.random();
  const randomTimeWeekday = Math.random();
  const randomTimeWeekend  = Math.random();

  const friday = 0.10;
  const saturday = 0.50;
  const sunday = 0.95;


  if (randomDate < friday) {
    matchDate.setHours(20, 30, 0, 0);

  } else if (randomDate < saturday) {
    matchDate.setDate(matchDate.getDate() + 1);

  } else if (randomDate < sunday) {
    matchDate.setDate(matchDate.getDate() + 2);

  } else {
    matchDate.setDate(matchDate.getDate() + 3);
  }

  if(randomDate < friday || randomDate >= sunday) {
    if(randomTimeWeekday < 0.25) {
        matchDate.setHours(19, 0, 0, 0);

    } else if(randomTimeWeekday < 0.50) {
        matchDate.setHours(20, 0, 0, 0);

    } else if(randomTimeWeekday < 0.75) {
        matchDate.setHours(21, 0, 0, 0);

    } else {
        matchDate.setHours(18, 0, 0, 0);
    }
  }else{
    if(randomTimeWeekend < 0.25) {
        matchDate.setHours(14, 0, 0, 0);
    } else if(randomTimeWeekend < 0.50) {
        matchDate.setHours(16, 0, 0, 0);
    } else if(randomTimeWeekend < 0.75) {
        matchDate.setHours(18, 0, 0, 0);
    } else {
        matchDate.setHours(20, 0, 0, 0);
    }
  }


  return matchDate;
}

export async function generateFixturesForAllLeagues(
  gameSaveId: string, 
  tx: any 
) {
  
  const saveLeagues = await tx.saveLeague.findMany({
    where: { gameSaveId: gameSaveId },
    include: { saveTeams: true }
  });

  interface MatchToInsert {
    gameSaveId: string;
    saveLeagueId: number;
    round: number;
    date: Date;
    homeTeamId: number;
    awayTeamId: number;
    status: string;
  }

  const allMatchesToInsert: MatchToInsert[] = [];

  const seasonStartDate = new Date("2026-08-14T00:00:00Z");

  for (const league of saveLeagues) {
    let teams = shuffleArray(league.saveTeams);
    
    if (teams.length % 2 !== 0) {
      teams.push(null);
    }

    const numTeams = teams.length;
    const numRoundsHalf = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    let currentTeams = [...teams];

    
    for (let round = 0; round < numRoundsHalf; round++) {
      
      
      const roundBaseDate = new Date(seasonStartDate);
      roundBaseDate.setDate(seasonStartDate.getDate() + (round * 7));

      for (let match = 0; match < matchesPerRound; match++) {
        let homeTeam = currentTeams[match];
        let awayTeam = currentTeams[numTeams - 1 - match];

        
        if (match === 0) {
         
          if (round % 2 === 1) {
            const temp = homeTeam;
            homeTeam = awayTeam;
            awayTeam = temp;
          }
        } else {
 
          if (match % 2 === 1) {
            const temp = homeTeam;
            homeTeam = awayTeam;
            awayTeam = temp;
          }
        }

        if (homeTeam !== null && awayTeam !== null) {
          allMatchesToInsert.push({
            gameSaveId: gameSaveId,
            saveLeagueId: league.id,
            round: round + 1, 
            date: getMatchDate(roundBaseDate), 
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            status: "SCHEDULED"
          });
        }
      }

      currentTeams = [
        currentTeams[0],
        currentTeams[numTeams - 1],
        ...currentTeams.slice(1, numTeams - 1)
      ];
    }

    const firstHalfMatches = allMatchesToInsert.filter(
      m => m.saveLeagueId === league.id && m.round <= numRoundsHalf
    );

    for (const match of firstHalfMatches) {
      const secondHalfRound = match.round + numRoundsHalf; 
      
      const roundBaseDate = new Date(seasonStartDate);
      roundBaseDate.setDate(seasonStartDate.getDate() + ((secondHalfRound - 1) * 7));

      allMatchesToInsert.push({
        gameSaveId: gameSaveId,
        saveLeagueId: league.id,
        round: secondHalfRound,
        date: getMatchDate(roundBaseDate), 
        homeTeamId: match.awayTeamId, 
        awayTeamId: match.homeTeamId, 
        status: "SCHEDULED"
      });
    }

    await tx.saveLeague.update({
      where: { id: league.id },
      data: { totalRounds: numRoundsHalf * 2 }
    });
  }

  if (allMatchesToInsert.length > 0) {
    await tx.saveMatch.createMany({
      data: allMatchesToInsert
    });
  }
}