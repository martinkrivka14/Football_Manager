"use client";

import { login, logout } from "@/app/actions/auth";

export const SignOutButton = () => {
    return(

        <>
            <div className="flex justify-center p-4">
                <button  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => logout()}>Sign Out</button>
            </div>
        </>

        
    );
}