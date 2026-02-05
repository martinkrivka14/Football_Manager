import prisma from "@/lib/db"
import { use } from "react";
{/*}
async function FindUserFetch() {

  const allUsers = await prisma.user.findMany();
  return allUsers;
  
}

async function FindTeamFetch(){
  const allTeams = await prisma.team.findMany();
  return allTeams;
} {*/}

async function FindUsername(usr :string) {

  const user = await prisma.user.findFirst({
    where : {username : usr}
  });

  return user !== null;
}

interface FindUserProps{
  username: string;
};

export default async function FindUser({username} : FindUserProps){

    //const allUsers = await FindUserFetch()
    
    //const allTeams = await FindTeamFetch();

    const users = await FindUsername(username);



  return (
    <div>

      <h1>Info about User</h1>
      
       <h3>{users ? "User found" : "No User Found!"}</h3> 
    

      {/*}
      <h1>Seznam useru :</h1>
    <ul>
      {(allUsers).map((user) => (
        <li key={user.id}>{user.username}</li>
      ))}
    </ul>
    <h1>Seznam týmů</h1>
    <ul>
      {(allTeams).map((team) =>(
        <li key={team.id}>{team.name}</li>
      ))}
    </ul>{*/}
    </div>
    
  )
}