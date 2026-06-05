import {
    useEffect,
    useState
} from "react";

import { api } from "../services/api";

export function useChampionship(
    id: string
) {

    const [
        championship,
        setChampionship
    ] = useState<any>(null);

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

    return {
        championship,
        loading
    };
}