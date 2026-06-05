import {
    useEffect,
    useState,
    useCallback
} from "react";

import { api }
    from "../services/api"

interface Props {

    phase: {
        id: string;
        mode: string;
        minLevel: number;
        maxLevel:number | null;
        allowOver: boolean;
        availableCharts: {
            chart:{
                id: string;
            };
        }[];
    };

    onClose: () => void;

    onAdded: () => void;
}

export default function AddChartModal({
    phase,
    onClose,
    onAdded
}: Props) {

    const [
        charts,
        setCharts
    ] = useState<
        {
            id: string;
            mode: string;
            level:number;

            song: {
                title:string;
            };
        }[]
    >([]);

    const fetchCharts = useCallback(
        async () => {

            const response = 
                await api.get(
                    "/songs/charts"
                );

            const alreadyAdded = 
                phase.availableCharts.map(
                    item => item.chart.id
                );

            const filtered = 
                response.data.filter(
                    (chart: {
                        id: string;

                        mode: string;

                        level: number;

                        song: {
                            title: string;
                        };
                    }) => {

                        if (
                            chart.mode !==
                            phase.mode
                        ) {
                            return false;
                        }

                        if (
                            alreadyAdded.includes(
                                chart.id
                            )
                        ) {
                            return false;
                        }

                        if (
                            chart.level <
                            phase.minLevel
                        ) {
                            return false;
                        }

                        if (
                            !phase.allowOver &&
                            phase.maxLevel &&
                            chart.level > phase.maxLevel
                        ) {
                            return false;
                        }

                        return true;
                    }
                );

            setCharts(filtered);
        },
        [phase]
    );

        useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchCharts();

    }, [fetchCharts]);

    async function addChart(
        chartId: string
    ) {

        try {

            console.log(
                "Adding chart",
                chartId
            );

            const response =
                await api.post(
                    `/phases/${phase.id}/charts`,
                    {
                        chartId
                    }
                );
            console.log(
                response.data
            );

        await onAdded();
        await fetchCharts();

    } catch (error) {

        console.error(
            (error as {
                response?: {
                    data?: unknown;
                };
            }).response?.data
        );

        alert(
            JSON.stringify(
                (error as {
                response?: {
                    data?: unknown;
                };
            }).response?.data
            )
        );
    }
}

    return (

        <div
            className="
                fixed
                inset-0

                bg-black/70

                flex
                items-center
                justify-center
            "
        >

            <div
                className="
                    bg-zinc-900

                    p-6

                    rounded-2xl

                    w-175

                    max-h-[80vh]

                    overflow-y-auto
                "
            >

                <div
                    className="
                        flex
                        justify-between
                        items-center

                        mb-6
                    "
                >

                    <h2
                        className="
                            text-2xl
                            font-bold
                        "
                    >
                        Add Chart
                    </h2>

                    <button
                        onClick={onClose}
                    >
                        X
                    </button>

                </div>

                <div
                    className="
                        space-y-2
                    "
                >

                    {
                        charts.map(
                            chart => (

                                <div
                                    key={chart.id}

                                    className="
                                        bg-zinc-800

                                        p-3

                                        rounded-xl

                                        flex
                                        justify-between
                                        items-center
                                    "
                                >

                                    <div>

                                        {
                                            chart.song.title
                                        }

                                        {" - "}

                                        {
                                            chart.mode
                                        }

                                        {
                                            chart.level
                                        }
                                    
                                    </div>

                                    <button

                                        onClick={() =>
                                            addChart(
                                                chart.id
                                            )
                                        }

                                        className="
                                            bg-blue-600

                                            px-4
                                            py-2

                                            rounded-lg
                                        "
                                    >

                                        Add

                                    </button>
                                </div>
                            )
                        )
                    }

                </div>

            </div>

        </div>
    );
}