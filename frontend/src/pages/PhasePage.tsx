import {
    useParams
} from "react-router-dom";

import {
    usePhase
} from "../hooks/usePhase";

import {
    useRef,
    useState,
    useEffect
} from "react";

import {
    drawCharts,
    rerollChart
} from "../hooks/useDraw";

import AddChartModal from "../components/AddChartModal";
import { StepBadge } from "../components/CompetitionComponents";

import { api } from "../services/api";
import { sendDisplayEvent } from "../services/displayEvents";

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
}

export default function PhasePage() {

    const { id } =
        useParams();

    const {
        phase,
        loading,
        reload
    } = usePhase(
        id!
    );

    const [
        drawResult,
        setDrawResult
    ] = useState<DrawResult | null> (
        null
    );

    const [
        drawing,
        setDrawing
    ] = useState(false);

    const [
        showModal,
        setShowModal
    ] = useState(false);

    const [
        showDrawModal,
        setShowDrawModal
    ] = useState(false);

    const [
        blockReason,
        setBlockReason
    ] = useState<string | null>(null);

    const [
        activating,
        setActivating
    ] = useState(false);

    const [
        isActivePhase,
        setIsActivePhase
    ] = useState(false);

    // "modo:nivel" do slot em reroll (S23 e D23 sao slots diferentes)
    const [
        rerollingSlot,
        setRerollingSlot
    ] = useState<string | null>(null);

    const [
        allowRepeats,
        setAllowRepeats
    ] = useState(false);

    const [
        requiresActivation,
        setRequiresActivation
    ] = useState(true);

    const championshipId =
        phase?.championshipId;

    useEffect(
        () => {
            if (
                !championshipId ||
                !id
            ) {
                return;
            }

            api
                .get(
                    `/championships/${championshipId}`
                )
                .then(
                    (res) => {
                        setIsActivePhase(
                            res.data
                                .currentPhaseId ===
                                id
                        );

                        setAllowRepeats(
                            res.data
                                .allowRepeats
                        );

                        setRequiresActivation(
                            res.data
                                .requiresActivation
                        );
                    }
                );
        },
        [
            championshipId,
            id
        ]
    );

    const drawingRef =
        useRef(false);

    async function handleDraw() {

        if (drawingRef.current) {
            return;
        }

        if (
            requiresActivation &&
            !isActivePhase
        ) {

            setBlockReason("not-active");
            setShowDrawModal(true);
            return;
        }

        if (
            !allowRepeats &&
            phase!.draws.length > 0
        ) {

            setBlockReason(
                "already-drawn"
            );
            setShowDrawModal(true);
            return;
        }

        drawingRef.current =
            true;

        setDrawing(true);

        try {

            const result =
                await drawCharts(
                    phase!.id,
                    phase!.drawCount
                );
            
            setDrawResult(
                result
            );

            setShowDrawModal(
                true
            );

            await reload();

            void sendDisplayEvent({
                draws: result.draws,
                seed: result.seed,
                rerollLevel: result.rerollLevel
            });

        } catch {

            alert(
                "Unable to draw charts"
            );

        } finally {

            drawingRef.current =
                false;

            setDrawing(false);
        }
    }

    async function handleReroll(level: number, mode: string) {
        if (rerollingSlot !== null) return;

        setRerollingSlot(`${mode}:${level}`);

        try {
            const result = await rerollChart(
                phase!.id,
                level,
                mode
            );
            const rerollResult = {
                ...result,
                rerollLevel: level,
                rerollMode: mode,
                draws: result.draws.filter(
                    (draw: { level: number; mode: string }) =>
                        draw.level === level &&
                        draw.mode === mode
                )
            };

            setDrawResult(rerollResult);
            setShowDrawModal(true);
            await reload();

            void sendDisplayEvent({
                draws: rerollResult.draws,
                seed: rerollResult.seed,
                rerollLevel: level,
                rerollMode: mode
            });
        } catch {
            alert("Não foi possível realizar o reroll");
        } finally {
            setRerollingSlot(null);
        }
    }

    async function removeChart(
        phaseChartId: string
    ) {
       
        try {

            await api.delete(
                `/phases/charts/${phaseChartId}`
            );

            await reload();
        } catch {

            alert(
                "Unable to remove chart"
            );
        } 
    }

    async function clearHistory() {

        const confirmed =
            confirm(
                "Clear all draw history?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/phases/${phase!.id}/history`
            );

            await reload();

            setDrawResult(
                null
            );

            setBlockReason(
                null
            );

            void sendDisplayEvent({
                type: "phase-update"
            });
        } catch {

            alert(
                "Unable to clear history"
            );
        }
    }

    async function activatePhase() {

        setActivating(true);

        try {

            const newPhaseId =
                isActivePhase
                    ? null
                    : phase!.id;

            await api.patch(
                `/championships/${phase!.championshipId}/current-phase`,
                {
                    phaseId: newPhaseId
                }
            );

            setIsActivePhase(
                !isActivePhase
            );

            void sendDisplayEvent({
                type: "phase-update"
            });

        } finally {

            setActivating(false);
        }
    }

    if (
        loading ||
        !phase
    ) {

        return (
            <div
                className="
                    min-h-screen
                    bg-black
                    text-white

                    flex
                    items-center
                    justify-center
                "
            >
                Loading...
            </div>
        );
    }

    const sortedCharts =
        [...phase.availableCharts].sort(
            (a, b) =>
                a.chart.level - b.chart.level ||
                a.chart.song.title.localeCompare(
                    b.chart.song.title
                )
        );

    const sortedDraws =
        [...phase.draws].sort(
            (a, b) =>
                a.chart.level - b.chart.level ||
                a.chart.song.title.localeCompare(
                b.chart.song.title
                )
        );

    const rerollAllowed =
        phase.order > 1 &&
        !/final/i.test(phase.name);

    return (

        <div
            className="
                min-h-screen

                bg-transparent
                text-white

                    px-6
                    py-8
                    lg:px-10
                    lg:py-12
            "
        >

            <button
                type="button"
                onClick={() => window.history.back()}
                className="mb-8 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-black text-zinc-400 transition hover:border-zinc-600 hover:text-white"
            >
                ← Voltar
            </button>

            <h1
                className="
                    text-4xl
                    font-black
                    mb-2
                "
            >
                {phase.name}
            </h1>

            <p
                className="
                    text-zinc-400
                    mb-8
                "
            >

                {phase.description ?? (
                    <>
                        {phase.mode}
                        {" "}

                        {phase.minLevel}

                        {
                            phase.allowOver
                                ? "+"
                                : `~${phase.maxLevel}`
                        }
                    </>
                )}

            </p>

                <div
                    className="
                        flex
                        gap-4
                        mb-8
                    "
                >
                <button
                    onClick={handleDraw}

                    disabled={drawing}

                    className="
                        bg-cyan-300
                        text-zinc-950

                        px-6
                        py-3

                        rounded-xl

                        font-bold
                    "
                >

                    {
                        drawing
                        ? "Drawing..."
                        : "Draw Songs"
                    }

                </button>

                {
                    requiresActivation && (
                        <button
                            onClick={
                                activatePhase
                            }

                            disabled={
                                activating
                            }

                            className="
                                bg-emerald-300
                                text-zinc-950

                                px-6
                                py-3

                                rounded-xl

                                font-bold
                            "
                        >

                            {
                                activating
                                    ? "Ativando..."
                                    : isActivePhase
                                        ? "Desativar Fase"
                                        : "Ativar Fase"
                            }

                        </button>
                    )
                }
                </div>

            <h2
                className="
                    text-xl
                    font-black
                    mb-4
                "
            >
                Charts
            </h2>

                <button
                    onClick={() => {
                        console.log("BUTTON CLICK");
                        setShowModal(true);
                    }}

                    className="
                    bg-zinc-800
                    border
                    border-zinc-700
                    hover:border-cyan-300/40

                        px-5
                        py-3

                        rounded-xl

                        mb-6
                    "
                >
                    + Adicionar chart
                </button>

            <div
                className="
                    grid
                    
                    grid-cols-1
                    md:grid-cols-2
                    lg:grid-cols-4
                    xl:grid-cols-5

                    gap-6
                "
            >

                {
                    sortedCharts.map(
                        (item: {
                            id: string;

                            chart: {
                                id: string;

                                mode: string;

                                level: number;

                                song: {
                                    title: string;

                                    bannerPath: string;
                                };
                            };
                        }) => (

                            <div
                                key={item.id}

                                className="
                                    bg-[#0d1118]
                                    border
                                    border-zinc-800

                                    rounded-2xl

                                    p-4

                                    flex
                                    flex-col

                                    gap-3

                                    items-center
                                    justify-center

                                "
                            >

                                <div>

                                    <div
                                        className="
                                            relative
                                        "
                                    >
                                         <img

                                         src={
                                             `${ASSETS_URL}/banners/${encodeURIComponent(item.chart.song.bannerPath)}`
                                         }
                                     
                                         alt={
                                             item.chart.song.title
                                         }

                                         className=" 
                                             w-full

                                             rounded-lg

                                             mb-3
                                         "

                                     />

                                    <StepBadge mode={item.chart.mode} level={item.chart.level} className="absolute right-2 top-2 h-12 w-12" />

                                </div>

                                    <h3
                                        className="
                                                text-sm
                                                font-black
                                        "
                                    >
                                        {
                                            item.chart.song.title
                                        }
                                    </h3>

                                    <div>
                                        <button

                                            onClick={() =>
                                                removeChart(
                                                    item.id
                                                )
                                            }

                                            className="
                                                mt-auto
                                                border
                                                border-red-400/20
                                                bg-red-400/10

                                                hover:bg-red-500

                                                px-3
                                                py-1

                                                rounded-lg

                                                text-sm
                                            "
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )
                }
            </div>



            <h2 
                className="
                    text-xl
                    font-black

                    mt-10
                    mb-4
                "
            >
                    Histórico de sorteios
            </h2>

            <div
                className="
                    grid
                    gap-3
                "
            >
            <div 
                className="
                    flex
                    justify-end
                    mb-4
                "
            >

                <button 
                    onClick={
                        clearHistory
                    }

                    className="
                        border
                        border-red-400/20
                        bg-red-400/10
                        text-red-200

                        hover:bg-red-600

                        px-4
                        py-2

                        rounded-xl

                        font-bold
                    "
                >

                    Limpar histórico

                </button>

            </div>
                {
                    sortedDraws.map(
                        (draw: {
                            id: string;

                            chart: {
                                mode: string;

                                level: number;

                                song: {
                                    title: string;
                                };
                            };
                        }) => (

                            <div
                                key={draw.id}

                                className="
                                    border
                                    border-zinc-800
                                    bg-[#0d1118]
                                    text-sm
                                    font-semibold
                                    text-zinc-300

                                    p-4

                                    rounded-xl
                                "
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <span>
                                        {draw.chart.song.title}
                                        {" - "}
                                        {draw.chart.mode === "X2"
                                            ? "X2"
                                            : `${draw.chart.mode} ${draw.chart.level}`}
                                    </span>

                                    {rerollAllowed && (
                                        <button
                                            type="button"
                                            onClick={() => void handleReroll(draw.chart.level, draw.chart.mode)}
                                            disabled={
                                                rerollingSlot !== null ||
                                                (requiresActivation && !isActivePhase)
                                            }
                                            className="shrink-0 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-[10px] font-black tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {rerollingSlot === `${draw.chart.mode}:${draw.chart.level}`
                                                ? "REROLLING..."
                                                : "REROLL"}
                                        </button>
                                    )}
                                </div>

                            </div>
                        )
                    )
                }

                {
                    showModal && (

                        <AddChartModal

                            phase={phase}

                            onClose={() =>
                                setShowModal(false)
                            }

                            onAdded={reload}

                        />
                    )
                }

                {
                    showDrawModal &&
                    (drawResult || blockReason) && (

                        <div
                            className="
                                fixed
                                inset-0
                                bg-black/80

                                flex
                                items-center
                                justify-center

                                z-50
                            "
                        >

                            <div
                                className="
                                    bg-zinc-950

                                    rounded-2xl

                                    p-8

                                    w-full

                                    mx-4
                                "
                            >

                                {
                                    blockReason ===
                                    "not-active"
                                        ? (
                                            <div
                                                className="
                                                    text-center
                                                    text-3xl
                                                    font-bold
                                                    py-16
                                                    px-4
                                                "
                                            >
                                                Ative esta fase antes de realizar o sorteio
                                            </div>
                                        )
                                        : blockReason ===
                                        "already-drawn"
                                        ? (
                                            <div
                                                className="
                                                    text-center
                                                    text-3xl
                                                    font-bold
                                                    py-16
                                                    px-4
                                                "
                                            >
                                                O Sorteio dessa Fase já foi realizado, confira as músicas sorteadas no Histórico
                                            </div>
                                        )
                                        : (
                                            <div
                                                className="
                                                    text-center
                                                    text-4xl
                                                    font-bold
                                                    py-16
                                                "
                                            >
                                                Sorteando músicas
                                            </div>
                                        )
                                }

                                <div
                                    className="
                                        text-center

                                        mt-6
                                    "
                                >

                                    <button

                                        onClick={() => {
                                            setShowDrawModal(
                                                false
                                            );
                                            setBlockReason(
                                                null
                                            );
                                        }}

                                        className="
                                            bg-blue-600
                                            
                                            px-6
                                            py-3

                                            rounded-xl
                                            
                                            font-bold
                                        "
                                    >
                                        Close

                                    </button>

                                </div>


                            </div>


                        </div>
                    )
                }

            </div>

        </div>
    );
}
