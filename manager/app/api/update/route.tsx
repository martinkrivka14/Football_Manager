import { NextResponse } from 'next/server';
import { updatePlayersStats } from '../db/updatePlayersStats';

export async function GET() {
  try {
    // Tady jen zavoláme naši oddělenou logiku
    const result = await updatePlayersStats();
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Něco se pokazilo při spouštění logiky." }, 
      { status: 500 }
    );
  }
}