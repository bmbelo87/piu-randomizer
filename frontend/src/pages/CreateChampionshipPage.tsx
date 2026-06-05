import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { api } from "../services/api";

interface PhaseForm {

    name: string;

    mode: string;

    minLevel: number;

    maxLevel: number;

    drawCount: number;

    allowOver: boolean;
}

export default function CreateChampionshipPage() {

    const navigate = useNavigate();

    const [
        championshipName,
        setChampionshipName
    ] = useState("");

    const [
        phasesCount,
        setPhasesCount
    ] = useState(5);

    const [
        phases,
        setPhases
    ] = useState<PhaseForm[]>([]);

    function handleGenerate() {
        const generated = [];

        for (let i = 1;
            i <= phasesCount;
            i++
        ) {
            let phaseName = `Phase ${i}`;

            if (
                i === phasesCount - 1
            ) {
                phaseName = 
                    "Semi-Final";
            }

            if (
                i === phasesCount
            ) {
                phaseName = 
                    "Final";
            }

            generated.push({

                name: phaseName,

                mode: "S",

                minLevel: 0,

                maxLevel: 0,

                drawCount: 0,

                allowOver: false
            });
        }

        setPhases(
            generated
        );
    }

    async function handleSave() {

        try {

            await api.post(
                "/championships",
                {
                    name: 
                        championshipName,

                        phases
                }
            );

            alert( 
                "Championship Created!"
            );

            navigate("/");
        } catch (error) {

            console.error(error);

            alert(
                "Unable to create championship"
            );
        }
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
                    text-5xl
                    font-bold

                    mb-10
                "
            >
                Create Championship
            </h1>

            <div
                className="
                    max-w-xl
                    
                    space-y-6
                "
            >

                <div>

                    <label
                        className="
                            block

                            mb-2

                            font-bold
                        "
                    >
                        Championship Name
                    </label>

                    <input

                        type="text"

                        value={championshipName}

                        onChange={(e) =>
                            setChampionshipName(
                                e.target.value
                            )
                        }

                        className="
                            w-full
                            
                            bg-zinc-900
                            
                            border
                            border-zinc-700

                            rounded-xl

                            p-3
                        "
                    />

                </div>

                <div>

                    <label

                        className="
                            block

                            mb-2

                            font-bold
                        "
                    >
                        Number of Phases
                    </label>

                    <input

                        type="number"

                        min={2}

                        value={phasesCount}

                        onChange={(e) =>
                            setPhasesCount(
                                Number(
                                    e.target.value
                                )
                            )
                        }

                        className="
                            w-full

                            bg-zinc-900

                            border
                            border-zinc-700

                            rounded-xl

                            p-3
                        "

                    />

                    <button

                        onClick={handleGenerate}

                        className="
                            bg-blue-600

                            hover:bg-blue-500

                            px-6
                            py-3
                            
                            rounded-xl

                            font-bold
                        "
                    >

                        Generate Phases

                    </button>

                    {
                        phases.map(
                            (
                                phase,
                                index
                            ) => (

                                <div

                                    key={index}

                                    className="
                                        bg-zinc-900
                                        
                                        border
                                        border-zinc-700

                                        rounded-xl

                                        p-4

                                        mt-6
                                    "
                                >
                                    <h2
                                        className="
                                            text-xl
                                            font-bold

                                            mb-4
                                        "
                                    >
                                        {phase.name}
                                    </h2>
                                    
                                        <div
                                            className="
                                                space-y-4
                                            "
                                        >
                                            <div>

                                                <label
                                                    className="
                                                        block
                                                        mb-2
                                                    "
                                                >
                                                    Mode
                                                </label>

                                                <select
                                                    
                                                    value={phase.mode}

                                                    onChange={(e) =>{

                                                            const updated = [...phases];

                                                            updated[index].mode = 
                                                                e.target.value;

                                                                setPhases(updated);
                                                        }
                                                    }
                                                    
                                                    className="
                                                        w-full
                                                        bg-zinc-800

                                                        border
                                                        border-zinc-700

                                                        rounded-xl

                                                        p-3
                                                    "
                                                >

                                                    <option value="S">
                                                        Single
                                                    </option>
                                                    <option value="D">
                                                        Double
                                                    </option>

                                                </select>

                                            </div>

                                            <div>

                                                <label
                                                    className="
                                                        block
                                                        mb-2
                                                    "
                                                >
                                                    Min Level
                                                </label>

                                                <input

                                                    type="number"

                                                    value={phase.minLevel}

                                                    onChange={(e) => {

                                                        const updated = [...phases];

                                                        updated[index].minLevel = 
                                                            Number(
                                                                e.target.value
                                                            );

                                                        setPhases(updated);
                                                    }}

                                                    className="
                                                        w-full

                                                        bg-zinc-800

                                                        border
                                                        border-zinc-700

                                                        rounded-xl

                                                        p-3
                                                    "
                                                />
                                            
                                            </div>

                                            {
                                                !phase.allowOver && (

                                                    <div> 

                                                        <label
                                                            className="
                                                                block
                                                                mb-2
                                                            "
                                                        >
                                                            Max Level
                                                        </label>

                                                        <input

                                                            type="number"

                                                            value={phase.maxLevel}

                                                            onChange={(e) => {

                                                                const updated = [...phases];

                                                                updated[index].maxLevel =
                                                                    Number(
                                                                        e.target.value
                                                                    );

                                                                setPhases(updated);
                                                            }}

                                                            className="
                                                                w-full

                                                                bg-zinc-800

                                                                border
                                                                border-zinc-700

                                                                rounded-xl

                                                                p-3
                                                            "
                                                        />

                                                    </div>
                                                )
                                            }

                                            {
                                                <div>
                                                    <label
                                                        className="
                                                            block
                                                            mb-2
                                                        "
                                                    >

                                                        Songs to Draw

                                                    </label>

                                                    <input

                                                    type="number"

                                                    value={phase.drawCount}

                                                    onChange={(e) => {

                                                        const updated = [...phases];

                                                        updated[index].drawCount = 
                                                            Number(
                                                                e.target.value
                                                            );

                                                        setPhases(updated);
                                                    }}

                                                    className="
                                                        w-full

                                                        bg-zinc-800

                                                        border
                                                        border-zinc-700

                                                        rounded-xl

                                                        p-3
                                                    "
                                                />

                                                    </div>
                                            }

                                            {
                                                
                                                    <div>
                                                        <label 
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-3
                                                            "
                                                        >

                                                            <input

                                                                type="checkbox"

                                                                checked={
                                                                    phase.allowOver
                                                                }

                                                                onChange={(e) => {

                                                                    const updated = [...phases];

                                                                    updated[index].allowOver =
                                                                        e.target.checked;
                                                                        
                                                                    setPhases(
                                                                        updated
                                                                    );
                                                                }}

                                                            />

                                                            Allow OVER

                                                        </label>

                                                    </div>
                                                
                                            }
                                                    
                                    </div>

                                </div>
                            )
                        )
                    }

                    {
                        phases.length > 0 && (

                            <button

                                onClick={handleSave}

                                className="
                                    bg-green-600

                                    hover:bg-green-500

                                    px-6
                                    py-3

                                    rounded-xl

                                    font-bold

                                    mt-6
                                "
                            >
                                Save Championship
                            </button>
                        )
                    }

                </div>

            </div>

        </div>
    );
}