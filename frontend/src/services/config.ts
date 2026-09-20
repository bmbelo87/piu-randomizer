/** Definido em vite.config.ts: true quando o build roda com `--mode pages`. */
export const STATIC_MODE = __STATIC_MODE__;

export const API_URL: string =
    import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/** Origem dos banners e previas: o backend, ou os arquivos publicados junto do site. */
export const ASSETS_URL = STATIC_MODE
    ? import.meta.env.BASE_URL.replace(/\/$/, "")
    : API_URL;

export function openDisplay() {
    const url = STATIC_MODE
        ? `${window.location.origin}${import.meta.env.BASE_URL}#/display`
        : "/display";

    window.open(url, "_blank", "noopener,noreferrer");
}
