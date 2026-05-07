
import { auth } from "@/auth";
import TeamSelector from "./components/TeamSelector";
import Link from "next/link";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import NavMenuGame from "../../menu/navMenu";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;

  let activeSave = null;

  if (userId) {
    activeSave = await prisma.gameSave.findFirst({
      where: { userId: userId },
      include: {
        userTeam: {
          include: {
            originalTeam: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  if (activeSave && activeSave.userTeam) {
    return (
      <div className="min-h-screen p-8 bg-slate-950 flex flex-col items-center">
        <><NavMenuGame/></>
        <h1 className="text-4xl font-extrabold text-white mb-6 tracking-wide">
          Vítej zpět, trenére!
        </h1>

        <div className="bg-[#121826] p-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] w-full max-w-2xl text-center border-t-4 border-sky-400">
          {activeSave.userTeam.originalTeam.logo && (
            <img
              src={activeSave.userTeam.originalTeam.logo}
              alt="Logo klubu"
              className="h-24 mx-auto mb-4 drop-shadow-lg"
            />
          )}
          <h2 className="text-2xl font-bold text-white mb-1">
            {activeSave.saveName}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 bg-slate-800/50 p-4 rounded-xl text-left border border-slate-700/50">
            <div className="flex flex-col">
              <span className="text-xs text-sky-400/80 uppercase font-bold tracking-wider">Klub</span>
              <span className="font-semibold text-lg text-slate-200">
                {activeSave.userTeam.originalTeam.name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-sky-400/80 uppercase font-bold tracking-wider">Rozpočet</span>
              <span className="font-semibold text-lg text-emerald-400 drop-shadow-sm">
                {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(activeSave.userTeam.budget)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-sky-400/80 uppercase font-bold tracking-wider">Herní datum</span>
              <span className="font-semibold text-lg text-slate-200">
                {activeSave.inGameDate.toLocaleDateString('cs-CZ')}
              </span>
            </div>
          </div>
          <Link
            href={`/game/page/team`}
            className="inline-block px-10 py-3 bg-sky-500 text-[#0f172a] font-bold rounded-xl">
            Pokračovat na Sestavu
          </Link>

        </div>
          <Link
            href={`/game/page/choose`}
            className="inline-block px-10 py-3 mt-20 bg-sky-500 text-[#0f172a] font-bold rounded-xl ">
            Výběr jiné kariéry, nebo vytvoření nové
          </Link>
      </div>
    );
  }
}