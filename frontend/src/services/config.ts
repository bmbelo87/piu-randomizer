/** Definido em vite.config.ts: true quando o build roda com `--mode pages` (hospedado no GitHub Pages). */
export const PAGES_BUILD = __STATIC_MODE__;

const API_URL_KEY = "piu-randomizer:api-url";

/**
 * No Pages, `?api=https://meu-backend` aponta o site para um backend de verdade
 * (lembrado neste navegador). `?api=` vazio esquece e volta ao modo sem backend.
 */
function resolveRemoteApi(): string | null {
    if (!PAGES_BUILD || typeof window === "undefined") return null;

    try {
        const params = new URLSearchParams(window.location.search);

        if (params.has("api")) {
            const value = (params.get("api") ?? "").trim().replace(/\/+$/, "");

            if (/^https?:\/\//i.test(value)) {
                localStorage.setItem(API_URL_KEY, value);
                return value;
            }

            localStorage.removeItem(API_URL_KEY);
            return null;
        }

        return localStorage.getItem(API_URL_KEY);
    } catch {
        return null;
    }
}

const REMOTE_API = resolveRemoteApi();

/** true = app roda inteiro no navegador (Pages sem backend configurado). */
export const STATIC_MODE = PAGES_BUILD && !REMOTE_API;

export const API_URL: string =
    REMOTE_API ?? import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/** Banners e previas: publicados junto do site no Pages, ou servidos pelo backend. */
export const ASSETS_URL = PAGES_BUILD
    ? import.meta.env.BASE_URL.replace(/\/$/, "")
    : API_URL;

export function openDisplay() {
    const url = PAGES_BUILD
        ? `${window.location.origin}${import.meta.env.BASE_URL}#/display`
        : "/display";

    window.open(url, "_blank", "noopener,noreferrer");
}
