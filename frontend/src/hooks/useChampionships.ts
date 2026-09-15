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

    async function removeChampionship(
        id: string
    ) {
        try {

            await api.delete(
                `/championships/${id}`
            );

            setChampionships(
                previous =>
                    previous.filter(
                        championship =>
                            championship.id !== id
                    )
            );

            return true;

        } catch (error) {

            console.error(error);

            return false;
        }
    }

    return {
        championships,
        loading,
        removeChampionship
    };
}