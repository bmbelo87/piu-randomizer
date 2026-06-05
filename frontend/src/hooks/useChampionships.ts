import { useEffect, useState } from "react";

import { api } from "../services/api";

import type { Championship } from "../types/championship";

export function useChampionships() {

    const [
        championships,
        setChampionships
    ] = useState<Championship[]>([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    useEffect(() => {

        loadChampionships();

    }, []);

    async function loadChampionships() {
        try {
            const response =
            await api.get("/championships");

            setChampionships(
                response.data
            );
        
        } catch (error) {

            console.error(error);

        } finally {
            
            setLoading(false);

        }
    }

    return {
        championships,
        loading
    };
}