import {
    useEffect,
    useState,
    useCallback
} from "react";

import { api }
    from "../services/api";

import type { Phase } from "../types/phase";

export function usePhase(
    id: string
) {

    const [
        phase,
        setPhase
    ] = useState<Phase | null>(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const load = useCallback(
        async () => {

            try {

                const response =
                    await api.get(
                        `/phases/${id}`
                    );

                setPhase(
                    response.data
                );
            } finally {

                setLoading(false);

            }
        },
        [id]
    );

    useEffect(() => {

    void load();

    }, [load]);

    return {
        phase,
        loading,
        reload: load
    };
}