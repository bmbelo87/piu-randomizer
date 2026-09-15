import {
  useChampionships
} from "../hooks/useChampionships";

import { useNavigate } from "react-router-dom";

export default function DashboardPage() {

    const navigate = useNavigate();

    const {
        championships,
        loading,
        removeChampionship
    } = useChampionships();

    if (loading) {

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
            <div
                className="
                    flex
                    justify-between
                    items-center
                    
                    mb-10
                "
            >

                <h1
                className="
                text-5xl
                font-bold
                "
                >
                    GAUCHONES 2026
                </h1>

                <div
                    className="
                        flex
                        gap-3
                    "
                >

                    <button

                        onClick={() =>
                            navigate(
                                "/music-pool"
                            )
                        }

                        className="
                            bg-purple-600

                            hover:bg-purple-500

                            text-white

                            font-bold

                            px-6
                            py-3

                            rounded-xl

                            transition
                        "
                    >

                        Lista de Músicas

                    </button>

                    <button

                        onClick={() =>
                            window.open(
                                "/display",
                                "_blank"
                            )
                        }

                        className="
                            bg-blue-600

                            hover:bg-blue-500

                            text-white

                            font-bold

                            px-6
                            py-3

                            rounded-xl

                            transition
                        "
                    >

                        Tela do Sorteador

                    </button>

                    <button

                        onClick={() =>
                            navigate(
                                "/create-championship"
                            )
                        }

                        className="
                            bg-green-600

                            hover:bg-green-500

                            text-white

                            font-bold

                            px-6
                            py-3

                            rounded-xl

                            transition
                        "
                    >

                        + New Championship

                    </button>

                </div>

            </div>

            <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            
            gap-6
            "
            >

                {
                    championships.map(
                        championship => (

                            <div
                            key={championship.id}

                            onClick={() =>
                                navigate(
                                    `/championships/${championship.id}`
                                )
                            }

                            className="
                            bg-zinc-900
                            
                            border
                            border-zinc-800
                            
                            rounded-2x1
                            
                            p-6

                            cursor-pointer

                            hover:border-blue-500

                            transition
                            "
                            >
                                <div
                                    className="
                                        flex
                                        justify-between
                                        items-start
                                    "
                                >
                                    <h2
                                    className="
                                    text-2x1
                                    font-bold
                                    
                                    mb-4
                                    "
                                    >
                                        {championship.name}
                                    </h2>

                                    <button

                                        onClick={(
                                            e
                                        ) => {
                                            e.stopPropagation();

                                            if (
                                                confirm(
                                                    `Remover o campeonato "${championship.name}"?`
                                                )
                                            ) {
                                                removeChampionship(
                                                    championship.id
                                                );
                                            }
                                        }}

                                        className="
                                            bg-red-600

                                            hover:bg-red-500

                                            text-white

                                            text-sm

                                            font-bold

                                            px-3
                                            py-1

                                            rounded-lg

                                            transition
                                        "
                                    >
                                        Remover
                                    </button>
                                </div>

                                <div
                                className="
                                space-y-2
                                "
                                >
                                    {
                                        championship.phases.map(
                                            phase => (

                            <div
                                key={phase.id}

                                className="
                                bg-zinc-800

                                p-3

                                rounded-x1
                                "
                                >
                                    <div>
                                        {phase.name}
                                    </div>

                                    <div
                                    className="
                                    text-sm
                                    text-zinc-400
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
                                    </div>

                                </div>
                            )
                        )
                    }

                                </div>

                                {
                                    championship
                                        .currentPhaseId && (
                                        <div
                                            className="
                                                mt-4
                                                text-sm
                                                font-bold
                                                text-green-400
                                            "
                                        >
                                            ATIVO
                                        </div>
                                    )
                                }
                            
                            </div>
                        )
                    )
                }
            </div>



        </div>

    );
}
