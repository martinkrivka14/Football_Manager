import { NextRequest, NextResponse } from 'next/server';
import { fillEmptyTeamsWithRegens } from '../db/fillEmptyTeamsWithRegens';

export async function GET(request: NextRequest) {
  try {
    console.log("Generování hráčů");

   
    const result = await fillEmptyTeamsWithRegens();

    
    return NextResponse.json({ 
      success: true, 
      message: result.message,
      count: result.generatedPlayersCount 
    });

  } catch (error) {
    console.error("Kritická chyba při generování hráčů:", error);
    
   
    return NextResponse.json(
      { 
        error: "Interní chyba serveru", 
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}