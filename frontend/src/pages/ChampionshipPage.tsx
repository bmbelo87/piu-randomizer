import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useChampionship } from "../hooks/useChampionship";

import { api } from "../services/api";

export default function ChampionshipPage() {

    const { id } = useParams();

    const navigate = useNavigate();

    const {
        championship, 
        loading,
        reload
    } = useChampionship(
        id!
    );

    const [
        updating,
        setUpdating
    ] = useState(false);

    async function toggleActive() {

        if (!championship) {
            return;
        }

        setUpdating(true);

        try {

            await api.patch(
                `/championships/${id}/current-phase`,
                {
                    phaseId:
                        championship.currentPhaseId
                            ? null
                            : championship
                                .phases[0]
                                ?.id
                                ?? null
                }
            );

            await reload();

            const channel =
                new BroadcastChannel(
                    "piu-randomizer-draw"
                );

            channel.postMessage({
                type: "phase-update"
            });

            channel.close();

        } finally {

            setUpdating(false);
        }
    }

    async function setActivePhase(
        phaseId: string
    ) {

        setUpdating(true);

        try {

            await api.patch(
                `/championships/${id}/current-phase`,
                { phaseId }
            );

            await reload();

            const channel =
                new BroadcastChannel(
                    "piu-randomizer-draw"
                );

            channel.postMessage({
                type: "phase-update"
            });

            channel.close();

        } finally {

            setUpdating(false);
        }
    }

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

    const isActive =
        championship.currentPhaseId
            ? true
            : false;

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
                    items-center
                    justify-between
                    mb-10
                "
            >
                <h1
                    className="
                        text-4xl
                        font-bold
                    "
                >
                    {championship.name}
                </h1>

                <button
                    onClick={toggleActive}
                    disabled={updating}
                    className={`
                        px-6
                        py-3
                        rounded-xl
                        font-bold
                        transition-colors
                        ${
                            isActive
                                ? `
                                    bg-green-600
                                    hover:bg-green-500
                                `
                                : `
                                    bg-zinc-800
                                    hover:bg-zinc-700
                                `
                        }
                    `}
                >
                    {
                        isActive
                            ? "Campeonato Ativo"
                            : "Ativar Campeonato"
                    }
                </button>
            </div>

            <div
                className="
                    grid
                    gap-4
                "
            >
                {
                    championship.phases
                        .sort(
                            (a, b) =>
                                a.order - b.order
                        )
                        .map(
                        (phase: any) => {
                            const isPhaseActive =
                                championship
                                    .currentPhaseId
                                === phase.id;

                            return (
                                <div
                                    key={phase.id}
                                    className={`
                                        flex
                                        items-center
                                        gap-4
                                        bg-zinc-900
                                        p-5
                                        rounded-xl
                                        transition
                                        ${
                                            isPhaseActive
                                                ? `
                                                    ring-2
                                                    ring-green-500
                                                `
                                                : `
                                                    hover:ring-2
                                                    hover:ring-zinc-600
                                                `
                                        }
                                    `}
                                >
                                    <div
                                        onClick={() =>
                                            navigate(
                                                `/phases/${phase.id}`
                                            )
                                        }
                                        className="
                                            flex-1
                                            cursor-pointer
                                        "
                                    >
                                        <h2
                                            className="
                                                text-2xl
                                                font-bold
                                            "
                                        >
                                            {phase.name}
                                        </h2>

                                        <p
                                            className="
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
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            setActivePhase(
                                                phase.id
                                            )
                                        }
                                        disabled={
                                            updating ||
                                            isPhaseActive
                                        }
                                        className={`
                                            px-5
                                            py-2
                                            rounded-lg
                                            font-bold
                                            text-sm
                                            transition-colors
                                            ${
                                                isPhaseActive
                                                    ? `
                                                        bg-green-600
                                                        cursor-default
                                                    `
                                                    : `
                                                        bg-zinc-800
                                                        hover:bg-zinc-700
                                                        cursor-pointer
                                                    `
                                            }
                                        `}
                                    >
                                        {
                                            isPhaseActive
                                                ? "Fase Ativa"
                                                : "Ativar"
                                        }
                                    </button>

                                </div>
                            );
                        }
                    )
                }

            </div>
            
        </div>
    );
}