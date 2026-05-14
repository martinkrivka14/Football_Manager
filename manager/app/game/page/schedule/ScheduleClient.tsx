"use client";


import { prisma } from "@/prisma";
import { redirect } from "next/navigation";
import { useState } from "react";

type MatchData = {
  id: string;
  round: number;
  date: Date;
  status: string;
  scoreHome: number | null;
  scoreAway: number | null;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: { originalTeam: { name: string | null; logo: string | null; } | null; };
  awayTeam: { originalTeam: { name: string | null; logo: string | null; } | null; };
};

export default  function ScheduleClient({ 
  matches, 
  userTeamId,
  maxRound,
  inGameDate,
  currentRound
}: { 
  matches: MatchData[], 
  userTeamId: string,
  maxRound: number,
  inGameDate: { inGameDate: Date | null } | null
  currentRound: number | null
}) {

  const currentRoundToCompare = currentRound && currentRound > 0 ? currentRound : 1;
 
  const [activeTab, setActiveTab] = useState<"my-matches" | "league" | "calendar">("my-matches");
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<Date>(inGameDate && inGameDate.inGameDate ? inGameDate.inGameDate : new Date());
  const [selectedYear, setSelectedYear] = useState<number>(inGameDate && inGameDate.inGameDate ? inGameDate.inGameDate.getFullYear() : new Date().getFullYear());

  const myMatches = matches.filter(m => m.homeTeamId === userTeamId || m.awayTeamId === userTeamId);
  
  const roundMatches = matches.filter(m => m.round === selectedRound);

  const formatMatchDate = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatMatchMonth = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      month: 'long'
    }).format(date);
  };

  const showMatchInfo = (match: MatchData) => {
    alert(`Zápas: ${match.homeTeam.originalTeam?.name} vs ${match.awayTeam.originalTeam?.name}
      \nDatum: ${formatMatchDate(match.date)}
      \nSkóre: ${match.scoreHome !== null && match.scoreAway !== null ? `${match.scoreHome} : ${match.scoreAway}` : "Zatím neodehráno"}`);
  };


  
 


  if (matches.length === 0) {
    return (
      <div className="bg-[#0a111a] p-8 rounded-xl border border-[#1a2533] text-center text-slate-400">
        Kalendář je prázdný. Přešel jsi z rozehraného savu bez vygenerovaných zápasů? Založ novou kariéru!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex gap-4 border-b border-white/5 pb-4">
        <button 
          onClick={() => {
            setActiveTab("my-matches");
            setSelectedYear(inGameDate && inGameDate.inGameDate ? inGameDate.inGameDate.getFullYear() : new Date().getFullYear());
            setSelectedMonth(inGameDate && inGameDate.inGameDate ? inGameDate.inGameDate : new Date());
            }  
          }
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            activeTab === "my-matches" 
              ? "bg-sky-600 text-white" 
              : "bg-slate-800 text-slate-400 hover:text-white"}`}>
          Můj kalendář
        </button>
        <button 
          onClick={() => {
            setActiveTab("league");
            setSelectedYear(inGameDate && inGameDate.inGameDate ? inGameDate.inGameDate.getFullYear() : new Date().getFullYear());
            setSelectedMonth(inGameDate && inGameDate.inGameDate ? inGameDate.inGameDate : new Date());
          }
            }
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            activeTab === "league" 
              ? "bg-sky-600 text-white "
              : "bg-slate-800 text-slate-400 hover:text-white"}`}>
          Kompletní rozpis ligy
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            activeTab === "calendar"
              ? "bg-sky-600 text-white "
              : "bg-slate-800 text-slate-400 hover:text-white"}`}>
          Kalendář
        </button>
        <button>
          <span className="font-mono font-bold text-emerald-400">
            Herní datum: {inGameDate && inGameDate.inGameDate ? inGameDate.inGameDate.toLocaleDateString('cs-CZ') : "N/A"}
          </span>
        </button>
      </div>

      {activeTab === "my-matches" && (
        <div className="bg-[#0a111a] p-6 rounded-2xl border border-[#1a2533]">
          <h2 className="text-xl font-bold mb-6 text-sky-400 border-b border-white/5 pb-2">Všechny mé zápasy</h2>
          <div className="space-y-3">
            {myMatches.map(match => (
              <MatchRow key={match.id} match={match} userTeamId={userTeamId} formatMatchDate={formatMatchDate} currentRound={currentRoundToCompare} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "league" && (
        <div className="bg-[#0a111a] p-6 rounded-2xl border border-[#1a2533] flex flex-col gap-6">
          
          <div className="flex items-center justify-between bg-[#121c2a] p-2 rounded-xl border border-white/5">
            <button 
              onClick={() => setSelectedRound(Math.max(1, selectedRound - 1))}
              disabled={selectedRound === 1}
              className="px-4 py-2 bg-slate-800 rounded-lg font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-all">
              &laquo; Předchozí
            </button>
            
            <h2 className="text-xl font-black text-white italic tracking-widest">
              {selectedRound}. KOLO
            </h2>
            
            <button 
              onClick={() => setSelectedRound(Math.min(maxRound, selectedRound + 1))}
              disabled={selectedRound === maxRound}
              className="px-4 py-2 bg-slate-800 rounded-lg font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-all"
            >
              Další &raquo;
            </button>
          </div>

          <div className="space-y-3">
            {roundMatches.map(match => (
              <MatchRow key={match.id} match={match} userTeamId={userTeamId} formatMatchDate={formatMatchDate} currentRound={currentRoundToCompare} />
            ))}
          </div>
        </div>
      )}
      {activeTab === "calendar" && (
        <div className="bg-[#0a111a] p-6 rounded-2xl border border-[#1a2533]">
           <div className="flex items-center justify-between bg-[#121c2a] p-2 rounded-xl border border-white/5">
            <button 
              onClick={() => {
                const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
                setSelectedMonth(date);
                setSelectedYear(date.getFullYear());
              }}
              disabled={selectedMonth.getMonth() === 7 && selectedMonth.getFullYear() === 2026}
              className="px-4 py-2 bg-slate-800 rounded-lg font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-all">
              &laquo; Předchozí
            </button>
            
            <h2 className="text-xl font-black text-white italic tracking-widest">
              {formatMatchMonth(selectedMonth)} {selectedYear}
            </h2>
            
            <button 
              onClick={() => {
                const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
                setSelectedMonth(date);
                setSelectedYear(date.getFullYear());
              }}
              className="px-4 py-2 bg-slate-800 rounded-lg font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-all"
            >
              Další &raquo;
            </button>
          </div>
          <div>
            <div className="grid grid-cols-7 gap-0 text-sm text-slate-400 border-b border-white/5 pb-2 mb-2">
              <div className="text-center py-2">Monday</div>
              <div className="text-center py-2">Tuesday</div>
              <div className="text-center py-2">Wednesday</div>
              <div className="text-center py-2">Thursday</div>
              <div className="text-center py-2">Friday</div>
              <div className="text-center py-2">Saturday</div>
              <div className="text-center py-2">Sunday</div>
            </div>

            {(() => {
              const year = selectedMonth.getFullYear();
              const month = selectedMonth.getMonth();
              const firstDay = new Date(year, month, 1);
              const startIndex = (firstDay.getDay() + 6) % 7; 
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const totalDays = daysInMonth;
              let totalCells = 42; 

              if(startIndex <= 4 || totalDays <= 29){
                totalCells = 35;
              }if(totalDays === 28 && startIndex === 0){
                totalCells = 28;
              }
              const isSameDate = (a?: Date | null, b?: Date | null) => {
                if (!a || !b) return false;
                const da = new Date(a);
                const db = new Date(b);
                return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
              };

              const matchesForDay = (d: Date) => {
                return myMatches.filter(m => {
                  const md = new Date(m.date);
                  return md.getFullYear() === d.getFullYear() && md.getMonth() === d.getMonth() && md.getDate() === d.getDate();
                });
              };

              const cells = [] as any[];
              let dayCounter = 1;
              for (let i = 0; i < totalCells; i++) {
                if (i >= startIndex && dayCounter <= totalDays) {
                  const d = new Date(year, month, dayCounter);
                  const dayMatches = matchesForDay(d);
                  const isInGameDate = inGameDate && inGameDate.inGameDate ? isSameDate(inGameDate.inGameDate, d) : false;

                  cells.push(
                    <div key={i} className={`min-h-[80px] border border-white/5 p-2 bg-[#0a0f15] ${isInGameDate ? 'ring-2 ring-emerald-500/40' : ''}`}>
                      <div className="text-xs text-slate-400 mb-1">{d.getDate()}</div>
                      <div className="space-y-1">
                        {dayMatches.map(m => (
                          <div key={m.id} className="bg-sky-600 text-white text-xs rounded px-2 py-1 truncate">
                            <button
                            onClick={ () => showMatchInfo(m) }>
                              {m.homeTeam.originalTeam?.name} vs {m.awayTeam.originalTeam?.name} {m.date ? `${new Date(m.date).getHours()}:00` : ''}
                            </button>
                          </div>
                          
                        ))}
                      </div>
                    </div>
                  );
                  dayCounter++;
                } else {
                  cells.push(
                    <div key={i} className="min-h-[80px] border border-white/5 p-2 bg-[#0a0f15]"></div>
                  );
                }
              }

              return <div className="grid grid-cols-7 gap-0">{cells}</div>;
            })()}
          </div>
        </div>
      )}

    </div>
  );
}

function MatchRow({ match, userTeamId, formatMatchDate, currentRound }: { match: MatchData, userTeamId: string, formatMatchDate: any, currentRound: number }) {
  const isHome = match.homeTeamId === userTeamId;
  const isAway = match.awayTeamId === userTeamId;
  const isUserMatch = isHome || isAway;

    const playMatch = (matchId: string) => {
      redirect(`/game/page/play/${matchId}`);
    };


  return (
    <div className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl border transition-all ${
      isUserMatch ? "bg-sky-900/20 border-sky-500/30" : "bg-slate-900/50 border-white/5 hover:border-white/10"
    }`}>
      
      <div className="w-full md:w-1/4 text-center md:text-left mb-3 md:mb-0">
        <div className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-1">
          {match.round}. Kolo
        </div>
        <div className="text-sm font-semibold text-sky-400/80 capitalize">
          {formatMatchDate(match.date)}
        </div>
      </div>

      <div className="w-full md:w-2/4 flex items-center justify-center gap-4">
        
        <div className={`flex items-center gap-3 w-[45%] justify-end ${isHome ? "font-bold text-sky-400" : "text-slate-200"}`}>
          <span className="truncate text-right">{match.homeTeam.originalTeam?.name}</span>
          {match.homeTeam.originalTeam?.logo ? (
            <img src={match.homeTeam.originalTeam.logo} alt="logo" className="w-8 h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
          )}
        </div>

        <div className="w-[10%] flex justify-center">
          {match.status === "COMPLETED" ? (
            <div className="bg-slate-800 px-3 py-1 rounded font-mono font-bold text-white whitespace-nowrap">
              {match.scoreHome} : {match.scoreAway}
            </div>
          ) : (
            <div className="text-slate-500 font-black text-sm italic">VS</div>
          )}
        </div>

        <div className={`flex items-center gap-3 w-[45%] justify-start ${isAway ? "font-bold text-sky-400" : "text-slate-200"}`}>
          {match.awayTeam.originalTeam?.logo ? (
            <img src={match.awayTeam.originalTeam.logo} alt="logo" className="w-8 h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
          )}
          <span className="truncate text-left">{match.awayTeam.originalTeam?.name}</span>
        </div>

      </div>

      <div className="w-full md:w-1/4 flex justify-center md:justify-end mt-4 md:mt-0">
        {match.status === "SCHEDULED" && isUserMatch && currentRound === match.round ? (
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          onClick={ () => playMatch(match.id) }>
            Hrát zápas
          </button>
        ) : null}
      </div>

    </div>
  );
}


{/*function MatchRowInTable({ match, userTeamId, formatMatchDate, currentRound }: { match: MatchData, userTeamId: string, formatMatchDate: any, currentRound: number }) {
  const isHome = match.homeTeamId === userTeamId;
  const isAway = match.awayTeamId === userTeamId;
  const isUserMatch = isHome || isAway;


  return (
    <div>
      
    </div>
  );
}*/}
