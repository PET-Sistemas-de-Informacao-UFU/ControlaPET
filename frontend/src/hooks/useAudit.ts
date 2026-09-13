import { useQuery } from "@tanstack/react-query";
import type { AuditEvent, AuditFilter } from "../interfaces/Log";
import type { Page } from "../interfaces/Page";
import { api } from "../service/api";

async function fetchAuditEvents(filter: AuditFilter): Promise<Page<AuditEvent>> {
    const response = await api.get<Page<AuditEvent>>("/audit", {
        params: {
            ...(filter.date ? { date: filter.date } : {}),
            ...(filter.name ? { userName: filter.name } : {})
        }
    });

    return response.data;
}

export function useAuditEvents(filter: AuditFilter) {
    return useQuery({
        queryKey: ["audit-events", filter],
        queryFn: () => fetchAuditEvents(filter)
    });
}
