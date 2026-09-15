import {
    useEffect,
    useState
} from "react";

import { api }
    from "../services/api";

export interface PoolChart {
    id: string;
    mode: string;
    level: number;
    title: string;
    bannerPath: string;
    previewPath: string | null;
}

export interface PoolPhase {
    id: string;
    name: string;
    mode: string;
    minLevel: number;
    maxLevel: number | null;
    allowOver: boolean;
    drawCount: number;
    charts: PoolChart[];
}

export interface PoolChampionship {
    id: string;
    name: string;
    currentPhaseId: string | null;
    phases: PoolPhase[];
}

export function useMusicPool() {
    const [
        championships,
        setChampionships
    ] = useState<PoolChampionship[]>([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    useEffect(() => {
        void load();
    }, []);

    async function load() {
        try {
            const response =
                await api.get("/display/pool");

            setChampionships(
                response.data
            );
        } finally {
            setLoading(false);
        }
    }

    return {
        championships,
        loading
    };
}