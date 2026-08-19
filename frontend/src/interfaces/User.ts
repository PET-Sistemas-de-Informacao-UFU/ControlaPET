export type UserRole = "ADMIN" | "MEMBER";

export interface User {
    id: string
    nome: string
    email: string
    role: UserRole
}
