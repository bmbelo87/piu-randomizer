import { useCallback, useEffect, useState } from "react";

import { api } from "../services/api";

import type { DisplayData } from "../types/display";

export function useDisplay() {

    const [
        data,
        setData
    ] = useState<DisplayData | null>(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    useEffect(() => {

        api.get("/display")
            .then(response => {

                setData(
                    response.data
                );

                setLoading(
                    false
                );
            })
            .catch(() => {

                setLoading(false);
            });

    }, []);

    const refetch = useCallback(
        async () => {

            try {

                const response =
                    await api.get("/display");

                setData(
                    response.data
                );

            } catch {

                setLoading(false);
            }
        },
        []
    );

    return {
        data,
        loading,
        refetch
    };
}