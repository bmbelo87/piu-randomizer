import { useEffect, useState } from "react";

import { useDisplay } from "../hooks/useDisplay";
import { subscribeDisplayEvents } from "../services/displayEvents";
import DrawReveal from "../components/DrawReveal";
import { StepBadge } from "../components/CompetitionComponents";

import { ASSETS_URL } from "../services/config";
interface DrawResult {
    draws: {
        song: string;
        bannerPath: string;
        previewPath: string | null;
        mode: string;
        level: number;
    }[];
    seed: string;
    rerollLevel?: number;
}

export default function DisplayPhasePage() {
    const { data, loading, refetch } = useDisplay();
    const [showDrawModal, setShowDrawModal] = useState(false);
    const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
    const [audioReady, setAudioReady] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

    function handleEnableAudio() {
        setAudioContext(new AudioContext());
        setAudioReady(true);
    }

    useEffect(() => {
        return subscribeDisplayEvents(message => {
            refetch();

            if (message.type === "phase-update") {
                setShowDrawModal(false);
                setDrawResult(null);
                return;
            }

            setDrawResult({
                draws: message.draws,
                seed: message.seed,
                rerollLevel: message.rerollLevel
            });
            setShowDrawModal(true);
        });
    }, [refetch]);

    if (loading || !data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07090d] text-sm font-black tracking-[0.2em] text-zinc-400">
                PREPARANDO TELA DO CAMPEONATO...
            </div>
        );
    }

    const { championship, phase } = data;
    const allPhases = data.allPhases ?? [];
    const isActive = Boolean(championship.currentPhaseId);
    const lastPhase = [...allPhases].sort((a, b) => b.order - a.order)[0];
    const ended = !isActive && Boolean(lastPhase?.drawCount);

    return (
        <div className="min-h-screen bg-transparent text-white">
            <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col px-6 py-6 lg:px-12 lg:py-8">
                <header className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                    <div>
                        <p className="text-[10px] font-black tracking-[0.3em] text-cyan-300/70">GAUCHONES 2026 · LIVE BOARD</p>
                        <h1 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{championship.name}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden text-[10px] font-black tracking-[0.18em] text-zinc-500 sm:block">TELA DE PALCO</span>
                        <span className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black tracking-[0.16em] ${isActive ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-300" : "border-zinc-700 bg-zinc-900 text-zinc-500"}`}>
                            <span>●</span>{isActive ? "AO VIVO" : "AGUARDANDO"}
                        </span>
                    </div>
                </header>

                <main className="flex flex-1 flex-col justify-center py-10">
                    {ended ? (
                        <div className="mx-auto max-w-2xl text-center">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-5xl">🏆</div>
                            <h2 className="mt-8 text-4xl font-black tracking-tight sm:text-6xl">Campeonato encerrado</h2>
                            <p className="mt-4 text-lg text-zinc-400">Todas as fases desta categoria foram concluídas.</p>
                        </div>
                    ) : !phase ? (
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-6xl text-cyan-300/60">◌</span>
                            <h2 className="mt-6 text-4xl font-black">Aguardando próxima fase</h2>
                            <p className="mt-3 text-lg text-zinc-500">A operação será atualizada automaticamente.</p>
                        </div>
                    ) : (
                        <section className="mx-auto w-full max-w-[1500px]">
                            <div className="mb-10 text-center">
                                <p className="text-[11px] font-black tracking-[0.3em] text-cyan-300/80">FASE EM ANDAMENTO</p>
                                <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-6xl">{phase.name}</h2>
                                <p className="mt-3 text-lg font-semibold text-zinc-400">
                                    {phase.mode === "X2" ? "CO-OP X2" : `${phase.mode} · ${phase.minLevel}${phase.maxLevel == null ? "+" : `–${phase.maxLevel}`}`}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-5">
                                {[...phase.draws]
                                    .sort((a, b) => a.chart.level - b.chart.level || a.chart.song.title.localeCompare(b.chart.song.title))
                                    .map(draw => (
                                        <article key={draw.id} className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d1118] shadow-2xl">
                                            <img src={`${ASSETS_URL}/banners/${encodeURIComponent(draw.chart.song.bannerPath)}`} alt={draw.chart.song.title} className="aspect-video w-full object-cover" />
                                            <div className="flex items-center justify-between gap-4 p-5">
                                                <h3 className="text-lg font-black leading-tight">{draw.chart.song.title}</h3>
                                                <StepBadge mode={draw.chart.mode} level={draw.chart.level} className="h-12 w-12" />
                                            </div>
                                        </article>
                                    ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>

            {!ended && showDrawModal && drawResult && phase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070b]/95 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-[1800px] rounded-3xl border border-cyan-300/20 bg-[#0b0e14] p-5 shadow-2xl sm:p-8">
                        <DrawReveal
                            key={drawResult.seed}
                            draws={drawResult.draws}
                            availableCharts={phase.availableCharts}
                            audioContext={audioReady ? audioContext : null}
                            rerollLevel={drawResult.rerollLevel}
                            onComplete={() => setShowDrawModal(false)}
                        />
                    </div>
                </div>
            )}

            {!audioReady && (
                <button type="button" onClick={handleEnableAudio} className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-[#05070b]/95 p-6 text-center backdrop-blur-sm">
                    <span className="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 px-8 py-7 text-xl font-black text-cyan-100 shadow-2xl sm:text-3xl">Clique para ativar o áudio<br /><span className="mt-2 block text-sm font-semibold text-cyan-200/60">A tela do sorteador precisa de uma interação inicial</span></span>
                </button>
            )}
        </div>
    );
}
