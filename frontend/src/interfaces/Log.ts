export interface Log {
    tag: string
    time: string
    date: string
    who: string
    text: string
    color: string
}

export interface AuditFilter {
    date: string | null
    name: string | null
}
