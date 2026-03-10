import { NextResponse } from 'next/server';
import { assignPlayersToTeamsLogic } from '../db/asignAndFillPlayers';

export async function GET() {
  try {
    // Tady jen zavoláme naši oddělenou logiku
    const result = await assignPlayersToTeamsLogic();
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Něco se pokazilo při spouštění logiky." }, 
      { status: 500 }
    );
  }
}