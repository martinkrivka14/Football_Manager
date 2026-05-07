"use client" 

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNewGameSave } from "../../../action/carrer";


type TeamProps = {
  id: number;
  name: string | null;
  logo: string | null;
  leagueId: number | null;
};

type LeagueProps = {
  id: number;
  name: string | null;
};

export default function TeamSelector({ teams, leagues }: { teams: TeamProps[]; leagues: LeagueProps[] }) {
  
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartCareer = async () => {
    if (!selectedTeamId) return;
    
    try {
      setIsLoading(true);
      
      const newSave = await createNewGameSave(selectedTeamId);
      
      router.push(`/game/page/home`); 
      
    } catch (error) {
      console.error("Chyba při vytváření hry:", error);
      alert("Jejda, něco se pokazilo při vytváření kariéry.");
    } finally {
      setIsLoading(false);
    }
  };
  
return (
  <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-8">
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
      {teams.map((team) => (
        <div
          key={team.id}
          onClick={() => setSelectedTeamId(team.id)}
          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center flex flex-col items-center justify-center min-h-[120px]
            ${
              selectedTeamId === team.id 
                ? "border-sky-400 bg-slate-800 shadow-[0_0_15px_rgba(56,189,248,0.2)] transform scale-105" 
                : "border-slate-800 bg-[#121826] hover:border-sky-500/50 hover:bg-slate-800"
            }
          `}>
          {team.logo && <img src={team.logo} alt={team.name || ""} className="h-12 mb-2 drop-shadow-lg" />}
          <span className={`font-semibold transition-colors ${selectedTeamId === team.id ? "text-white" : "text-gray-400"}`}>
            {team.name}
          </span>
          <span className={`font-semibold transition-colors ${selectedTeamId === team.id ? "text-white" : "text-gray-400"}`}>
            {leagues.find(league => league.id === team.leagueId)?.name || "Neznámá liga"}
          </span>
        </div>
      ))}
    </div>

    <button
      onClick={handleStartCareer}
      disabled={!selectedTeamId || isLoading}
      className="px-8 py-3 bg-sky-500 text-[#0f172a] font-bold rounded-xl disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:border disabled:cursor-not-allowed "
    >
      {isLoading ? "Vytvářím herní svět..." : "Potvrdit výběr a hrát"}
    </button>
    
  </div>
);
}