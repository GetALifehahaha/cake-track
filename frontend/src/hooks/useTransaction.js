import { useMemo } from "react";
import { TransactionApi } from "../api/TransactionApi";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function useTransaction() {
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const apiParams = useMemo(() => {
        return Object.fromEntries(searchParams.entries());
    }, [searchParams]);

    const transactionQuery = useQuery({
        queryKey: ['transactions', JSON.stringify(apiParams)],
        queryFn: () => TransactionApi.fetchList(apiParams),
        placeholderData: (previous) => previous
    });

    const onSuccessInvalidate = () => queryClient.invalidateQueries({queryKey: ['transactions']});

    const createMutation = useMutation({
        mutationFn: (data) => TransactionApi.create(data),
        onSuccess: onSuccessInvalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({id, data}) => TransactionApi.update(id, data),
        onSuccess: onSuccessInvalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => TransactionApi.delete(id),
        onSuccess: onSuccessInvalidate,
    });

    return {
        data: transactionQuery?.data || [],

        loading: transactionQuery.isPending || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,

        error: transactionQuery.error || createMutation.error || updateMutation.error || deleteMutation.error,

        postTransaction: async (params) => {
            return createMutation.mutateAsync(params);
        },

        patchTransaction: async (id, data) => {
            return updateMutation.mutateAsync({id, data});
        },

        deleteTransaction: async (id) => {
            return deleteMutation.mutateAsync(id);
        },

        refresh: () => transactionQuery.refetch()
    };
}