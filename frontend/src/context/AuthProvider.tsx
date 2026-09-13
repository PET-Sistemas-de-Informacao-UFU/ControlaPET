import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./AuthContext";
import type { User } from "../interfaces/User";
import type { AuthResponse, LoginData, SignupData } from "../interfaces/Auth";
import { api } from "../service/api";
import { setupInterceptors } from "../service/AuthInterceptor";
import { clearTokens, readToken, storeTokens } from "../service/authStorage";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | undefined>(undefined);
    const [authenticated, setAuthenticated] = useState(() => !!readToken());
    const queryClient = useQueryClient();

    const [loading, setLoading] = useState(() => !!readToken());

    const handleLogout = useCallback(() => {
        setAuthenticated(false);
        setUser(undefined);

        clearTokens();
        queryClient.clear();
    }, [queryClient]);

    useEffect(() => {
        return setupInterceptors(handleLogout);
    }, [handleLogout]);

    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get<User>("/users/me");
            setUser(response.data);
            setAuthenticated(true);
        } catch {
            handleLogout();
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        if (readToken()) {
            void refreshUser();
        } else {
            setLoading(false);
        }
    }, [refreshUser]);

    async function handleLogin({ email, password }: LoginData) {
        try {
            const response = await api.post<AuthResponse>("/auth/login", {
                email,
                password
            });

            storeTokens(response.data.token, response.data.refreshToken);

            await refreshUser();
        } catch (error) {
            console.error("Erro no login: ", error);
            throw error;
        }
    }

    async function handleSignup({ name, email, password, role }: SignupData) {
        try {
            await api.post("/users", {
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
                handleLogout,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
