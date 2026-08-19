import { createContext } from "react";
import type { User } from "../interfaces/User";
import type { LoginData, SignupData } from "../interfaces/Auth";

export interface AuthContextData {
    user: User | undefined
    authenticated: boolean
    loading: boolean
    handleLogin: (credentials: LoginData) => Promise<void>
    handleSignup: (data: SignupData) => Promise<void>
    handleLogout: () => void
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);
