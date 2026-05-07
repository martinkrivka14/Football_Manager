import { auth } from "@/auth";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma";
import { redirect } from "next/navigation";
import ChooseClient from "./components/ChooseClient";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export default async function Choose() {

    const session = await auth();

    const userId = session?.user?.id;

    const allSaves = await prisma.gameSave.findMany({
    where: { userId: userId },
    include: {
        userTeam: {
        include: {
            originalTeam: true, 
        },
        }
    },
    orderBy: { updatedAt: 'desc' }
    });

    async function handleSaveUpdate(saveId: string) {
        "use server";
        await prisma.gameSave.update({
            where: { id: saveId },
            data: { updatedAt: new Date() }
        });
        redirect(`/game/page/home`);
    }
    
    return <ChooseClient allSaves={allSaves} handleSaveUpdate={handleSaveUpdate} />;
}