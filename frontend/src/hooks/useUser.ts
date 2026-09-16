import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../service/api";
import type { CreateUserRequest, User } from "../interfaces/User";

async function fetchUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/users");
    return response.data;
}

async function createUser(data: CreateUserRequest): Promise<void> {
    await api.post("/users", data);
}

async function changeUserRole(userId: string, role: User["role"]): Promise<void> {
    await api.patch(`/users/${userId}/role`, { role });
}

async function changeUserStatus(userId: string, active: boolean): Promise<void> {
    await api.patch(`/users/${userId}/status`, { active });
}

async function updateUser(userId: string, data: Pick<CreateUserRequest, "name" | "email">): Promise<void> {
    await api.patch(`/users/${userId}`, data);
}

async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
    await api.patch(`/users/${userId}/password`, { newPassword });
}

export function useUsers(enabled: boolean) {
    return useQuery({ queryKey: ["users"], queryFn: fetchUsers, enabled });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
    });
}

export function useChangeUserRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: User["role"] }) => changeUserRole(userId, role),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
    });
}

export function useChangeUserStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, active }: { userId: string; active: boolean }) => changeUserStatus(userId, active),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: Pick<CreateUserRequest, "name" | "email"> }) => updateUser(userId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
    });
}

export function useResetUserPassword() {
    return useMutation({
        mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) => resetUserPassword(userId, newPassword)
    });
}
