import {
    useParams
} from "react-router-dom";

import {
    usePhase
} from "../hooks/usePhase";

import { useState } from "react";

import {
    drawCharts
} from "../hooks/useDraw";

import AddChartModal from "../components/AddChartModal";

import { api } from "../services/api";

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

    async function handleDraw() {

        try {

            setDrawing(true);

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

            const channel =
                new BroadcastChannel(
                    "piu-randomizer-draw"
                );

            channel.postMessage({
                draws: result.draws,
                seed: result.seed
            });

            channel.close();

        } catch {

            alert(
                "Unable to draw charts"
            );

        } finally {

            setDrawing(false);
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
        } catch {

            alert(
                "Unable to clear history"
            );
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

    return (

        <div
            className="
                min-h-screen

                bg-black
                text-white

                p-10
            "
        >

            <h1
                className="
                    text-5xl
                    font-bold
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

                {phase.mode}
                {" "}

                {phase.minLevel}

                {
                    phase.allowOver
                        ? "+"
                        : `~${phase.maxLevel}`
                }

            </p>

                <button
                    onClick={handleDraw}

                    disabled={drawing}

                    className="
                        bg-blue-600

                        px-6
                        py-3

                        rounded-xl

                        font-bold

                        mb-8
                    "
                >

                    {
                        drawing
                        ? "Drawing..."
                        : "Draw Songs"
                    }

                </button>

            <h2
                className="
                    text-2xl
                    font-bold
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
                        bg-green-600

                        px-5
                        py-3

                        rounded-xl

                        mb-6
                    "
                >
                    + Add Chart
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
                    phase.availableCharts.map(
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
                                    bg-zinc-900

                                    rounded-xl

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
                                            `http://localhost:3000/banners/${item.chart.song.bannerPath}`
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

                                    <div
                                        className={`
                                            absolute
                                            
                                            right-2
                                            
                                            w-12
                                            h-12
                                            
                                            rounded-full
                                            
                                            flex
                                            items-center
                                            justify-center
                                            
                                            font-bold
                                            
                                            text-white
                                            
                                            ${
                                                item.chart.mode === "S"
                                                    ? "bg-orange-500"
                                                    : "bg-green-600"
                                            }
                                        `}
                                    >

                                        {item.chart.level}

                                    </div>

                                </div>

                                    <h3
                                        className="
                                            text-lg
                                            font-bold
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
                                                bg-red-600

                                                hover:bg-red-500

                                                px-3
                                                py-1

                                                rounded-lg

                                                text-sm
                                            "
                                        >
                                            Remove
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
                    text-2xl
                    font-bold

                    mt-10
                    mb-4
                "
            >
                Draw History
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
                        bg-red-700

                        hover:bg-red-600

                        px-4
                        py-2

                        rounded-xl

                        font-bold
                    "
                >

                    Clear History

                </button>

            </div>
                {
                    phase.draws.map(
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
                                    bg-zinc-800

                                    p-4

                                    rounded-xl
                                "
                            >

                                {
                                    draw.chart.song.title
                                }

                                {" - "}

                                {
                                    draw.chart.mode
                                }

                                {
                                    draw.chart.level
                                }

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
                    drawResult && (

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

                                <div
                                    className="
                                        text-center

                                        mt-6
                                    "
                                >

                                    <button

                                        onClick={() =>
                                            setShowDrawModal(
                                                false
                                            )
                                        }

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

