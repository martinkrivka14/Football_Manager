import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import React from 'react';
import prisma from "../../../lib/db";
import { redirect } from 'next/dist/server/api-utils';
import { pushPlayersToDb } from '../db/playersToDb';

export async function GET(request: NextRequest) {

  try {
    const response = await fetch(process.env.API_PLAYER_URL as string, {
      method: 'GET',
      headers: {
        'x-apisports-key': process.env.API_SPORTS_KEY as string,
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Nepodařilo se načíst data z API" }, 
        { status: response.status }
      );
    }

    const data = await response.json();

    await pushPlayersToDb(data);

    return NextResponse.json({ 
      success: true, 
      message: "Data byla úspěšně stažena a uložena.",
      count: data.results 
    });

  } catch (error) {
    console.error("Kritická chyba:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru" }, 
      { status: 500 }
    );
  }
}