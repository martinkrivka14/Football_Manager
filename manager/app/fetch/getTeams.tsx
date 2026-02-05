import { PrismaClient } from '@prisma/client/extension';
import React from 'react';


async function WriteToDabase() {
  


}

export default async function WriteTeamsToDatabase() {


  const response = await fetch('https://v3.football.api-sports.io/teams?country=england', {
    method: 'GET',
    headers: {
      'x-apisports-key': 'd6984780f9d973c5ab29f6c01d700a39', 
    },
    next: { revalidate: 3600 } 
  });

  if (!response.ok) {
    return <div>Chyba při načítání dat</div>;
  }

  const data = await response.json();
  const teams = data.response;


  return (
    <div className="grid grid-cols-3 gap-4 max-w-4xl justify-center">
      {teams.map((item: any) => (
        <div key={item.team.id} className="p-4 border rounded">
          <img src={item.team.logo} alt={item.team.name} width={50} />
          <h3>{item.team.name}</h3>
          <p>{item.team.country}</p>
        </div>
      ))}
    </div>
  );
}