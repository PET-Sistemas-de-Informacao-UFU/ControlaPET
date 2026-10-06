import type { ConsumeItem, CreateMovementRequest, Movement } from "../interfaces/Movement";
import type { Page } from "../interfaces/Page";
import { api } from "../service/api";
import { useInfiniteQuery, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { UserMovementHistory } from "../interfaces/Movement";

const fetchData = async(): Promise<Page<Movement>> => {
    const response = await api.get<Page<Movement>>("/movements");
    return response.data;
}

export function useMovementData(){
    return useQuery({
        queryFn: fetchData,
        queryKey: ['movements-data']
    })
}

const fetchUserMovements = async(): Promise<Page<Movement>> => {
    const response = await api.get<Page<Movement>>("/movements/me");
    return response.data;
}

export function useUserMovements(){
    return useQuery({
        queryFn: fetchUserMovements,
        queryKey: ['user-movements-data']
    })
}

const fetchUserMovementHistory = async(page: number): Promise<Page<UserMovementHistory>> => {
    const response = await api.get<Page<UserMovementHistory>>("/movements/me/history", { params: { page, size: 20 } });
    return response.data;
}

export function useUserMovementHistory() {
    return useInfiniteQuery({
        queryKey: ['user-movement-history'],
        initialPageParam: 0,
        queryFn: ({ pageParam }) => fetchUserMovementHistory(pageParam),
        getNextPageParam: (lastPage) => (
            lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined
        )
    });
}

const fetchItemMovement = async(itemId: number): Promise<Page<Movement>> => {
    const response = await api.get<Page<Movement>>(`/movements/item/${itemId}`);
    return response.data;
}

export function useItemMovement(itemId: number){
    return useQuery({
        queryFn: () => fetchItemMovement(itemId),
        queryKey: ['item-movements', itemId]
    })
}

const addMovement = async(data:CreateMovementRequest): Promise<Movement> =>{
    const response = await api.post<Movement>("/movements", data);
    return response.data;
}

export function useAddMovement(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addMovement,

        onSuccess() {
            queryClient.invalidateQueries({queryKey: ['movements-data']});
            queryClient.invalidateQueries({queryKey: ['user-movements-data']});
            queryClient.invalidateQueries({queryKey: ['user-movement-history']});
            queryClient.invalidateQueries({queryKey: ['items-data']});
        }
    })
}

const consumeItem = async(data:ConsumeItem): Promise<Movement> =>{
    const response = await api.post<Movement>("/movements/consume", data);
    return response.data;
}

export function useConsumeItem(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: consumeItem,

        onSuccess() {
            queryClient.invalidateQueries({queryKey: ['movements-data']});
            queryClient.invalidateQueries({queryKey: ['user-movements-data']});
            queryClient.invalidateQueries({queryKey: ['user-movement-history']});
        }
    })
}
