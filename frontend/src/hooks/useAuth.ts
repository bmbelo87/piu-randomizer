import { useState } from "react";

import { api } from "../services/api";

import type { LoginResponse } from "../types/auth";

export function useAuth() {
    
    const [loading, setLoading] = useState(false);

    async function login(
        email: string,
        password: string
    ) {

        try {
            setLoading(true);

            const response = 
            await api.post<LoginResponse>(
                "/auth/login",
                {
                    email,
                    password
                }
            );

            const {
                token,
                user
            } = response.data;

            localStorage.setItem(
                "token",
                token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            api.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${token}`;

            return true;
        
        } catch {
            return false;
        } finally {
            
            setLoading(false);

        }
    }

    return {
        login,
        loading
    };
}