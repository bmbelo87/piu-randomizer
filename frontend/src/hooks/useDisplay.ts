import { useEffect, useState } from "react";

import { api } from "../services/api";

import type { DisplayData } from "../types/display";

export function useDisplay(enabled = true) {

    const [
        data,
        setData
    ] = useState<DisplayData | null>(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    useEffect(() => {

        if (!enabled) {
            return;
        }

        const loadDisplay = () => {

            api.get("/display")
                .then(response => {

                    setData(
                        response.data
                    );

                    setLoading(
                        false
                    );
                });
        };

        loadDisplay();

        const interval =
            setInterval(
                loadDisplay,
                5000
            );

        return () => {

            clearInterval(
                interval
            );
        };
        
    }, [enabled]);

    return {
        data,
        loading
    };
}