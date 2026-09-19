import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../services/api";

interface PhaseForm {
    name: string;
    mode: string;
    minLevel: number;
    maxLevel: number;
    drawCount: number;
    allowOver: boolean;
}

export default function CreateChampionshipPage() {
    const navigate = useNavigate();
    const [championshipName, setChampionshipName] = useState("");
    const [phasesCount, setPhasesCount] = useState(5);
    const [allowRepeats, setAllowRepeats] = useState(false);
    const [requiresActivation, setRequiresActivation] = useState(true);
    const [phases, setPhases] = useState<PhaseForm[]>([]);

    function handleGenerate() {
        const generated: PhaseForm[] = [];
        for (let index = 1; index <= phasesCount; index += 1) {
            generated.push({
                name: index === phasesCount ? "Final" : index === phasesCount - 1 ? "Semi-Final" : `Phase ${index}`,
                mode: "S",
                minLevel: 0,
                maxLevel: 0,
                drawCount: 0,
                allowOver: false
            });
        }
        setPhases(generated);
    }

    function updatePhase(index: number, changes: Partial<PhaseForm>) {
        setPhases(previous => previous.map((phase, phaseIndex) => phaseIndex === index ? { ...phase, ...changes } : phase));
    }

    async function handleSave() {
        try {
            await api.post("/championships", {
                name: championshipName,
                allowRepeats,
                requiresActivation,
                phases
            });
            alert("Campeonato criado!");
            navigate("/");
        } catch (error) {
            console.error(error);
            alert("Não foi possível criar o campeonato");
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-white">
            <header className="border-b border-white/[0.07] bg-[#0b0e14]/90">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4 lg:px-10">
                    <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 text-left"><span className="text-xl text-zinc-500">←</span><span><span className="block text-[10px] font-black tracking-[0.22em] text-zinc-500">GAUCHONES 2026</span><span className="block text-sm font-black">Novo campeonato</span></span></button>
                    <span className="hidden text-[10px] font-black tracking-[0.2em] text-zinc-600 sm:block">CONFIGURAÇÃO DE EVENTO</span>
                </div>
            </header>

            <main className="mx-auto max-w-[1100px] px-6 py-8 lg:px-10 lg:py-12">
                <div className="mb-8"><p className="text-[10px] font-black tracking-[0.25em] text-cyan-300/70">SETUP</p><h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Criar campeonato</h1><p className="mt-3 text-sm text-zinc-400">Configure a estrutura do evento e suas etapas de operação.</p></div>

                <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0d1118] p-6">
                        <label className="block text-[10px] font-black tracking-[0.18em] text-zinc-500">NOME DO CAMPEONATO</label>
                        <input value={championshipName} onChange={event => setChampionshipName(event.target.value)} placeholder="Ex.: GAUCHONES 2026" className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-lg font-bold text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-300/60" />
                    </div>
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0d1118] p-6">
                        <p className="text-[10px] font-black tracking-[0.18em] text-zinc-500">REGRAS OPERACIONAIS</p>
                        <div className="mt-4 space-y-4">
                            <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-zinc-300"><input type="checkbox" checked={allowRepeats} onChange={event => setAllowRepeats(event.target.checked)} className="mt-0.5 accent-cyan-300" /><span><span className="block text-white">Permitir repetições</span><span className="mt-1 block text-xs text-zinc-500">Permite novo sorteio no mesmo nível.</span></span></label>
                            <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-zinc-300"><input type="checkbox" checked={requiresActivation} onChange={event => setRequiresActivation(event.target.checked)} className="mt-0.5 accent-cyan-300" /><span><span className="block text-white">Exigir ativação de fase</span><span className="mt-1 block text-xs text-zinc-500">Evita sorteios fora da etapa ativa.</span></span></label>
                        </div>
                    </div>
                </section>

                <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0d1118] p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black tracking-[0.18em] text-zinc-500">ESTRUTURA</p><h2 className="mt-1 text-xl font-black">Fases do campeonato</h2></div><div className="flex gap-2"><input type="number" min={2} value={phasesCount} onChange={event => setPhasesCount(Number(event.target.value))} className="w-24 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-bold outline-none focus:border-cyan-300/60" /><button type="button" onClick={handleGenerate} className="rounded-xl bg-cyan-300 px-4 py-2 text-xs font-black text-zinc-950 transition hover:bg-cyan-200">Gerar fases</button></div></div>

                    {phases.length === 0 ? <div className="mt-6 rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm font-semibold text-zinc-500">Defina o número de fases e gere a estrutura para começar.</div> : <div className="mt-6 grid gap-4 lg:grid-cols-2">{phases.map((phase, index) => <article key={index} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black tracking-[0.16em] text-cyan-300/70">FASE {index + 1}</p><h3 className="mt-1 text-lg font-black">{phase.name}</h3></div><span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[10px] font-black text-zinc-500">CONFIGURAR</span></div><div className="mt-5 grid grid-cols-2 gap-3"><Field label="Nome"><input value={phase.name} onChange={event => updatePhase(index, { name: event.target.value })} /></Field><Field label="Modo"><select value={phase.mode} onChange={event => updatePhase(index, { mode: event.target.value })}><option value="S">Single</option><option value="D">Double</option></select></Field><Field label="Nível mínimo"><input type="number" value={phase.minLevel} onChange={event => updatePhase(index, { minLevel: Number(event.target.value) })} /></Field><Field label="Nível máximo"><input type="number" value={phase.maxLevel} onChange={event => updatePhase(index, { maxLevel: Number(event.target.value) })} disabled={phase.allowOver} /></Field><Field label="Músicas sorteadas"><input type="number" value={phase.drawCount} onChange={event => updatePhase(index, { drawCount: Number(event.target.value) })} /></Field><label className="flex items-end gap-2 pb-2 text-xs font-bold text-zinc-400"><input type="checkbox" checked={phase.allowOver} onChange={event => updatePhase(index, { allowOver: event.target.checked })} className="accent-cyan-300" /> Permitir OVER</label></div></article>)}</div>}
                </section>

                {phases.length > 0 && <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => navigate("/")} className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-black text-zinc-300 hover:border-zinc-500 hover:text-white">Cancelar</button><button type="button" onClick={() => void handleSave()} className="rounded-xl bg-emerald-300 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-emerald-200">Salvar campeonato</button></div>}
            </main>
        </div>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return <label className="block"><span className="mb-2 block text-[10px] font-black tracking-[0.12em] text-zinc-500">{label}</span><span className="block [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-zinc-700 [&_input]:bg-zinc-900 [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:font-bold [&_input]:text-white [&_input]:outline-none [&_input]:focus:border-cyan-300/60 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-zinc-700 [&_select]:bg-zinc-900 [&_select]:px-3 [&_select]:py-2 [&_select]:text-sm [&_select]:font-bold [&_select]:text-white [&_select]:outline-none">{children}</span></label>;
}
