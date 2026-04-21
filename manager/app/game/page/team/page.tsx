// app/game/page/team/page.tsx

import { auth } from "@/auth";
import { notFound } from "next/navigation";
import TeamManagementClient from "./actions/TeamManagementClient";
import { PrismaClient } from "@/prisma/..app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export default async function TeamPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div>Musíš být přihlášen.</div>;
  }

  const activeSave = await prisma.gameSave.findFirst({
    where: { userId: userId },
    include: {
      userTeam: {
        include: {
          players: {
            include: { originalPlayer: true }
          },
          // NOVĚ NAČÍTÁME I AKTUÁLNÍ SESTAVU
          lineups: {
            include: { entries: true },
            take: 1 // Bereme jen tu první/hlavní
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  if (!activeSave || !activeSave.userTeam) {
    return notFound();
  }

 

  // Pro snadnější hledání si vytáhneme jen 'entries' z naší uložené sestavy
  const currentLineupEntries = activeSave.userTeam.lineups[0]?.entries || [];

  // Zploštíme data pro klientskou komponentu
  const players = activeSave.userTeam.players.map(p => {
    // Podíváme se, jestli je tento hráč zapsaný v sestavě
    const lineupEntry = currentLineupEntries.find(entry => entry.savePlayerId === p.id);

    return {
      id: p.id,
      name: p.originalPlayer.name || p.originalPlayer.lastname || "Neznámý",
      position: p.originalPlayer.position || "Záložník",
      overall: p.overall || p.originalPlayer.overall || 0,
      
      // Pokud záznam existuje, vezmeme data z něj, jinak je to "RESERVE"
      squadRole: lineupEntry ? lineupEntry.role : "RESERVE", 
      pitchPosition: lineupEntry ? lineupEntry.pitchPosition : null,
      
      photo: p.originalPlayer.photo,
    };
  });

  return (
    <div className="p-6 text-white h-full">
      <h1 className="text-3xl font-bold mb-6">Správa Týmu</h1>
      {/* Musíme předat i teamId, aby akce věděla, pro koho to ukládá */}
      <TeamManagementClient 
        initialPlayers={players} 
        saveId={activeSave.id} 
        teamId={activeSave.userTeam.id} 
      />
    </div>
  );


}