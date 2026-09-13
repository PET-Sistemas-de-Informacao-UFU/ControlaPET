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