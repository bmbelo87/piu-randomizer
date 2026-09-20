import { api } from "./api";
import { STATIC_MODE } from "./config";

const CHANNEL_NAME = "piu-randomizer-draw";

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
        rerollMode?: string;
    };

export async function sendDisplayEvent(event: DisplayEvent) {
    if (STATIC_MODE) {
        // Sem backend: o telao precisa estar no mesmo navegador (outra aba/janela).
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage(event);
        channel.close();
        return;
    }

    try {
        await api.post("/display/events", event);
    } catch {
        // o painel continua funcionando mesmo se o telao nao for avisado
    }
}

export function subscribeDisplayEvents(onEvent: (event: DisplayEvent) => void) {
    if (STATIC_MODE) {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = message => onEvent(message.data);

        return () => channel.close();
    }

    const source = new EventSource(`${api.defaults.baseURL}/display/events`);

    source.onmessage = message => onEvent(JSON.parse(message.data));

    return () => source.close();
}
