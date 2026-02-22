import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import {PrismaClient} from "@prisma/client"
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";


const prisma = new PrismaClient();
export const {auth, handlers, signIn, signOut} = NextAuth({
  providers: [Github({
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
  })],
  adapter: PrismaAdapter(prisma)
  ,}); 