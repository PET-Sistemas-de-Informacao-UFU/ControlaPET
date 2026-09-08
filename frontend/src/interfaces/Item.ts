export type ItemType = 'CONSUMIVEL' | 'EMPRESTAVEL' | 'PERMANENTE';
export type ItemCondition = 'NOVO' | 'BOM' | 'DANIFICADO';

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
