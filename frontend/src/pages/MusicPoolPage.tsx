import {
    useMusicPool
} from "../hooks/useMusicPool";

import {
    useNavigate
} from "react-router-dom";

export default function MusicPoolPage() {

    const navigate =
        useNavigate();

    const {
        championships,
        loading
    } = useMusicPool();

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

    const totalCharts =
        championships.reduce(
            (acc, championship) =>
                acc + championship
                    .phases.reduce(
                        (a, phase) =>
                            a + phase.charts.length,
                        0
                    ),
            0
        );

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
                <button
                    onClick={() =>
                        navigate(
                            "/"
                        )
                    }

                    className="
                        bg-zinc-800

                        hover:bg-zinc-700

                        text-white

                        font-bold

                        px-5
                        py-3

                        rounded-xl

                        transition
                    "
                >
                    ← Voltar
                </button>

                <div
                    className="
                        text-4xl
                        font-bold
                    "
                >
                    Lista Consolidada de Músicas
                </div>

                <div
                    className="
                        text-zinc-400
                    "
                >
                    {championships.length}
                    {" "}
                    campeonatos
                    {" "}
                    •
                    {" "}
                    {totalCharts}
                    {" "}
                    músicas
                </div>
            </div>

            <div
                className="
                    grid
                    gap-8
                "
            >
                {
                    championships.map(
                        championship => (
                            <div
                                key={
                                    championship.id
                                }
                                className="
                                    bg-zinc-900

                                    border
                                    border-zinc-800

                                    rounded-2xl

                                    p-6
                                "
                            >
                                <h2
                                    className="
                                        text-3xl
                                        font-bold

                                        mb-6
                                    "
                                >
                                    {
                                        championship.name
                                    }

                                    {
                                        championship
                                            .currentPhaseId
                                            && (
                                            <span
                                                className="
                                                    ml-3

                                                    text-sm

                                                    font-bold

                                                    text-green-400
                                                "
                                            >
                                                ATIVO
                                            </span>
                                        )
                                    }
                                </h2>

                                <div
                                    className="
                                        grid
                                        gap-6

                                        mb-4
                                    "
                                >
                                    {
                                        championship
                                            .phases
                                            .map(
                                            phase => (
                                                <div
                                                    key={
                                                        phase.id
                                                    }

                                                    className="
                                                        bg-zinc-800

                                                        rounded-xl

                                                        p-5
                                                    "
                                                >
                                                    <div
                                                        className="
                                                            flex
                                                            items-baseline

                                                            justify-between

                                                            mb-4
                                                        "
                                                    >
                                                        <h3
                                                            className="
                                                                text-xl
                                                                font-bold
                                                            "
                                                        >
                                                            {
                                                                phase.name
                                                            }
                                                        </h3>

                                                        <div
                                                            className="
                                                                text-sm
                                                                text-zinc-400
                                                            "
                                                        >
                                                            {
                                                                phase.mode
                                                            }
                                                            {" "}

                                                            {
                                                                phase.minLevel
                                                            }

                                                            {
                                                                phase
                                                                    .allowOver
                                                                    ? "+"
                                                                    : `~${phase.maxLevel}`
                                                            }

                                                            {" "}
                                                            (
                                                            {
                                                                phase.drawCount
                                                            }
                                                            {" "}
                                                            sorteio
                                                            )
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="
                                                            grid

                                                            grid-cols-1
                                                            sm:grid-cols-2
                                                            md:grid-cols-3
                                                            lg:grid-cols-4
                                                            xl:grid-cols-5

                                                            gap-4
                                                        "
                                                    >
                                                        {
                                                            [
                                                                ...phase
                                                                    .charts
                                                            ]
                                                                .sort(
                                                                    (
                                                                        a,
                                                                        b
                                                                    ) =>
                                                                        a
                                                                            .level -
                                                                        b
                                                                            .level ||
                                                                        a
                                                                            .title
                                                                            .localeCompare(
                                                                                b
                                                                                    .title
                                                                            )
                                                                )
                                                                .map(
                                                                chart =>
                                                                    (
                                                                        <div
                                                                            key={
                                                                                chart.id
                                                                            }

                                                                            className="
                                                                                bg-zinc-900

                                                                                rounded-lg

                                                                                overflow-hidden

                                                                                flex
                                                                                flex-col
                                                                            "
                                                                        >
                                                                            <div
                                                                                className="
                                                                                    relative
                                                                                "
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        `http://localhost:3000/banners/${chart.bannerPath}`
                                                                                    }

                                                                                    alt={
                                                                                        chart.title
                                                                                    }

                                                                                    className="
                                                                                        w-full

                                                                                        aspect-[4/3]

                                                                                        object-cover
                                                                                    "
                                                                                />

                                                                                <div
                                                                                    className={`
                                                                                        absolute

                                                                                        top-2
                                                                                        right-2

                                                                                        min-w-8
                                                                                        h-8

                                                                                        px-2

                                                                                        rounded-full

                                                                                        flex
                                                                                        items-center
                                                                                        justify-center

                                                                                        font-bold

                                                                                        text-white

                                                                                        ${
                                                                                            chart.mode === "S"
                                                                                                ? "bg-orange-500"
                                                                                                : chart.mode === "D"
                                                                                                    ? "bg-green-600"
                                                                                                    : "bg-purple-600"
                                                                                        }
                                                                                    `}
                                                                                >
                                                                                    {
                                                                                        chart.level
                                                                                    }
                                                                                </div>
                                                                            </div>

                                                                            <div
                                                                                className="
                                                                                    p-3
                                                                                "
                                                                            >
                                                                                <div
                                                                                    className="
                                                                                        text-sm

                                                                                        font-bold

                                                                                        leading-tight
                                                                                    "
                                                                                >
                                                                                    {
                                                                                        chart.title
                                                                                    }
                                                                                </div>
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
                        )
                    )
                }
            </div>
        </div>
    );
}