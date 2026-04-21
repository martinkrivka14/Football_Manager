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
            <>
            <div className=" bg-[#24292f] h-screen w-screen flex flex-col items-center justify-center">
                <div className="text-lg font-medium justify-items-center p-4"><h1 className="bg-[#24292f] text-white p-2 rounded">You are signed in as</h1> <h1 className="text-white">{session.user?.name}</h1></div>
                {session.user?.image && (
                <Image src={session.user.image} width={50} height={50} alt={session.user?.name ?? "Profile picture"}/>)}
                <SignOutButton></SignOutButton>
                
            </div>
            </>
            
        );
    }
    return(

        <>
        <div className=" bg-[#24292f] h-screen w-screen flex flex-col items-center justify-center">
        <div className="text-lg font-medium justify-items-center p-4"><h1 className="bg-[#24292f] text-white p-2 rounded">Welcome you are not signed in</h1></div>
        <SigInButton />
        </div>
        </>
    );


}