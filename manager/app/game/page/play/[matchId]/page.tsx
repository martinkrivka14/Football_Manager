import prisma from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function MatchPlayPage({
	params,
}: {
	params: Promise<{ matchId: string }>;
}) {
	const session = await auth();
	const userId = session?.user?.id;

	if (!userId) redirect("/component_reg_log");

	const resolvedParams = await params;

	const match = await prisma.saveMatch.findUnique({
		where: { id: resolvedParams.matchId },
		include: {
			gameSave: {
				include: {
					userTeam: true,
				},
			},
			saveLeague: {
				include: {
					originalLeague: true,
				},
			},
			homeTeam: {
				include: { originalTeam: true },
			},
			awayTeam: {
				include: { originalTeam: true },
},
		},
	});

	if (!match || match.gameSave.userId !== userId) return notFound();

	const homeName = match.homeTeam.originalTeam?.name || "Neznámý tým";
	const awayName = match.awayTeam.originalTeam?.name || "Neznámý tým";
	const leagueName = match.saveLeague.originalLeague?.name || "Neznámá liga";
	const isUserMatch = match.gameSave.userTeamId === match.homeTeamId || match.gameSave.userTeamId === match.awayTeamId;

	return (
		<div className="p-8 bg-[#05080f] min-h-screen text-white flex flex-col gap-8">
			<div className="bg-[#0a111a] p-8 rounded-2xl border border-[#1a2533] shadow-2xl flex items-center justify-between gap-6">
				<div>
					<p className="text-slate-500 text-sm uppercase tracking-widest font-bold mb-2">
						Informativní detail zápasu
					</p>
					<h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
						{homeName} vs {awayName}
					</h1>
					<div className="flex flex-wrap gap-3 mt-4">
						<span className="bg-sky-500/20 text-sky-400 px-3 py-1 rounded text-sm font-bold border border-sky-500/30">
							KOLO: {match.round}
						</span>
						<span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-sm font-bold border border-emerald-500/30">
							STAV: {match.status}
						</span>
						<span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded text-sm font-bold border border-amber-500/30">
							LIGA: {leagueName}
						</span>
						{isUserMatch && (
							<span className="bg-violet-500/20 text-violet-300 px-3 py-1 rounded text-sm font-bold border border-violet-500/30">
								TVŮJ ZÁPAS
							</span>
						)}
					</div>
				</div>

				<div className="hidden lg:flex items-center gap-4 text-center">
					<div className="w-24 h-24 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center overflow-hidden">
						{match.homeTeam.originalTeam?.logo ? (
							<img src={match.homeTeam.originalTeam.logo} alt={homeName} className="w-16 h-16 object-contain" />) : (
							<span className="text-slate-500 font-bold text-xs">HOME</span>
						)}
					</div>
					<div className="text-3xl font-black text-slate-400">VS</div>
					<div className="w-24 h-24 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center overflow-hidden">
						{match.awayTeam.originalTeam?.logo ? (
							<img src={match.awayTeam.originalTeam.logo} alt={awayName} className="w-16 h-16 object-contain" />) : (
							<span className="text-slate-500 font-bold text-xs">AWAY</span>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="bg-[#0a111a] p-6 rounded-2xl border border-[#1a2533] h-fit">
					<h2 className="text-xl font-bold mb-6 text-sky-400 border-b border-white/5 pb-2">Základní informace</h2>
					<div className="space-y-4">
						<InfoRow label="Datum" value={new Intl.DateTimeFormat("cs-CZ", { weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(match.date))} />
						<InfoRow label="Kolo" value={match.round} />
						<InfoRow label="Stav" value={match.status} />
						<InfoRow label="Liga" value={leagueName} />
					</div>
				</div>

				<div className="lg:col-span-2 bg-[#0a111a] p-6 rounded-2xl border border-[#1a2533]">
					<h2 className="text-xl font-bold mb-6 text-sky-400 border-b border-white/5 pb-2">Průběh zápasu</h2>

					<div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-900/40 rounded-2xl border border-white/5">
						<TeamBlock
							name={homeName}
							logo={match.homeTeam.originalTeam?.logo || null}
							highlighted={match.gameSave.userTeamId === match.homeTeamId}/>

						<div className="text-center">
							{match.status === "COMPLETED" ? (
								<>
									<div className="text-5xl font-black text-white font-mono">
										{match.scoreHome} : {match.scoreAway}
									</div>
									<p className="text-slate-400 text-sm mt-2">Konečný výsledek</p>
								</>) : (
								<>
									<div className="text-4xl font-black text-slate-500 italic">VS</div>
									<p className="text-slate-400 text-sm mt-2">Zápas je zatím pouze informativní</p>
								</>)}
						</div>

						<TeamBlock
							name={awayName}
							logo={match.awayTeam.originalTeam?.logo || null}
							highlighted={match.gameSave.userTeamId === match.awayTeamId}
						/>
					</div>

					<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
						<InfoCard
							title="Tým doma"
							value={homeName}
							note={match.homeTeam.originalTeam?.name ? "Domácí celek" : "Bez názvu"}/>
						<InfoCard
							title="Tým venku"
							value={awayName}
							note={match.awayTeam.originalTeam?.name ? "Hostující celek" : "Bez názvu"}/>
					</div>

					<div className="mt-6 flex flex-wrap gap-3">
						<Link
							href="/game/page/schedule"
							className="bg-slate-800 hover:bg-sky-600 text-white px-5 py-2 rounded-full font-bold transition-all">
							Zpět na rozpis
						</Link>
						<Link
							href="/game/page/home"
							className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-full font-bold transition-all">
							Zpět do hry
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

function TeamBlock({
	name,
	logo,
	highlighted,
}: {
	name: string;
	logo: string | null;
	highlighted: boolean;
}) 
{
	return (
		<div className={`flex flex-col items-center text-center gap-3 ${highlighted ? "text-sky-400" : "text-slate-200"}`}>
			<div className={`w-20 h-20 rounded-full bg-black/20 border ${highlighted ? "border-sky-500/40" : "border-white/5"} flex items-center justify-center overflow-hidden`}>
				{logo ? (
					<img src={logo} alt={name} className="w-14 h-14 object-contain" />) : (
					<span className="font-bold text-xs text-slate-500">LOGO</span>)}
			</div>
			<div className="font-bold text-lg truncate max-w-45">{name}</div>
		</div>
	);
}

function InfoCard({ title, value, note }: { title: string; value: string; note: string }) {
	return (
		<div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
			<div className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2">{title}</div>
			<div className="font-bold text-slate-100">{value}</div>
			<div className="text-sm text-slate-400 mt-1">{note}</div>
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex justify-between items-center py-2 border-b border-white/5">
			<span className="text-slate-500 text-sm uppercase font-bold">{label}</span>
			<span className="font-semibold text-slate-200 text-right">{value}</span>
		</div>
	);
}