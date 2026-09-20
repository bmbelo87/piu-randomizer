import { AxiosError } from "axios";
import type { AxiosAdapter, AxiosResponse } from "axios";

import { handle } from "./engine";
import type { Db, Store } from "./engine";
import seed from "./seed.json";

const STORAGE_KEY = "piu-randomizer:static-db:v1";

// Sem localStorage (janela privada bloqueada etc.) cai para memoria.
let memory: string | null = null;

const store: Store = {
    read() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return memory;
        }
    },
    write(value) {
        memory = value;

        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            // mantido em memoria
        }
    }
};

/** Apaga os dados locais; o proximo acesso recomeca do seed. */
export function resetStaticDb() {
    memory = null;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // nada a limpar
    }
}

export const staticAdapter: AxiosAdapter = async config => {
    const raw = config.data;
    const body = typeof raw === "string" && raw ? JSON.parse(raw) : raw;

    const { status, data } = handle(
        config.method ?? "get",
        config.url ?? "",
        body,
        store,
        seed as unknown as Db
    );

    const response: AxiosResponse = {
        data,
        status,
        statusText: status === 200 ? "OK" : "Error",
        headers: {},
        config,
        request: {}
    };

    if (status >= 200 && status < 300) {
        return response;
    }

    throw new AxiosError(
        `Request failed with status code ${status}`,
        status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
        config,
        null,
        response
    );
};
