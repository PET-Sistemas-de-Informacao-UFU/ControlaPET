export type MovementType = 'INBOUND' | 'OUTBOUND_CONSUMPTION' | 'ADJUSTMENT'

export interface Movement {
    id: number,
    userName: string,
    itemId: number,
    itemName: string,
    type: MovementType,
    notes: string,
    quantity: number,
    movementDate: string
}

export interface CreateMovementRequest {
    itemId: number,
    quantity: number,
    notes: String,
    type: MovementType
}

export interface ConsumeItem {
    itemId: number,
    quantity: number
}

export interface UserMovementHistory {
    sourceId: number,
    type: 'LOAN_RETURNED' | 'OUTBOUND_CONSUMPTION',
    itemName: string,
    quantity: number,
    notes: string | null,
    eventDate: string
}
