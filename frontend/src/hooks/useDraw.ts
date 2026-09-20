import { api } from "../services/api";

export async function drawCharts(
    phaseId: string,
    amount:number
) {

    const response = 
        await api.post(
            `/draws/phase/${phaseId}`,
            {
                amount
            }
        );

        return response.data;
}

export async function rerollChart(
    phaseId: string,
    level: number,
    mode?: string
) {
    const response = await api.post(
        `/draws/phase/${phaseId}/reroll`,
        { level, mode }
    );

    return response.data;
}
