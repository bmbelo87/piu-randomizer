import {
    useEffect,
    useState,
    useRef,
    useCallback
} from "react";

interface DrawRevealProps {

    draws: {

        song: string;

        bannerPath: string;

        previewPath: string | null;

        mode: string;

        level: number;
    }[];

    availableCharts: {
            chart: {
                song: {
                    title:string;
                    bannerPath: string;
                };
            };
        }[]
}

export default function DrawReveal({
    draws,
    availableCharts
}: DrawRevealProps) {

    const [
        visible,
        setVisible
    ] = useState(
        draws.length > 0
            ? 0
            : 0
    );

    const [
        countdown,
        setCountdown
    ] = useState(3);

    const [
        started,
        setStarted
    ] = useState(false);

    const [ 
        rouletteList,
        setRouletteList
    ] = useState<string[][]>([]);

    const [
        roulettePosition,
        setRoulettePosition
    ] = useState<number[]>([]);

    const [
        activeReveal,
        setActiveReveal
    ] = useState<number | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const revealNextCard = useCallback((index: number) => {
        if (index >= draws.length) return;

        setActiveReveal(index);

        const previewPath = draws[index].previewPath;
        if (previewPath) {
            const audio = new Audio(`http://localhost:3000/previewsongs/${previewPath}`);
            audio.volume = 0.3;
            audioRef.current = audio;
            audio.play();

            audio.onended = () => {
                setActiveReveal(null);
                setTimeout(() => revealNextCard(index + 1), 500);
            };
        } else {
            setTimeout(() => {
                setActiveReveal(null);
                setTimeout(() => revealNextCard(index + 1), 500);
            }, 3000);
        }
    }, [draws]);

    useEffect(() => {
        if (!started) return;

        const revealTimer = setTimeout(() => {
            revealNextCard(0);
        }, 5700);

        return () => {
            clearTimeout(revealTimer);
            audioRef.current?.pause();
        };
    }, [started, revealNextCard]);

    useEffect(() => {

        console.log(
            "EFFECT",
            draws.length,
            availableCharts.length
        );

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStarted(false);

        setVisible(0);

        setCountdown(3);



        const countdown3 = 
            setTimeout(() => {
                setCountdown(2);
            }, 1000);

        const countdown2 = 
            setTimeout(() => {
                setCountdown(1);
            }, 2000);

        const startReveal =
            setTimeout(() => {

                console.log("START REVEAL");

                setStarted(true);

                draws.forEach(
                    (draw, index) => {

                        console.log("DRAW", index, draw.song)
                        
                        const rouletteItems =
                            Array.from(
                                { length: 30 },
                                () => {

                                    const randomChart = 
                                        availableCharts[
                                            Math.floor(
                                                Math.random() *
                                                availableCharts.length
                                            )
                                        ];

                                    return (
                                        randomChart
                                            .chart
                                            .song
                                            .bannerPath
                                    );
                                }
                            );
                        
                        rouletteItems.push( 
                            draw.bannerPath
                        );

                        setRouletteList(
                            previous => {
                                const updated =
                                    [...previous];

                                updated[index] =
                                    rouletteItems;

                                return updated;
                            }
                        );

                        setRoulettePosition(
                            previous => {
                                const updated =
                                    [...previous];

                                updated[index] = 0;

                                return updated;
                            }
                        );

                        const finalPosition = 
                        (
                            rouletteItems.length - 1
                        ) * 274;

                        const overshootPosition =
                            finalPosition + 25;

                        setTimeout(() => {
                            setRoulettePosition(
                                previous => {

                                    const updated =
                                        [...previous];

                                    updated[index] = 
                                        overshootPosition;

                                    return updated;
                                }
                            );
                        }, 100);

                        setTimeout(() => {
                            setRoulettePosition(
                                previous => {

                                    const updated =
                                        [...previous];

                                    updated[index] =
                                        finalPosition;
                                
                                    return updated;
                                }
                            )
                        }, 5600)

                        // setTimeout(() =>{
                        //     setVisible(
                        //         index + 1
                        //     );
                        // }, 5200);
                     
                    }
                );
                
            }, 3000);

        return () => {

            clearTimeout(
                countdown3
            );

            clearTimeout(
                countdown2
            );

            clearTimeout(
                startReveal
            );
        };
    }, [
        // draws, availableCharts
    ]);

    if (!started) {

        return (

            <div
                className="
                    text-center
                "
            >

                <div
                    className="
                        text-3x1
                        font-bold

                        mb-6
                    "
                >
                    DRAWING SONGS
                </div>

                <div
                    className="
                        text-8xl
                        font-black

                        animate-pulse
                    "
                
                >
                    {countdown}
                </div>

            </div>
        );
    }

    return (

        <div
            className="
                flex
                items-center
                justify-center

                gap-6

                overflow-x-visible

                py-8
            "
        >

            {
                draws.map (
                    (draw, index) => (

                        <div
                            key = {index}

                            className={`
                                bg-zinc-900

                                rounded-xl

                                p-4

                                flex-shrink-0
                                
                                w-100
                                h-100

                                flex
                                items-center
                                justify-center

                                transition-all
                                duration-500

                                ${
                                    activeReveal === index
                                        ? `
                                            z-10
                                            scale-125
                                            ring-4
                                            ring-yellow-400
                                            shadow-[0_0_40px_rgba(255,215,0,0.6)]
                                        `
                                        : `
                                            border
                                            border-blue-500
                                        `
                                }
                            `}
                        >
                            <div
                                className="
                                    relative

                                    w-100

                                    h-[274px]

                                    overflow-hidden

                                    rounded-xl

                                    border
                                    border-zinc-700
                                "
                            >
                                <div
                                    className="
                                        transition-transform
                                        ease-out
                                    "

                                    style={{

                                        transitionDuration:
                                            "5.5s",

                                        transform:
                                            `translateY(-${
                                                roulettePosition[index] ?? 0
                                            }px)`
                                    }}
                                    >
                                    {
                                        rouletteList[index]?.map(
                                            (
                                                banner,
                                                bannerIndex
                                            ) => (

                                                <img

                                                    key={
                                                        bannerIndex
                                                    }

                                                    src={
                                                        `http://localhost:3000/banners/${banner}`
                                                    }

                                                    alt="Roulette"

                                                    className="
                                                        w-100
                                                        h-[274px]

                                                        object-cover
                                                    "

                                                />
                                            )
                                        )
                                    }

                                </div>

                                {
                                    activeReveal === index && (
                                        <div
                                            className={`
                                                absolute

                                                bottom-3
                                                right-3

                                                w-14
                                                h-14

                                                rounded-full

                                                flex
                                                items-center
                                                justify-center

                                                font-bold
                                                text-xl

                                                text-white

                                                ${
                                                    draw.mode === "S"
                                                        ? "bg-orange-500"
                                                        : "bg-green-600"
                                                }
                                            `}
                                        >

                                            {draw.level}

                                        </div>
                                    )
                                }

                            </div>

                        </div>
                    )
                )
            }
            
        </div>
    );
}