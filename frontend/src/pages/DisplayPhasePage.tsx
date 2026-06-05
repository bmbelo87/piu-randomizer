import { useDisplay } from "../hooks/useDisplay";

export default function DisplayPhasePage() {

    const {
        data,
        loading
    } = useDisplay();

    const phase = data?.phase;

    const championship = data?.championship;

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

        </div>
    );

}