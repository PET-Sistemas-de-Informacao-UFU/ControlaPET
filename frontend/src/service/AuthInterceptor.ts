import axios from "axios";
import { api, BASE_URL } from "./api";
import { readRefreshToken, storeTokens } from "./authStorage";
import type { AuthResponse } from "../interfaces/Auth";

export function setupInterceptors(handleLogout: () => void) {
    const interceptorId = api.interceptors.response.use(
        (response) => response,

        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status !== 401) {
                return Promise.reject(error);
            }

            const refreshToken = readRefreshToken();

            if (originalRequest._retry || !refreshToken) {
                handleLogout();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const response = await axios.post<AuthResponse>(`${BASE_URL}/auth/refresh`, {
                    refreshToken
                });

                storeTokens(response.data.token, response.data.refreshToken);

                return api(originalRequest);
            } catch (refreshError) {
                handleLogout();
                return Promise.reject(refreshError);
            }
        }
    );

    return () => api.interceptors.response.eject(interceptorId);
}
