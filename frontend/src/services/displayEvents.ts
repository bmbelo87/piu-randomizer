import { api } from "./api";

export type DisplayEvent =
    | { type: "phase-update" }
    | {
        type?: undefined;
        draws: {
            song: string;
            bannerPath: string;
            previewPath: string | null;
            mode: string;
            level: number;
        }[];
        seed: string;
        rerollLevel?: number;
    };

export async function sendDisplayEvent(event: DisplayEvent) {
    try {
        await api.post("/display/events", event);
    } catch {
        // o painel continua funcionando mesmo se o telão nao for avisado
    }
}

export function subscribeDisplayEvents(onEvent: (event: DisplayEvent) => void) {
    const source = new EventSource(`${api.defaults.baseURL}/display/events`);

    source.onmessage = message => onEvent(JSON.parse(message.data));

    return () => source.close();
}
