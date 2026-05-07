import Footer from "../components_home/footer";
import Nav from "../components_home/nav";
import AboutPlay from "./aboutPlay";
import { auth } from "@/auth";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});


export default async function Play() {

    let path = "";
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        path = "/component_reg_log";
    } else {
        const activeSave = await prisma.gameSave.findMany({
            where: { userId: userId },
        });

        if (activeSave.length === 0) {
            path = "/game/page/create";
        } else {
            path = "/game/page/home";
        }
    }

    return(
    <div className="flex  items-center justify-center font-sans dark:bg-black min-h-screen bg-black">
        <>
        <Nav/>
        <div className="grid grid-cols-1" >
            <AboutPlay path={path}/>
        </div>
        <Footer/>
        </>

    </div>
    );
}