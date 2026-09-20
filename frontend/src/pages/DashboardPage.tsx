import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useChampionships } from "../hooks/useChampionships";
import {
    CategoryCard
} from "../components/CompetitionComponents";
import type { Championship } from "../types/championship";

import { openDisplay } from "../services/config";
const PRIMARY_CATEGORIES = [
    "Intermediate",
    "Advanced",
    "Expert Single",
    "Expert Double",
    "Master",
    "Legends"
];

function sectionItems<T extends { name: string }>(
    items: T[],
    names: string[]
) {
    return names
        .map(name => items.find(item => item.name === name))
        .filter((item): item is T => Boolean(item));
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const {
        championships,
        loading,
        removeChampionship
    } = useChampionships();

    const primary = useMemo(
        () => sectionItems(championships, PRIMARY_CATEGORIES),
        [championships]
    );
    const secondary = useMemo(
        () => championships.filter(
            championship => !PRIMARY_CATEGORIES.includes(championship.name)
        ),
        [championships]
    );
    const totalPhases = championships.reduce(
        (total, championship) => total + championship.phases.length,
        0
    );
    const activeCategories = championships.filter(
        championship => Boolean(championship.currentPhaseId)
    ).length;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07090d] text-sm font-bold tracking-[0.16em] text-zinc-400">
                CARREGANDO CAMPEONATO...
            </div>
        );
    }

    function remove(championshipName: string, championshipId: string) {
        if (confirm(`Remover o campeonato "${championshipName}"?`)) {
            void removeChampionship(championshipId);
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-white">
            <header className="border-b border-white/[0.07] bg-[#0b0e14]/90">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-6 py-4 lg:px-10">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-black text-zinc-400 transition hover:border-zinc-600 hover:text-white">
                            ← Voltar
                        </button>
                        <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-sm font-black text-cyan-200">G26</span>
                            <span>
                                <span className="block text-[10px] font-black tracking-[0.24em] text-zinc-500">PIU EVENT CONTROL</span>
                                <span className="block text-sm font-black tracking-[0.12em] text-zinc-100">GAUCHONES 2026</span>
                            </span>
                        </button>
                    </div>

                    <nav className="hidden items-center gap-1 md:flex">
                        <span className="rounded-lg bg-white/[0.07] px-3 py-2 text-xs font-bold text-white">Visão geral</span>
                        <button type="button" onClick={() => navigate("/music-pool")} className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-400 transition hover:bg-white/[0.06] hover:text-white">Músicas</button>
                        <button type="button" onClick={openDisplay} className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-400 transition hover:bg-white/[0.06] hover:text-white">Sorteador</button>
                        <span className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-600">Configurações</span>
                    </nav>

                    <button type="button" onClick={() => navigate("/create-championship")} className="rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-black text-zinc-950 transition hover:bg-cyan-200">
                        + Novo Campeonato
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10 lg:py-12">
                <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.13),transparent_35%),#0d1118] p-7 lg:p-10">
                    <div className="absolute right-0 top-0 h-full w-1/3 opacity-30 [background-image:linear-gradient(rgba(103,232,249,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
                    <div className="relative max-w-3xl">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-emerald-300">● CAMPEONATO ATIVO</span>
                            <span className="text-[10px] font-bold tracking-[0.18em] text-zinc-500">PAINEL DE OPERAÇÃO</span>
                        </div>
                        <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">GAUCHONES <span className="text-cyan-300">2026</span></h1>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">Controle rápido das divisões, fases e operações do campeonato de Pump It Up.</p>
                    </div>

                    <div className="relative mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><p className="text-[10px] font-black tracking-[0.16em] text-zinc-500">CATEGORIAS</p><p className="mt-2 text-2xl font-black text-white">{championships.length}</p></div>
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><p className="text-[10px] font-black tracking-[0.16em] text-zinc-500">FASES</p><p className="mt-2 text-2xl font-black text-white">{totalPhases}</p></div>
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><p className="text-[10px] font-black tracking-[0.16em] text-zinc-500">EM ANDAMENTO</p><p className="mt-2 text-2xl font-black text-cyan-300">{activeCategories}</p></div>
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><p className="text-[10px] font-black tracking-[0.16em] text-zinc-500">TELA AO VIVO</p><button type="button" onClick={openDisplay} className="mt-2 text-sm font-black text-white hover:text-cyan-300">Abrir ↗</button></div>
                    </div>
                </section>

                <CategorySection title="Principais" subtitle="Disputas principais do campeonato" categories={primary} onOpen={id => navigate(`/championships/${id}`)} onRemove={remove} />
                <CategorySection title="Secundárias" subtitle="Formatos complementares e especiais" categories={secondary} onOpen={id => navigate(`/championships/${id}`)} onRemove={remove} />

                {championships.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-dashed border-zinc-700 p-10 text-center">
                        <p className="text-lg font-black">Nenhum campeonato configurado</p>
                        <button type="button" onClick={() => navigate("/create-championship")} className="mt-4 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-zinc-950">Criar campeonato</button>
                    </div>
                )}
            </main>
        </div>
    );
}

interface CategorySectionProps {
    title: string;
    subtitle: string;
    categories: Championship[];
    onOpen: (id: string) => void;
    onRemove: (name: string, id: string) => void;
}

function CategorySection({
    title,
    subtitle,
    categories,
    onOpen,
    onRemove
}: CategorySectionProps) {
    return (
        <section className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black tracking-[0.25em] text-cyan-300/70">DIVISÃO</p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{title}</h2>
                </div>
                <p className="hidden text-xs font-semibold text-zinc-500 sm:block">{subtitle}</p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
                {categories.map(championship => (
                    <CategoryCard
                        key={championship.id}
                        championship={championship}
                        onOpen={() => onOpen(championship.id)}
                        onRemove={() => onRemove(championship.name, championship.id)}
                    />
                ))}
            </div>
        </section>
    );
}
