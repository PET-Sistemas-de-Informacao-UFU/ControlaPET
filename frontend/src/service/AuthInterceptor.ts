import axios from "axios";
import { api, BASE_URL } from "./api";
import { readRefreshToken, readToken, storeTokens } from "./authStorage";
import type { AuthResponse } from "../interfaces/Auth";

function isAuthRequest(url?: string) {
    return url?.includes("/auth/login") || url?.includes("/auth/refresh");
}

export function setupInterceptors(handleLogout: () => void) {
    const requestInterceptorId = api.interceptors.request.use(
        (config) => {
            const token = readToken();

            if (token && !isAuthRequest(config.url)) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        }
    );

    const responseInterceptorId = api.interceptors.response.use(
        (response) => response,

        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status !== 401 || isAuthRequest(originalRequest?.url)) {
                return Promise.reject(error);
            }

            const refreshToken = readRefreshToken();

            if (originalRequest._retry || !refreshToken) {
                handleLogout();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const response = await axios.post<AuthResponse>(
                    `${BASE_URL}/auth/refresh`,
                    {
                        refreshToken
                    }
                );

                storeTokens(
                    response.data.token,
                    response.data.refreshToken
                );

                return api(originalRequest);
            } catch (refreshError) {
                handleLogout();
                return Promise.reject(refreshError);
            }
        }
    );

    return () => {
        api.interceptors.request.eject(requestInterceptorId);
        api.interceptors.response.eject(responseInterceptorId);
    };
}
