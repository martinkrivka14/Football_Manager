'use client'
import { Suspense, useState } from "react";
import FindUser from "./findUser";
import LoadingFindingUser from "./loadingFindingUser";


function handleChange(username: string){
    return
        <Suspense fallback = {<LoadingFindingUser></LoadingFindingUser>}>
                <FindUser username={username}></FindUser>
        </Suspense>
    
}

export default function FormRegLog(){

    const [user, setUser] = useState("");

    return(
        <form onChange={(e) => {e.preventDefault(); handleChange(user)}}>
            <label htmlFor="">Username:</label>
            <input type="text" 
                   value={user}
                   onChange={(e)=> setUser(e.target.value)}
                />

            <label htmlFor=""></label>
            <input type="password" />

            <button type="submit">Submit</button>
        </form>
    );

}


