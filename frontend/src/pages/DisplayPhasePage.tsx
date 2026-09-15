import { useEffect, useRef, useState } from "react";
import { useDisplay } from "../hooks/useDisplay";
import DrawReveal from "../components/DrawReveal";

export default function DisplayPhasePage() {

    const {
        data,
        loading,
        refetch
    } = useDisplay();

    const [
        showDrawModal,
        setShowDrawModal
    ] = useState(false);

    const [
        drawResult,
        setDrawResult
    ] = useState<{
        draws: {
            song: string;
            bannerPath: string;
            previewPath: string | null;
            mode: string;
            level: number;
        }[];
        seed: string;
    } | null>(null);

    const [
        audioReady,
        setAudioReady
    ] = useState(false);

    const audioContextRef =
        useRef<AudioContext | null>(null);

    function handleEnableAudio() {

        const ctx =
            new AudioContext();

        audioContextRef.current =
            ctx;

        setAudioReady(true);
    }

    useEffect(() => {
        const channel =
            new BroadcastChannel(
                "piu-randomizer-draw"
            );

        channel.onmessage = (
            event
        ) => {
            const msg = event.data;

            refetch();

            if (
                msg.type ===
                "phase-update"
            ) {
                setShowDrawModal(false);
                setDrawResult(null);
                return;
            }

            setDrawResult({
                draws: msg.draws,
                seed: msg.seed
            });

            setShowDrawModal(true);
        };

        return () =>
            channel.close();

    }, [refetch]);

    if (
        loading ||
        !data
    ) {

        return (
            <div>
                Loading...
            </div>
        );
    }

    const {
        championship,
        phase
    } = data;

    const allPhases =
        data.allPhases ?? [];

    const isActive =
        championship.currentPhaseId
            ? true
            : false;

    let endState:
        "none"
        | "championship-ended"
        = "none";

    if (!isActive) {

        const anyDraws =
            allPhases.some(
                p => p.drawCount > 0
            );

        if (anyDraws) {

            const maxOrder =
                Math.max(
                    ...allPhases.map(
                        p => p.order
                    )
                );

            const lastPhase =
                allPhases.find(
                    p =>
                        p.order === maxOrder
                );

            if (
                lastPhase &&
                lastPhase.drawCount > 0
            ) {
                endState =
                    "championship-ended";
            }
        }
    }

    const ended =
        endState !== "none";

    function renderContent() {

        if (ended) {

            return (
                <div
                    className="
                        flex
                        flex-col
                        items-center
                        justify-center

                        min-h-[60vh]
                    "
                >
                    <div
                        className="
                            text-6xl
                            font-black
                            text-center
                            mb-6
                        "
                    >
                        🏆
                    </div>
                    <div
                        className="
                            text-4xl
                            font-bold
                            text-center
                        "
                    >
                        Campeonato Encerrado
                    </div>
                </div>
            );
        }

        if (!phase) {

            if (
                !ended &&
                allPhases.length > 0
            ) {
                return (
                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            min-h-[60vh]
                        "
                    >
                        <div
                            className="
                                text-4xl
                                font-bold
                                text-center
                            "
                        >
                            Aguardando...
                        </div>
                    </div>
                );
            }

            return null;
        }

        return (
            <>
                <div
                    className="
                        text-4xl

                        font-bold

                        mb-4
                    "
                >
                    {phase.name}
                </div>
                <div 
                    className="
                        text-center

                        text-2xl

                        text-zinc-400

                        mb-12
                    "
                >

                    {phase.mode}

                    {" • "}

                    {phase.minLevel}

                    {" ~ "}

                    {phase.maxLevel}

                </div>

                <div
                    className="
                        border-t

                        border-zinc-700

                        mb-8
                    "
                />

                <div
                    className="
                        text-center

                        text-4xl

                        font-bold

                        mb-8
                    "
                >
                    DRAW RESULTS
                </div>

                <div 
                    className="
                        flex
                        flex-wrap

                        justify-center

                        gap-8
                    "    
                >
                    {
                        [...phase.draws]
                            .sort(
                                (a, b) =>
                                    a.chart.level - b.chart.level ||
                                    a.chart.song.title.localeCompare(
                                        b.chart.song.title
                                    )
                            )
                            .map(
                            draw => (

                                <div
                                    key={
                                        draw.id
                                    }
                                    
                                    className="
                                        w-[400px]
                                    "
                                >

                                    <img
                                        src={
                                            `http://localhost:3000/banners/${draw.chart.song.bannerPath}`
                                        }
                                        
                                        alt={
                                            draw.chart.song.title
                                        }

                                        className="
                                            w-full

                                            rounded-xl

                                            border
                                            border-zinc-700
                                        "
                                    />

                                    <div 
                                        className="
                                            mt-3
                                            
                                            text-center
                                            
                                            text-2xl
                                            
                                            font-bold
                                        "
                                    >
                                        {
                                            draw.chart.song.title
                                        }
                                    </div>

                                    <div
                                        className="
                                            text-center
                                            
                                            text-zinc-400
                                            
                                            text-lg
                                        "
                                    >
                                        {
                                            draw.chart.mode
                                        }
                                        {" "}
                                        {
                                            draw.chart.level
                                        }
                                    </div>

                                </div>
                            )
                        )
                    }

                </div>
            </>
        );
    }

    return (

        <div
            className="
                min-h-screen

                bg-black

                text-white

                p-8
            "
        >

            <div
                className="
                    max-w-7xl

                    mx-auto
                "
            >

                <h1
                className="
                    text-5xl
                    font-bold
                    mb-12
                "
                >
                    {championship?.name}
                </h1>

                {renderContent()}
                
            </div>

        {
            !ended &&
            showDrawModal &&
            drawResult &&
            phase && (
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

                        <DrawReveal
                            key={
                                drawResult.seed
                            }

                            draws={
                                drawResult.draws
                            }

                            availableCharts={
                                phase
                                    .availableCharts
                            }

                            audioContext={
                                audioReady
                                    ? audioContextRef
                                        .current
                                    : null
                            }
                        />

                    </div>

                </div>
            )
        }

        {
            !audioReady && (
                <div
                    onClick={
                        handleEnableAudio
                    }

                    className="
                        fixed
                        inset-0
                        bg-black/90

                        flex
                        items-center
                        justify-center

                        z-[100]

                        cursor-pointer
                    "
                >

                    <div
                        className="
                            text-4xl
                            font-bold
                            text-center

                            px-8
                        "
                    >
                        Clique para ativar o áudio
                    </div>

                </div>
            )
        }
        </div>
    );

}