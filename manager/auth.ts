import NextAuth from "next-auth";
import Github from "next-auth/providers/github";

import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";



export const {auth, handlers, signIn, signOut} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Github({
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
  })],
}); 