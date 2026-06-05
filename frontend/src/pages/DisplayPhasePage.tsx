import { useEffect, useState } from "react";
import { useDisplay } from "../hooks/useDisplay";
import DrawReveal from "../components/DrawReveal";

export default function DisplayPhasePage() {

    const {
        data,
        loading
    } = useDisplay();

        const [
        showDrawModal,
        setShowDrawModal
    ] = useState(false);

    const [
        drawResult,
        setDrawResult
    ] = useState<{
        draws: unknown[];
        seed: string;
        } | null>(null);

    const [
        lastKnownSeed,
        setLastKnownSeed
    ] = useState("");

    const phase = data?.phase;

    const latestSeed =
        phase?.draws?.[
            (phase.draws.length ?? 1) - 1
        ]?.seed;

    const championship = data?.championship;

    useEffect(() => {
        if (!latestSeed) {
            return;
        }

        if (lastKnownSeed === "") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLastKnownSeed(latestSeed);
            return;
        }

        if (latestSeed === lastKnownSeed) {
            console.log(
                "SAME SEED",
                latestSeed
            );
            return;
        }

        const currentDraws =
            phase.draws.filter(
                draw =>
                    draw.seed === latestSeed
            );

        setLastKnownSeed(latestSeed);

        setDrawResult({

            draws: currentDraws,
            seed: latestSeed
        });

        setShowDrawModal(true);

        console.log(
            "OPEN MODAL",
            latestSeed
        );

    }, [
        latestSeed
    ]);

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

    const revealDraws =
        drawResult
            ? drawResult.draws.map(
                (draw:any) => ({
                    song: draw.chart.song.title,

                    bannerPath: draw.chart.song.bannerPath,

                    mode: draw.chart.mode,

                    level: draw.chart.level
                })
            )
        : [];

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
                            draws={revealDraws}

                            availableCharts={
                                phase.availableCharts
                            }
                        />

                    </div>

                </div>
            )
        }
        </div>
    );

}