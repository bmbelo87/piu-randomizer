import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useChampionship } from "../hooks/useChampionship";
import { api } from "../services/api";
import { sendDisplayEvent } from "../services/displayEvents";
import {
    PhaseTimeline
} from "../components/CompetitionComponents";
import {
    LEGENDS_RANGE,
    getPhaseState,
    phaseDifficulty,
    phaseName,
    phaseStateLabel,
    phaseStateMark
} from "../utils/competitionUtils";

import { openDisplay } from "../services/config";
export default function ChampionshipPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { championship, loading, reload } = useChampionship(id!);
    const [updating, setUpdating] = useState(false);

    async function broadcastUpdate() {
        await sendDisplayEvent({ type: "phase-update" });
    }

    // Legends: tira a musica do telao, sem apagar o historico
    async function clearDisplay() {
        setUpdating(true);
        try {
            await api.post(`/championships/${id}/clear-display`);
            await broadcastUpdate();
        } finally {
            setUpdating(false);
        }
    }

    async function toggleActive() {
        if (!championship) return;
        setUpdating(true);
        try {
            await api.patch(`/championships/${id}/current-phase`, {
                phaseId: championship.currentPhaseId
                    ? null
                    : championship.phases[0]?.id ?? null
            });
            await reload();
            await broadcastUpdate();
        } finally {
            setUpdating(false);
        }
    }

    async function setActivePhase(phaseId: string) {
        setUpdating(true);
        try {
            await api.patch(`/championships/${id}/current-phase`, { phaseId });
            await reload();
            await broadcastUpdate();
        } finally {
            setUpdating(false);
        }
    }

    if (loading || !championship) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07090d] text-sm font-bold tracking-[0.16em] text-zinc-400">
                CARREGANDO CATEGORIA...
            </div>
        );
    }

    const phases = [...championship.phases].sort((a, b) => a.order - b.order);
    const activePhase = phases.find(
        phase => phase.id === championship.currentPhaseId
    );
    const isLegends = championship.name.toLowerCase() === "legends";
    // false = so a categoria e ativada; as listas nao tem "fase ativa"
    const phaseActivation = championship.phaseActivation !== false;

    return (
        <div className="min-h-screen bg-transparent text-white">
            <header className="border-b border-white/[0.07] bg-[#0b0e14]/90">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-4 lg:px-10">
                    <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
                        <span className="text-xl text-zinc-500">←</span>
                        <span>
                            <span className="block text-[10px] font-black tracking-[0.22em] text-zinc-500">GAUCHONES 2026</span>
                            <span className="block text-sm font-black text-white">Controle de categoria</span>
                        </span>
                    </button>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => navigate("/music-pool")} className="hidden rounded-lg px-3 py-2 text-xs font-bold text-zinc-400 transition hover:bg-white/[0.06] hover:text-white sm:block">Músicas</button>
                        <button type="button" onClick={() => openDisplay()} className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-200 transition hover:bg-cyan-300/20">Abrir sorteador ↗</button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10 lg:py-12">
                <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.18em] ${championship.currentPhaseId ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200" : "border-zinc-700 bg-zinc-900 text-zinc-400"}`}>
                                {championship.requiresActivation
                                    ? championship.currentPhaseId ? "● CATEGORIA ATIVA" : "○ AGUARDANDO ATIVAÇÃO"
                                    : "● SORTEIO LIVRE"}
                            </span>
                            {championship.allowRepeats && <span className="text-[10px] font-bold tracking-[0.16em] text-zinc-500">REPETIÇÕES PERMITIDAS</span>}
                        </div>
                        <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{championship.name}</h1>
                        <p className="mt-2 text-sm font-semibold text-zinc-400">
                            {isLegends ? `${LEGENDS_RANGE} · formato Battle Royale` : `${phases.length} fases · operação de campeonato`}
                        </p>
                    </div>

                    {championship.requiresActivation && (
                        <button type="button" onClick={() => void toggleActive()} disabled={updating} className={`rounded-xl px-5 py-3 text-sm font-black transition ${championship.currentPhaseId ? "bg-emerald-300 text-zinc-950 hover:bg-emerald-200" : "border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-cyan-300/40 hover:text-white"}`}>
                            {updating ? "Atualizando..." : championship.currentPhaseId ? "Desativar categoria" : "Ativar categoria"}
                        </button>
                    )}
                </section>

                {isLegends ? (
                    <section className="mt-8 rounded-3xl border border-fuchsia-300/20 bg-[radial-gradient(circle_at_50%_0%,rgba(232,121,249,0.14),transparent_50%),#100d16] p-8 lg:p-12">
                        <p className="text-center text-[10px] font-black tracking-[0.3em] text-fuchsia-300">FORMATO ESPECIAL</p>
                        <h2 className="mt-4 text-center text-3xl font-black">⚔ BATTLE ROYALE</h2>
                        <p className="mt-3 text-center text-sm font-semibold text-zinc-400">{LEGENDS_RANGE}</p>
                        <div className="mx-auto mt-8 max-w-2xl">
                            <PhaseTimeline championship={championship} onOpenPhase={phase => navigate(`/phases/${phase.id}`)} />
                        </div>
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <button type="button" onClick={() => void clearDisplay()} disabled={updating} className="rounded-xl border border-fuchsia-300/40 bg-fuchsia-300/10 px-5 py-3 text-sm font-black text-fuchsia-200 transition hover:bg-fuchsia-300/20 disabled:opacity-50">
                                Limpar display
                            </button>
                            <p className="text-xs font-semibold text-zinc-500">Tira a música do telão. O histórico de sorteios é mantido.</p>
                        </div>
                    </section>
                ) : (
                    <section className="mt-8 overflow-x-auto rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-6">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black tracking-[0.22em] text-zinc-500">PROGRESSÃO</p>
                                <h2 className="mt-1 text-lg font-black">Linha de fases</h2>
                            </div>
                            <p className="text-xs font-semibold text-zinc-500">{phases.length} etapas</p>
                        </div>
                        <PhaseTimeline championship={championship} onOpenPhase={phase => navigate(`/phases/${phase.id}`)} />
                    </section>
                )}

                <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0d1118] p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black tracking-[0.22em] text-zinc-500">OPERAÇÃO</p>
                                <h2 className="mt-1 text-xl font-black">{phaseActivation ? "Fases do campeonato" : "Listas de sorteio"}</h2>
                            </div>
                            {phaseActivation && activePhase && <span className="text-xs font-black tracking-[0.14em] text-cyan-300">{phaseName(activePhase)} ATIVA</span>}
                        </div>

                        <div className="mt-6 space-y-3">
                            {phases.map(phase => {
                                const state = getPhaseState(phases, phase, championship.currentPhaseId, championship.phaseActivation);
                                const isActive = state === "active";

                                return (
                                    <div key={phase.id} className={`flex flex-col gap-4 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${isActive ? "border-cyan-300/40 bg-cyan-300/[0.06]" : "border-zinc-800 bg-zinc-900/50"}`}>
                                        <button type="button" onClick={() => navigate(`/phases/${phase.id}`)} className="flex min-w-0 items-center gap-4 text-left">
                                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-black ${state === "complete" ? "border-emerald-300 bg-emerald-300 text-zinc-950" : isActive ? "border-cyan-300 bg-cyan-300 text-zinc-950" : "border-zinc-700 text-zinc-500"}`}>
                                                {phaseStateMark(state)}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-black text-white">{phaseName(phase)}</span>
                                                <span className="mt-1 block text-xs font-semibold text-zinc-400">{phaseDifficulty(phase)} · {phaseStateLabel(state)}</span>
                                            </span>
                                        </button>
                                        <div className="flex items-center gap-2 pl-13 sm:pl-0">
                                            <button type="button" onClick={() => navigate(`/phases/${phase.id}`)} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-black text-zinc-300 transition hover:border-cyan-300/40 hover:text-white">Gerenciar</button>
                                            {championship.requiresActivation && phaseActivation && (
                                                <button type="button" onClick={() => void setActivePhase(phase.id)} disabled={updating || isActive} className={`rounded-lg px-3 py-2 text-xs font-black ${isActive ? "bg-cyan-300 text-zinc-950" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                                                    {isActive ? "Ativa" : "Ativar"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <aside className="rounded-2xl border border-white/[0.08] bg-[#0d1118] p-6">
                        <p className="text-[10px] font-black tracking-[0.22em] text-zinc-500">ACESSO RÁPIDO</p>
                        <h2 className="mt-1 text-xl font-black">Operação ao vivo</h2>
                        <div className="mt-6 space-y-3">
                            <button type="button" onClick={() => openDisplay()} className="flex w-full items-center justify-between rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-4 text-left transition hover:border-cyan-300/50">
                                <span><span className="block text-sm font-black text-white">Tela do sorteador</span><span className="mt-1 block text-xs text-zinc-400">Abrir em uma tela separada</span></span><span className="text-xl text-cyan-300">↗</span>
                            </button>
                            <button type="button" onClick={() => navigate("/music-pool")} className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-4 text-left transition hover:border-zinc-600">
                                <span><span className="block text-sm font-black text-white">Lista de músicas</span><span className="mt-1 block text-xs text-zinc-400">Consultar o pool consolidado</span></span><span className="text-xl text-zinc-400">→</span>
                            </button>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}
