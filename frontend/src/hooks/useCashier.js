import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import  {CashierApi } from "@/api/CashierApi";

export default function useCashier() {
    const queryClient = useQueryClient();

    const cashiersQuery = useQuery({
        queryKey: ['cashiers'],
        queryFn: () => CashierApi.fetchList(),
        placeholderData: (previousData) => previousData,
    });

    

    const onSuccessValidate = () => {
        queryClient.invalidateQueries({queryKey: ['cashiers']})
    }

    const createMutation = useMutation({
        mutationFn: (params) => CashierApi.createCashier(params),
        onSuccess: onSuccessValidate
    })

    const updateMutation = useMutation({
        mutationFn: ({id, params}) => CashierApi.update(id, params),
        onSuccess: onSuccessValidate
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => CashierApi.delete(id),
        onSuccess: onSuccessValidate
    })

    const activateAccountMutation = useMutation({
        mutationFn: (data) => CashierApi.activateAccount(data),
        onSuccess: onSuccessValidate
    })

    return {
        data: cashiersQuery.data || [],

        loading: cashiersQuery.isPending || 
                createMutation.isPending || 
                updateMutation.isPending || 
                deleteMutation.isPending,

        error: cashiersQuery.error || 
                createMutation.error || 
                updateMutation.error || 
                deleteMutation.error,

        postCashier: async (params) => {
            return createMutation.mutateAsync(params)
        },

        patchCashier: async (id, params) => {
            return updateMutation.mutateAsync({id, params})
        },

        deleteCashier: async (id) => {
            return deleteMutation.mutateAsync(id)
        },

        activateAccount: async (data) => {
            return activateAccountMutation.mutateAsync(data)
        },

        refresh: () => cashiersQuery.refetch(),
    }
}