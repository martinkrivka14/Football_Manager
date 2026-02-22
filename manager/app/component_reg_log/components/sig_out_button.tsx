"use client";

import { login, logout } from "@/app/actions/auth";

export const SignOutButton = () => {
    return(
        <button onClick={() => logout()}>Sign Out</button>
        
    );
}