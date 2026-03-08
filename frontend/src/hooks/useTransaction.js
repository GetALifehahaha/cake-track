import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useTransaction() {
    const [searchParams] = useSearchParams();

    const apiParams = useMemo(() => {
        return Object.fromEntries(searchParams.entries());
    }, [searchParams]);

    const transactionQuery = useQueryFetch("transactions", API_ENDPOINTS.TRANSACTIONS, apiParams);
    const { create, update, remove, loading: mutateLoading, error: mutateError } =
        useMutate("transactions");

    return {
        data: transactionQuery?.data || [],

        loading: transactionQuery.isPending || mutateLoading,

        error: transactionQuery.error || mutateError,

        postTransaction: (params) => create(API_ENDPOINTS.TRANSACTIONS, params),

        patchTransaction: (id, data) => update(`${API_ENDPOINTS.TRANSACTIONS}${id}/`, data),

        deleteTransaction: (id) => remove(`${API_ENDPOINTS.TRANSACTIONS}${id}/`),

        refresh: () => transactionQuery.refetch()
    };
}