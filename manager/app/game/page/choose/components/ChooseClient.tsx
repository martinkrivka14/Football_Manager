"use client";

import Link from "next/link";


export default function ChooseClient({ allSaves, handleSaveUpdate }: { allSaves: any, handleSaveUpdate: (id: string) => Promise<void> }) {
    
    const handleClick = (saveId: string) => async () => {
        await handleSaveUpdate(saveId);
    };

    return(
    <div className="min-h-screen p-8 bg-slate-950 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-wide">
            Jsi na stránce výběru tvých kariér
        </h1>
        <p className="text-slate-400 mb-8">
            Vyber si tým, který chceš momentálně trénovat, nebo vytvoř zcela novou kariéru a začni od začátku.
        </p>
        <p className="text-slate-400 mb-8">
            K této stránce se můžeš kdykoliv vrátit, pokud budeš chtít změnit tým, se kterým hraješ, nebo začít znovu s jiným týmem.
        </p>
        <p className="text-slate-400 mb-8">
            Tento výběr najdeš na stránce HOME
        </p>

        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-wide mb-6" >
            Vyber kariéru
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
            {allSaves.map((save: any) => (
                <button key={save.id} onClick={handleClick(save.id)} className="text-left transition-transform ">
                    <div className="bg-[#121826] p-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border-t-4 border-sky-400 h-full">
                        {save.userTeam?.originalTeam?.logo && (
                            <img
                                src={save.userTeam.originalTeam.logo}
                                alt="Logo klubu"
                                className="h-24 mx-auto mb-4 drop-shadow-lg"
                            />
                        )}
                        <h2 className="text-xl font-bold text-white mb-2">
                            {save.saveName}
                        </h2>
                        <p className="text-slate-400">
                            {save.userTeam?.originalTeam?.name || "Neznámý tým"}
                        </p>
                    </div>
                </button>
            ))}
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-wide  mt-10" >
            Vytvoř kariéru
        </h1>

        <Link
            href={`/game/page/create`}
            className="inline-block px-10 py-3 mt-20 bg-sky-500 text-[#0f172a] font-bold rounded-xl ">
            Vytvořit novou kariéru
        </Link>
    </div>
    );
}