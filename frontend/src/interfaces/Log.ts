export interface Log {
    id: string
    tag: string
    time: string
    date: string
    who: string
    text: string
    color: string
}

export type AuditEventType = "DEFECT_CONFIRMED" | "DEFECT_REPORTED" | "DEFECT_RESOLVED" | "DEFECT_DISMISSED" | "LOAN_CREATED" | "LOAN_RETURNED" | "INBOUND" | "OUTBOUND_CONSUMPTION" | "ADJUSTMENT";

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
    startDate: string | null
    endDate: string | null
    name: string | null
    itemName: string | null
    type: AuditEventType | "LOAN_ALL" | null
}
