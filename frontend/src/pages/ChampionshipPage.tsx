import { useNavigate, useParams } from "react-router-dom";

import { useChampionship } from "../hooks/useChampionship";

export default function ChampionshipPage() {

    const { id } = useParams();

    const navigate = useNavigate();

    const {
        championship, 
        loading
    } = useChampionship(
        id!
    );

    if (
        loading ||
        !championship
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
                        text-5x1
                        font-bold
                        mb-10
                    "
                >
                    {championship.name}
                </h1>

                <div
                    className="
                        grid
                        gap-4
                    "
                >

                    {
                        championship.phases.map(
                            (phase: any) => (

                                <div
                                    key={phase.id}

                                    onClick={() => 
                                        navigate(
                                            `/phases/${phase.id}`
                                        )
                                    }

                                    className="
                                        bg-zinc-900
                                        p-5
                                        rounded-x1
                                        cursor-pointer
                                        hover:border-blue-500
                                        transition
                                    "

                                >
                                    
                                    <h2
                                        className="
                                            text-2x1
                                            font-bold
                                        "
                                    >
                                        {phase.name}                                        
                                    </h2>

                                    <p>
                                        {phase.mode}
                                        {" "}
                                        {phase.minLevel}

                                        {
                                            phase.allowOver
                                            ? "+"
                                            : `~${phase.maxLevel}`
                                        }
                                    </p>

                                </div>
                            )
                        )
                    }

                </div>
                
            </div>
        );
    }