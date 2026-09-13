export interface Log {
    id: string
    tag: string
    time: string
    date: string
    who: string
    text: string
    color: string
}

export type AuditEventType = "LOAN_CREATED" | "LOAN_RETURNED" | "INBOUND" | "OUTBOUND_CONSUMPTION" | "ADJUSTMENT";

export interface AuditEvent {
    sourceId: number
    type: AuditEventType
    userName: string
    itemId: number
    itemName: string
    quantity: number
    eventDate: string
}

export interface AuditFilter {
    date: string | null
    name: string | null
}
