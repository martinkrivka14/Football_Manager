import { NextResponse } from 'next/server';
import { setupLeaguesAndAssignTeams } from '../db/setupLeaguesAndAsignTeams';

export async function GET() {
  try {
    const result = await setupLeaguesAndAssignTeams();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Něco se pokazilo." }, 
      { status: 500 }
    );
  }
}