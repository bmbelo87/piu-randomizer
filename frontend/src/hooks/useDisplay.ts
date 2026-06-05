import { useEffect, useState } from "react";

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

        api.get("/display").then(response => {
            setData(response.data);
            setLoading(false);
        });
    }, []);

    return {
        data,
        loading
    };
}