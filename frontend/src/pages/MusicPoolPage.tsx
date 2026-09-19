import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMusicPool } from "../hooks/useMusicPool";
import { StepBadge } from "../components/CompetitionComponents";

export default function MusicPoolPage() {
    const navigate = useNavigate();
    const { championships, loading } = useMusicPool();
    const [search, setSearch] = useState("");

    const totalCharts = championships.reduce(
        (total, championship) => total + championship.phases.reduce(
            (phaseTotal, phase) => phaseTotal + phase.charts.length,
            0
        ),
        0
    );
    const visibleChampionships = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return championships;

        return championships.map(championship => ({
            ...championship,
            phases: championship.phases.map(phase => ({
                ...phase,
                charts: phase.charts.filter(chart =>
                    chart.title.toLowerCase().includes(query)
                )
            })).filter(phase => phase.charts.length > 0)
        })).filter(championship => championship.phases.length > 0);
    }, [championships, search]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07090d] text-sm font-black tracking-[0.18em] text-zinc-400">
                CARREGANDO POOL DE MÚSICAS...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-white">
            <header className="border-b border-white/[0.07] bg-[#0b0e14]/90">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-6 py-4 lg:px-10">
                    <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
                        <span className="text-xl text-zinc-500">←</span>
                        <span><span className="block text-[10px] font-black tracking-[0.22em] text-zinc-500">GAUCHONES 2026</span><span className="block text-sm font-black text-white">Pool de músicas</span></span>
                    </button>
                    <button type="button" onClick={() => window.open("/display", "_blank", "noopener,noreferrer")} className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-xs font-black text-cyan-200 transition hover:bg-cyan-300/20">Abrir sorteador ↗</button>
                </div>
            </header>

            <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10 lg:py-12">
                <section className="flex flex-col justify-between gap-6 rounded-3xl border border-white/[0.08] bg-[#0d1118] p-7 md:flex-row md:items-end">
                    <div>
                        <p className="text-[10px] font-black tracking-[0.25em] text-cyan-300/70">CATÁLOGO OPERACIONAL</p>
                        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Lista de músicas</h1>
                        <p className="mt-3 text-sm text-zinc-400">Consulte os charts organizados por categoria e fase.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3"><p className="text-[10px] font-black tracking-[0.16em] text-zinc-500">CATEGORIAS</p><p className="mt-1 text-xl font-black">{championships.length}</p></div>
                        <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3"><p className="text-[10px] font-black tracking-[0.16em] text-zinc-500">CHARTS</p><p className="mt-1 text-xl font-black">{totalCharts}</p></div>
                        <label className="col-span-2 flex items-center rounded-xl border border-zinc-700 bg-zinc-950 px-3 sm:col-span-1"><span className="mr-2 text-zinc-500">⌕</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar música" className="min-w-0 bg-transparent py-2 text-sm text-white outline-none placeholder:text-zinc-600" /></label>
                    </div>
                </section>

                <div className="mt-8 space-y-8">
                    {visibleChampionships.map(championship => (
                        <section key={championship.id} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1118]">
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
                                <div><h2 className="text-2xl font-black">{championship.name}</h2><p className="mt-1 text-xs font-semibold text-zinc-500">{championship.phases.length} fases configuradas</p></div>
                                {championship.currentPhaseId && <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[10px] font-black tracking-[0.15em] text-emerald-300">● ATIVO</span>}
                            </div>
                            <div className="space-y-6 p-6">
                                {championship.phases.map(phase => (
                                    <div key={phase.id}>
                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black text-white">{phase.name}</h3><p className="mt-1 text-xs font-semibold text-zinc-500">{phase.mode} {phase.minLevel}{phase.allowOver ? "+" : `–${phase.maxLevel}`} · {phase.drawCount} sorteios</p></div><span className="text-xs font-bold text-zinc-600">{phase.charts.length} músicas</span></div>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                                            {[...phase.charts].sort((a, b) => a.level - b.level || a.title.localeCompare(b.title)).map(chart => (
                                                <article key={chart.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition hover:-translate-y-0.5 hover:border-zinc-600">
                                                    <div className="relative"><img src={`http://localhost:3000/banners/${encodeURIComponent(chart.bannerPath)}`} alt={chart.title} className="aspect-[4/3] w-full object-cover" /><StepBadge mode={chart.mode} level={chart.level} className="absolute right-2 top-2 h-10 w-10" /></div>
                                                    <p className="p-3 text-xs font-bold leading-4 text-zinc-200">{chart.title}</p>
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
