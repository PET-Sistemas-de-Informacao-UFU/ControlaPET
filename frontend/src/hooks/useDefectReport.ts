import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../service/api";
import type { Page } from "../interfaces/Page";

export type DefectReportStatus = "OPEN" | "WAITING_RETURN" | "IN_MAINTENANCE" | "RESOLVED" | "DISMISSED" | "WRITTEN_OFF";
export interface DefectReport {
    id: number
    itemId: number
    reportedByName: string
    description: string
    quantity: number | null
    confirmedQuantity: number | null
    reservedQuantity: number
    stockReservedAt: string | null
    loanId: number | null
    confirmedByName: string | null
    confirmedAt: string | null
    maintenanceStartedAt: string | null
    status: DefectReportStatus
    createdAt: string
    closedByName: string | null
    closedAt: string | null
    resolutionNotes: string | null
}

export function useDefectReports(itemId: number | null) {
    return useInfiniteQuery({
        queryKey: ["defect-reports", itemId],
        enabled: itemId !== null,
        initialPageParam: 0,
        queryFn: async ({ pageParam }) => {
            const response = await api.get<Page<DefectReport>>(`/items/${itemId}/defect-reports`, { params: { page: pageParam, size: 10 } });
            return response.data;
        },
        getNextPageParam: (page) => page.number + 1 < page.totalPages ? page.number + 1 : undefined
    });
}

export function useAddDefectReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ itemId, description, quantity, loanId }: { itemId: number; description: string; quantity: number; loanId?: number }) => {
            const response = await api.post<DefectReport>(`/items/${itemId}/defect-reports`, { description, quantity, loanId });
            return response.data;
        },
        onSuccess: (_, { itemId }) => {
            queryClient.invalidateQueries({ queryKey: ["defect-reports", itemId] });
            queryClient.invalidateQueries({ queryKey: ["audit-events"] });
            queryClient.invalidateQueries({ queryKey: ["items-data"] });
            queryClient.invalidateQueries({ queryKey: ["item", itemId] });
        }
    });
}

export function useCloseDefectReport(itemId: number | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status, resolutionNotes }: { id: number; status: "RESOLVED" | "DISMISSED" | "WRITTEN_OFF"; resolutionNotes: string }) => {
            const response = await api.patch<DefectReport>(`/items/${itemId}/defect-reports/${id}/close`, { status, resolutionNotes });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["defect-reports", itemId] });
            queryClient.invalidateQueries({ queryKey: ["audit-events"] });
            queryClient.invalidateQueries({ queryKey: ["items-data"] });
            queryClient.invalidateQueries({ queryKey: ["item", itemId] });
        }
    });
}

export function useConfirmDefectReport(itemId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
            const response = await api.patch<DefectReport>(`/items/${itemId}/defect-reports/${id}/confirm`, { quantity });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["defect-reports", itemId] });
            queryClient.invalidateQueries({ queryKey: ["items-data"] });
            queryClient.invalidateQueries({ queryKey: ["item", itemId] });
            queryClient.invalidateQueries({ queryKey: ["audit-events"] });
        }
    });
}
