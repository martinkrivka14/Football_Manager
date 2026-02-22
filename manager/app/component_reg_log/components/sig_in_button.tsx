"use client";

import { login } from "@/app/actions/auth";

export const SigInButton = () => {
    return(
        <button onClick={() => login()}>Sign In with GitHub</button>
    );
}