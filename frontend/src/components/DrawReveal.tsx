import {
    useEffect,
    useState
} from "react";

interface DrawRevealProps {

    draws: {

        song: string;

        bannerPath: string;

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

    // const [
    //     activeReveal,
    //     setActiveReveal
    // ] = useState(0);

    // cosnt [
    //     centerBanner,
    //     setCenterBanner
    // ] = useState<string | null>(null);

    // const [
    //     showingPreview,
    //     setShowingPreview
    // ] = useState(false);

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

                overflow-x-auto

                pb-4
            "
        >

            {
                draws.map (
                    (draw, index) => (

                        <div
                            key = {index}

                            className="
                                bg-zinc-900
                                
                                border
                                border-blue-500

                                rounded-xl

                                p-4

                                flex-shrink-0
                                
                                w-100
                                h-100

                                flex
                                items-center
                                justify-center
                            "
                        >
                            {
                                visible > index
                                ? (

                                    <div    
                                        className="
                                            flex
                                            flex-col

                                            w-full

                                            gap-4

                                            items-center
                                            justify-center
                                        "
                                    >

                                    <div
                                        className="
                                            relative  
                                        "
                                    >

                                        <img
                                            src={
                                                `http://localhost:3000/banners/${draw.bannerPath}`
                                            }

                                            alt={
                                                draw.song
                                            }
                                            
                                            className="
                                                w-100

                                                rounded-xl

                                                border
                                                border-zinc-700
                                            "
                                        />

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
                                    
                                    </div>


                                        <div
                                            className="
                                                text-xl
                                                font-bold
                                            "
                                        >
                                            {draw.song}
                                        </div>

                                    </div>
                                    
                                ) 
                                : (

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

                                    </div>

                                )
                            }

                        </div>
                    )
                )
            }
            
        </div>
    );
}