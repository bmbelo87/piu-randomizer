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

    const phase = data?.phase;

    const championship = data?.championship;

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
        !phase
    ) {

        return (
            <div>
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
                "
                >
                    {championship?.name}
                </h1>

                <div
                    className="
                        text-4xl

                        font-bold

                        mb-4
                    "
                >
                    {phase?.name}
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
                        phase.draws.map(
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
                
            </div>

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