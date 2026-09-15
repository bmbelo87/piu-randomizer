import {
    useCallback,
    useEffect,
    useState
} from "react";

import { api } from "../services/api";

import type { Championship } from "../types/championship";

export function useChampionship(
    id: string
) {

    const [
        championship,
        setChampionship
    ] = useState<Championship | null>(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    useEffect(() => {
        
        load();

    }, [id]);

    async function load() {
        
        try {

            const response = 
            await api.get(
                `/championships/${id}`
            );

            setChampionship(
                response.data
            );

        } finally {

            setLoading(false);
        }
    }

    const reload = useCallback(
        async () => {

            const response =
                await api.get(
                    `/championships/${id}`
                );

            setChampionship(
                response.data
            );
        },
        [id]
    );

    return {
        championship,
        loading,
        reload
    };
}