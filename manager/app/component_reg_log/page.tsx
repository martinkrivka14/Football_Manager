"use server";
import {auth, signIn} from "@/auth";
import { login } from "@/app/actions/auth";
import { SigInButton } from "./components/sig_in_button";

import Image from "next/image";
import { SignOutButton } from "./components/sig_out_button";


export default async function RegLog() {

    const session = await auth();
    console.log(session?.user);
    if(session) {
        return(
            <><div>You are signed in as {session.user?.name}</div>
            {session.user?.image && (
            <Image src={session.user.image} width={50} height={50} alt={session.user?.name ?? "Profile picture"}/>)}
            <SignOutButton></SignOutButton>
            </>
            
        );
    }
    return(

        <>
        <div>You are not signed in</div>
        <SigInButton />
        </>
    );


}