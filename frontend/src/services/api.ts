import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

import { API_URL, STATIC_MODE } from "./config";
import { staticAdapter } from "../static/staticAdapter";

const PASSWORD_KEY = "piu-randomizer:admin-password";

function storedPassword() {
    try {
        return localStorage.getItem(PASSWORD_KEY);
    } catch {
        return null;
    }
}

export const api = axios.create({
    baseURL: API_URL,
    ...(STATIC_MODE ? { adapter: staticAdapter } : {})
});

// Backend com ADMIN_PASSWORD: as rotas que gravam pedem a senha (o telao so le).
if (!STATIC_MODE) {
    api.interceptors.request.use(config => {
        const password = storedPassword();

        if (password) {
            config.headers.set("x-admin-password", password);
        }

        return config;
    });

    api.interceptors.response.use(undefined, async error => {
        const config = error.config as (InternalAxiosRequestConfig & { retried?: boolean }) | undefined;

        if (error.response?.status === 401 && config && !config.retried && typeof window !== "undefined") {
            const password = window.prompt("Senha de administrador:");

            if (password) {
                try {
                    localStorage.setItem(PASSWORD_KEY, password);
                } catch {
                    // segue so com esta requisicao
                }

                config.retried = true;
                config.headers.set("x-admin-password", password);

                return api(config);
            }
        }

        throw error;
    });
}
