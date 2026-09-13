import { api } from "../service/api";
import type { Page } from "../interfaces/Page";
import type { CreateLoanRequest, Loan } from "../interfaces/Loan";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const fetchData = async(): Promise<Page<Loan>> => {
    const response = await api.get<Page<Loan>>("/loans");
    return response.data;
}

export function useLoanData(){
    return useQuery({
        queryFn: fetchData,
        queryKey: ['loans-data']
    })
}


const fetchUserLoans = async(): Promise<Page<Loan>> => {
    const response = await api.get<Page<Loan>>("/loans/me");
    return response.data;
}

export function useUserLoans(){
    return useQuery({
        queryFn: fetchUserLoans,
        queryKey: ['user-loans-data']
    })
}

const fetchUserPendingLoans = async(): Promise<Page<Loan>> => {
    const response = await api.get<Page<Loan>>("/loans/pending");
    return response.data;
}

export function useUserPendingLoans(){
    return useQuery({
        queryFn: fetchUserPendingLoans,
        queryKey: ['user-pending-loans-data']
    })
}

const addLoan = async(data:CreateLoanRequest): Promise<Loan> =>{
    const response = await api.post<Loan>("/loans", data);
    return response.data;
}

export function useAddLoan(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addLoan,

        onSuccess() {
            queryClient.invalidateQueries({queryKey: ['loans-data']});
            queryClient.invalidateQueries({queryKey: ['user-loans-data']});
            queryClient.invalidateQueries({queryKey: ['user-pending-loans-data']});
            queryClient.invalidateQueries({queryKey: ['items-data']});
        }
    })
}

const returnItem = async (loanId: number): Promise<Loan> => {
    const response = await api.patch<Loan>(`/loans/${loanId}/return`);
    return response.data;
}

export function useReturnLoan(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({loanId}: {
            loanId: number;
        }) => returnItem(loanId),

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['loans-data']});
            queryClient.invalidateQueries({queryKey: ['user-loans-data']});
            queryClient.invalidateQueries({queryKey: ['user-pending-loans-data']});
        }
    })
}
