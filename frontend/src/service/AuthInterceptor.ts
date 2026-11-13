import axios from "axios";
import { api, BASE_URL } from "./api";
import { readToken, storeToken } from "./authStorage";
import type { AuthResponse } from "../interfaces/Auth";

let pendingRefresh: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
    if (!pendingRefresh) {
        const refresh = async () => {
            const response = await axios.post<AuthResponse>(`${BASE_URL}/auth/refresh`, null, {
                withCredentials: true,
                headers: { "X-Auth-Request": "1" },
            });
            storeToken(response.data.token);
            return response.data.token;
        };
        // Serializa a rotação do cookie entre abas quando a API Web Locks está disponível.
        const task = navigator.locks ? navigator.locks.request("controlapet-refresh", refresh) : refresh();
        pendingRefresh = task.finally(() => { pendingRefresh = null; });
    }
    return pendingRefresh;
}

function isAuthRequest(url?: string) {
    return url?.includes("/auth/login") || url?.includes("/auth/refresh");
}

export function setupInterceptors(handleLogout: () => void) {
    const requestId = api.interceptors.request.use((config) => {
        const token = readToken();
        if (token && !isAuthRequest(config.url)) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });
    const responseId = api.interceptors.response.use((response) => response, async (error) => {
        const original = error.config;
        if (!original || error.response?.status !== 401 || isAuthRequest(original.url)) return Promise.reject(error);
        if (original._retry) {
            handleLogout();
            return Promise.reject(error);
        }
        original._retry = true;
        try {
            await refreshAccessToken();
            return api(original);
        } catch (refreshError) {
            handleLogout();
            return Promise.reject(refreshError);
        }
    });
    return () => {
        api.interceptors.request.eject(requestId);
        api.interceptors.response.eject(responseId);
    };
}
