import {
  useChampionships
} from "../hooks/useChampionships";

import { useNavigate } from "react-router-dom";

export default function DashboardPage() {

    const navigate = useNavigate();

    const {
        championships,
        loading
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
                    Championships
                </h1>
                
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

                        mb-8
                    "
                >

                    + New Championship

                </button>

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
                                <h2
                                className="
                                text-2x1
                                font-bold
                                
                                mb-4
                                "
                                >
                                    {championship.name}
                                </h2>

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
                            
                            </div>
                        )
                    )
                }
            </div>



        </div>

    );
}
