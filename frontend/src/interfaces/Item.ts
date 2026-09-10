export type ItemType = 'CONSUMABLE' | 'BORROWABLE' | 'PERMANENT';
export type ItemCondition = 'NEW' | 'GOOD' | 'DAMAGED';

export interface Item {
    id: number
    name: string
    description: string
    type: ItemType
    condition: ItemCondition
    totalQuantity: number
    stockQuantity: number
    createdAt: string
    updatedAt: string
}

export interface CreateItemRequest {
    name: string
    description: string
    type: ItemType
    condition: ItemCondition
    totalQuantity: number
    stockQuantity: number
}

export interface updatedItemRequest {
    name?: string
    description?: string
    type?: ItemType
    condition?: ItemCondition
    totalQuantity?: number
    stockQuantity?: number
}
