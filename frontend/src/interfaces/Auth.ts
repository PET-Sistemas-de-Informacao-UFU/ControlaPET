import type { UserRole } from "./User";

export interface LoginData{
    email: string,
    password: string
}

export interface SignupData{
    name: string
    email: string
    password: string
    role: UserRole
}

export interface AuthResponse{
    token: string
    refreshToken: string
}
