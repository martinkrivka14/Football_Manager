"use client";

import { useState, useEffect, useRef } from "react";
import { 
  draggable, 
  dropTargetForElements, 
  monitorForElements 
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { saveLineup } from "../../../action/carrer"; 


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


const PitchSlot = ({ 
  positionKey, 
  positionData, 
  children 
}: { 
  positionKey: string, 
  positionData: { top: string, left: string }, 
  children?: React.ReactNode 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    if (!ref.current) return;
    const cleanup = dropTargetForElements({
      element: ref.current,
      getData: () => ({ location: 'pitch_slot', pitchPosition: positionKey }),
    });
    return cleanup;
  }, [positionKey]);

  return (
    <div 
      ref={ref}
      style={{ 
        position: 'absolute', 
        top: positionData.top, 
        left: positionData.left, 
        transform: 'translate(-50%, -50%)' 
      }}
      className="w-20 h-24 border-2 border-dashed border-white/20 hover:border-white/50 rounded-lg flex items-center justify-center bg-black/10 transition-colors z-10"
    >
      {!children && (
        <span className="text-white/30 font-bold text-sm pointer-events-none">{positionKey}</span>
      )}
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

    const cleanup = draggable({
      element: el,
      getInitialData: () => ({ 
        id: player.id, 
        squadRole: player.squadRole, 
        pitchPosition: player.pitchPosition 
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    return cleanup;
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

type PlayerUpdateData = {
  id: string;
  squadRole: string;
  pitchPosition: string | null;
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

    const result = await saveLineup(saveId, teamId, updates);
    
    setIsSaving(false);
    if (result.success) {
      alert("Sestava byla úspěšně uložena!");
    } else {
      alert("Chyba při ukládání sestavy.");
    }
  };

  const startingXI = players.filter(p => p.squadRole === "STARTING");
  const benchAndReserves = players.filter(p => p.squadRole !== "STARTING");

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Nastavení formace</h2>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? "Ukládám..." : "Uložit sestavu"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[70vh] select-none">
        
        
        <div className="flex-1 bg-green-800/90 rounded-xl relative border-4 border-slate-700 overflow-hidden min-h-[500px]">
         
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/20 transform -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-[2px] border-white/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute top-0 left-1/2 w-48 h-24 border-b-[2px] border-l-[2px] border-r-[2px] border-white/20 transform -translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/2 w-48 h-24 border-t-[2px] border-l-[2px] border-r-[2px] border-white/20 transform -translate-x-1/2 pointer-events-none"></div>
          
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
          className="w-full lg:w-96 bg-slate-900 rounded-xl p-4 border border-slate-700 overflow-y-auto"
        >
          <h2 className="text-xl font-bold text-sky-400 mb-4 sticky top-0 bg-slate-900 pb-2 border-b border-slate-800 z-10">
            Náhradníci
          </h2>
          
          <div className="flex flex-col min-h-[100px]">
            {benchAndReserves.length === 0 ? (
              <p className="text-slate-500 text-sm text-center mt-4 pointer-events-none">Lavička je prázdná</p>
            ) : (
              benchAndReserves.map(player => (
                 <PlayerCard key={player.id} player={player} />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}