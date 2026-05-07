"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { calculateAllTeamsOvr } from "../../action/carrer";


type TeamStats = {
  id: string; 
  name: string; 
  logo: string | null; 
  isUserTeam: boolean;
  teamOverall: number; 
  played: number; 
  wins: number; 
  draws: number;
  losses: number; 
  goalsFor: number; 
  goalsAgainst: number; 
  points: number; 
  goalDifference: number;
};

type LeagueData = {
  id: string; 
  name: string; 
  originalLeagueId: number;
  teams: TeamStats[];
};


export default function LeagueClient({ 
  leagues, 
  userLeagueId, 
  saveId 
}: { 
  leagues: LeagueData[], 
  userLeagueId: string | null, 
  saveId: string 
}) {

  const sortedLeagues = [...leagues].sort((a, b) => 
    (a.originalLeagueId || 0) - (b.originalLeagueId || 0)
  );
  const [activeLeagueId, setActiveLeagueId] = useState<string>(userLeagueId || leagues[0]?.id);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const router = useRouter();

  const activeLeague = leagues.find(l => l.id === activeLeagueId);


  const sortedTeams = activeLeague ? [...activeLeague.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.teamOverall - a.teamOverall; 
  }) : [];

  const handleCalculateOVR = async () => {
    setIsCalculating(true);
    await calculateAllTeamsOvr(saveId);
    setIsCalculating(false);
    router.refresh(); 
  };


  return (
    <div className="flex flex-col h-full bg-[#0a111a] p-6 rounded-xl border border-[#1a2533]">
      
    
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {sortedLeagues.map(league => (
          <button
            key={league.id}
            onClick={() => setActiveLeagueId(league.id)}
            className={`px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap
              ${activeLeagueId === league.id 
                ? "bg-sky-600 text-white" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
          >
            {league.name}
          </button>
        ))}
      </div>


      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-sky-400">{activeLeague?.name}</h2>
        <button 
          onClick={handleCalculateOVR} 
          disabled={isCalculating}
          className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded hover:bg-slate-600 disabled:opacity-50"
        >
          {isCalculating ? "Počítám..." : "Přepočítat OVR ostatních týmů"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm text-slate-300 select-none">
          <thead className="bg-[#121c2a] text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 w-12 text-center">#</th>
              <th className="px-4 py-3">Tým</th>
              <th className="px-4 py-3 text-center" title="Týmový Overall">OVR</th>
              <th className="px-4 py-3 text-center">Z</th>
              <th className="px-4 py-3 text-center">V</th>
              <th className="px-4 py-3 text-center">R</th>
              <th className="px-4 py-3 text-center">P</th>
              <th className="px-4 py-3 text-center">Skóre</th>
              <th className="px-4 py-3 text-center font-bold text-sky-400">Body</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => (
              <tr 
                key={team.id} 
                className={`border-t border-slate-800 hover:bg-slate-800/50 transition-colors
                  ${team.isUserTeam ? "bg-sky-900/20" : ""}`}
              >
                <td className="px-4 py-3 text-center font-bold">{index + 1}.</td>
                
              
                <td className="px-4 py-3 flex items-center gap-3">
                  {team.logo ? (
                    <img src={team.logo} alt="logo" className="w-6 h-6 object-contain" />) : (
                    <div className="w-6 h-6 bg-slate-800 rounded-full flex-shrink-0"></div>)}
                  <Link 
                    href={`/game/page/league/${team.id}`} 
                    className={`hover:underline transition-colors truncate 
                    ${team.isUserTeam ? "font-bold text-sky-400" : "font-medium text-white hover:text-sky-400"
                    }`}>
                    {team.name || "Neznámý tým"}
                  </Link>
                </td>
                
                <td className="px-4 py-3 text-center font-mono text-slate-500">{team.teamOverall}</td>
                <td className="px-4 py-3 text-center">{team.played}</td>
                <td className="px-4 py-3 text-center">{team.wins}</td>
                <td className="px-4 py-3 text-center">{team.draws}</td>
                <td className="px-4 py-3 text-center">{team.losses}</td>
                <td className="px-4 py-3 text-center">{team.goalsFor}:{team.goalsAgainst}</td>
                <td className="px-4 py-3 text-center font-bold text-sky-400 text-base">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}