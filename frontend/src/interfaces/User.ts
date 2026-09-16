export type UserRole = "ADMIN" | "MEMBER";

export interface User {
    id: string
    nome: string
    email: string
    role: UserRole
    active: boolean
}

export interface CreateUserRequest {
    name: string
    email: string
    role: UserRole
}
