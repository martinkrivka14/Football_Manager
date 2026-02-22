import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

import {auth} from "@/auth";
import path from "path";


const protectedRoutes = ["/game"] //navic pouze pro info dulezite je ze session je null, vyreseno configem- setr kod

export default async function proxy(request: NextRequest) {
    const session = await auth();

    const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route)); //navic

    console.log(session);

    if(isProtected && !session){
        return NextResponse.redirect(new URL("/api/auth/signin", request.url));
    }


    return NextResponse.next(); 
    
    
}

 export const config = {
    matcher: ['/game/:path*'],
 }