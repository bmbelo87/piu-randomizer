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