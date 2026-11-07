import { api } from "../service/api"
import type { Item, ItemType, ItemCondition, CreateItemRequest, UpdateItemRequest } from "../interfaces/Item"
import type { Page } from "../interfaces/Page"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export interface ItemFilters {
    name: string
    type: ItemType | ""
    condition: ItemCondition | ""
    available: "" | "true" | "false"
}

const fetchData = async(filters: ItemFilters, page: number): Promise<Page<Item>> => {
    const response = await api.get<Page<Item>>("/items", {
        params: {
            ...(filters.name ? { name: filters.name } : {}),
            ...(filters.type ? { type: filters.type } : {}),
            ...(filters.condition ? { condition: filters.condition } : {}),
            ...(filters.available ? { available: filters.available } : {}),
            page,
            size: 20
        }
    });
    return response.data;
}

export function useItemData(filters: ItemFilters){
    return useInfiniteQuery({
        queryFn: ({ pageParam }) => fetchData(filters, pageParam),
        queryKey: ['items-data', filters],
        initialPageParam: 0,
        getNextPageParam: (lastPage) => (
            lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined
        )
    })
}

const fetchItem = async(itemId: number): Promise<Item> => {
    const response = await api.get<Item>(`/items/${itemId}`);
    return response.data;
}

export function useItem(itemId: number){
    return useQuery({
        queryFn: () => fetchItem(itemId),
        queryKey: ['item', itemId]
    })
}

const addItem = async(data:CreateItemRequest): Promise<Item> =>{
    const response = await api.post<Item>("/items", data);
    return response.data;
}

export function useAddItem(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addItem,

        onSuccess() {
            queryClient.invalidateQueries({queryKey: ['items-data']});
        }
    })
}

const updateItem = async (itemId: number, data: UpdateItemRequest): Promise<Item> => {
    const response = await api.patch<Item>(`/items/${itemId}`, data);
    return response.data;
}

export function useUpdateItem(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            itemId, data
        }: {
            itemId: number;
            data: UpdateItemRequest;
        }) => updateItem(itemId, data),

        onSuccess: (_, { itemId }) => {
            queryClient.invalidateQueries({queryKey: ['items-data']});
            queryClient.invalidateQueries({queryKey: ['item', itemId]});
        }
    })
}

const deleteItem = async(itemId: number): Promise<void> => {
    await api.delete(`/items/${itemId}`);
}

export function useDeleteItem(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteItem,

        onSuccess: (_,  itemId ) => {
            queryClient.invalidateQueries({queryKey: ['items-data']});
            queryClient.invalidateQueries({queryKey: ['item', itemId]});
        }
    })
}
