"use client";

import { useState, useEffect, useRef } from "react";
import { 
  draggable, 
  dropTargetForElements, 
  monitorForElements 
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { saveLineup } from "../../../action/carrer";
import Link from "next/link"; 
import NavMenuGame from "@/app/game/menu/navMenu";

export type PlayerData = {
  id: string;
  name: string;
  position: string;
  overall: number;
  squadRole: string; 
  pitchPosition: string | null;
  photo: string | null;
};

const formation433: Record<string, { top: string, left: string }> = {
  "GK":  { top: "90%", left: "50%" },
  "LB":  { top: "70%", left: "15%" },
  "CB1": { top: "70%", left: "35%" },
  "CB2": { top: "70%", left: "65%" },
  "RB":  { top: "70%", left: "85%" },
  "CM1": { top: "45%", left: "25%" },
  "CM2": { top: "45%", left: "50%" },
  "CM3": { top: "45%", left: "75%" },
  "LW":  { top: "20%", left: "20%" },
  "ST":  { top: "15%", left: "50%" },
  "RW":  { top: "20%", left: "80%" },
};


const PitchSlot = ({ positionKey, positionData, children }: { positionKey: string, positionData: { top: string, left: string }, children?: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return dropTargetForElements({
      element: ref.current,
      getData: () => ({ location: 'pitch_slot', pitchPosition: positionKey }),
    });
  }, [positionKey]);

  return (
    <div 
      ref={ref}
      style={{ position: 'absolute', top: positionData.top, left: positionData.left, transform: 'translate(-50%, -50%)' }}
      className="w-20 h-24 border-2 border-dashed border-white/20 hover:border-white/50 rounded-lg flex items-center justify-center bg-black/10 transition-colors z-10"
    >
      {!children && <span className="text-white/30 font-bold text-sm pointer-events-none">{positionKey}</span>}
      {children}
    </div>
  );
};

const PlayerCard = ({ player, isField = false }: { player: PlayerData, isField?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return draggable({
      element: el,
      getInitialData: () => ({ id: player.id, squadRole: player.squadRole, pitchPosition: player.pitchPosition }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [player]);

  return (
    <div 
      ref={ref}
      className={`
        flex flex-col items-center justify-center bg-slate-800 rounded-lg p-2 shadow-xl border border-slate-700
        transition-all hover:border-sky-400 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-40 z-50 scale-95' : 'opacity-100'}
        ${isField ? 'w-full h-full' : 'w-full flex-row justify-between mb-2 hover:bg-slate-700'}
      `}
    >
      <div className={`${isField ? 'text-xs text-slate-400 mb-1 text-center' : 'flex flex-col'}`}>
        <span className="font-bold text-sky-400 mr-2">{player.overall}</span>
        <span className="text-[10px] uppercase font-semibold text-slate-300">
          {isField ? (player.pitchPosition || player.position) : player.position}
        </span>
      </div>
      <span className={`font-semibold text-white ${isField ? 'text-xs text-center truncate w-full px-1' : 'text-sm'}`}>
        {player.name}
      </span>
    </div>
  );
};


export default function TeamManagementClient({ 
  initialPlayers, 
  saveId,
  teamId
}: { 
  initialPlayers: PlayerData[], 
  saveId: string,
  teamId: string
}) {
  const [players, setPlayers] = useState<PlayerData[]>(initialPlayers);
  const [isSaving, setIsSaving] = useState(false);

  const benchRef = useRef<HTMLDivElement>(null);


  const startingXI = players.filter(p => p.squadRole === "STARTING");
  const benchAndReserves = players.filter(p => p.squadRole !== "STARTING");
  
  const teamOverall = startingXI.length > 0 
    ? Math.round(startingXI.reduce((acc, p) => acc + p.overall, 0) / startingXI.length) 
    : 0;

  useEffect(() => {
    if (!benchRef.current) return;

    const dropBench = dropTargetForElements({
      element: benchRef.current,
      getData: () => ({ location: 'bench' }),
    });

    const monitor = monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return; 

        const playerId = source.data.id as string;
        const targetLocation = destination.data.location as string;

        setPlayers((prevPlayers) => {
          const draggedPlayer = prevPlayers.find(p => p.id === playerId);
          if (!draggedPlayer) return prevPlayers;

          const targetPitchPosition = destination.data.pitchPosition as string | undefined;
          const playerAlreadyInSlot = targetPitchPosition 
            ? prevPlayers.find(p => p.pitchPosition === targetPitchPosition && p.id !== playerId)
            : undefined;

          return prevPlayers.map((p) => {
            if (p.id === playerId) {
              if (targetLocation === 'pitch_slot' && targetPitchPosition) {
                return { ...p, squadRole: 'STARTING', pitchPosition: targetPitchPosition }; 
              } else if (targetLocation === 'bench') {
                return { ...p, squadRole: 'BENCH', pitchPosition: null };
              }
            }

            if (playerAlreadyInSlot && p.id === playerAlreadyInSlot.id) {
              if (draggedPlayer.squadRole === 'STARTING') {
                return { ...p, pitchPosition: draggedPlayer.pitchPosition };
              } else {
                return { ...p, squadRole: 'BENCH', pitchPosition: null };
              }
            }
            return p;
          });
        });
      },
    });

    return () => {
      dropBench();
      monitor();
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const updates = players.map(p => ({
      id: p.id,
      squadRole: p.squadRole,
      pitchPosition: p.pitchPosition,
    }));

   
    const result = await saveLineup(saveId, teamId, updates, teamOverall);
    
    setIsSaving(false);
    if (result.success) {
      alert("Sestava byla úspěšně uložena!");
    } else {
      alert("Chyba při ukládání sestavy.");
    }
  };

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden">

      <><NavMenuGame/></>

  
      <main className="flex-1 p-8 flex flex-col h-full bg-[#05080f]">
        <div className="flex justify-between items-center mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Základní jedenáctka</h2>
            <div className="bg-sky-500/20 text-sky-400 px-4 py-1.5 rounded-full font-bold border border-sky-500/30 flex items-center gap-2">
              <span>TÝM OVERALL:</span>
              <span className="text-xl">{teamOverall}</span>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-sky-600  text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-sky-600/20"
          >
            {isSaving ? "Ukládám..." : "Uložit sestavu"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 select-none">
          
          
          <div className="flex-1 bg-[#1a4a2b] rounded-xl relative border-[6px] border-[#0a1c10] overflow-hidden">
          
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/30 transform -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 border-[2px] border-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 w-48 h-24 border-b-[2px] border-l-[2px] border-r-[2px] border-white/30 transform -translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/2 w-48 h-24 border-t-[2px] border-l-[2px] border-r-[2px] border-white/30 transform -translate-x-1/2 pointer-events-none"></div>
            
            {Object.entries(formation433).map(([posKey, posData]) => {
              const playerInThisPosition = startingXI.find(p => p.pitchPosition === posKey);
              return (
                <PitchSlot key={posKey} positionKey={posKey} positionData={posData}>
                  {playerInThisPosition && (
                    <PlayerCard player={playerInThisPosition} isField={true} />
                  )}
                </PitchSlot>
              );
            })}
          </div>

         
          <div 
            ref={benchRef} 
            className="w-full lg:w-96 bg-[#0a111a] rounded-xl p-5 border border-[#1a2533] overflow-y-auto flex flex-col"
          >
            <h2 className="text-lg font-bold text-sky-400 mb-4 sticky top-0 bg-[#0a111a] pb-2 border-b border-[#1a2533] z-10 uppercase tracking-wide">
              Lavička ({benchAndReserves.length})
            </h2>
            
            <div className="flex flex-col min-h-[100px] gap-2">
              {benchAndReserves.length === 0 ? (
                <p className="text-slate-500 text-sm text-center mt-8 pointer-events-none">Všichni hráči jsou na hřišti</p>
              ) : (
                benchAndReserves.map(player => (
                   <PlayerCard key={player.id} player={player} />
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}