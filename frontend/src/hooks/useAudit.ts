import { useInfiniteQuery } from "@tanstack/react-query";
import type { AuditEvent, AuditFilter } from "../interfaces/Log";
import type { Page } from "../interfaces/Page";
import { api } from "../service/api";

async function fetchAuditEvents(filter: AuditFilter, page: number): Promise<Page<AuditEvent>> {
    const response = await api.get<Page<AuditEvent>>("/audit", {
        params: {
            ...(filter.startDate ? { startDate: filter.startDate } : {}),
            ...(filter.endDate ? { endDate: filter.endDate } : {}),
            ...(filter.name ? { userName: filter.name } : {}),
            page,
            size: 20
        }
    });

    return response.data;
}

export function useAuditEvents(filter: AuditFilter) {
    return useInfiniteQuery({
        queryKey: ["audit-events", filter],
        initialPageParam: 0,
        queryFn: ({ pageParam }) => fetchAuditEvents(filter, pageParam),
        getNextPageParam: (lastPage) => (
            lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined
        )
    });
}
