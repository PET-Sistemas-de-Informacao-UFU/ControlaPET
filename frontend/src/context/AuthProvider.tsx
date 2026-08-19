import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./AuthContext";
import type { User } from "../interfaces/User";
import type { AuthResponse, LoginData, SignupData } from "../interfaces/Auth";
import { api, BASE_URL } from "../service/api";
import { setupInterceptors } from "../service/AuthInterceptor";
import { clearTokens, readToken, storeTokens } from "../service/authStorage";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | undefined>(undefined);
    const [authenticated, setAuthenticated] = useState(() => !!readToken());
    const queryClient = useQueryClient();

    const loading = false;

    const handleLogout = useCallback(() => {
        setAuthenticated(false);
        setUser(undefined);

        clearTokens();
        queryClient.clear();
    }, [queryClient]);

    useEffect(() => {
        return setupInterceptors(handleLogout);
    }, [handleLogout]);

    async function handleLogin({ email, password }: LoginData) {
        try {
            const response = await api.post<AuthResponse>(`${BASE_URL}/auth/login`, {
                email,
                password
            });

            storeTokens(response.data.token, response.data.refreshToken);

            setAuthenticated(true);
        } catch (error) {
            console.error("Erro no login: ", error);
            throw error;
        }
    }

    async function handleSignup({ name, email, password, role }: SignupData) {
        try {
            await api.post(`${BASE_URL}/users`, {
                name,
                email,
                password,
                role
            });
        } catch (error) {
            console.error("Erro no cadastro: ", error);
            throw error;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                authenticated,
                loading,
                handleLogin,
                handleSignup,
                handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
