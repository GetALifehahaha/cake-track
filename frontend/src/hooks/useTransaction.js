import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";
import { useAuth } from "@/context/AuthContext";

export default function useTransaction() {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const apiParams = useMemo(() => {
        return Object.fromEntries(searchParams.entries());
    }, [searchParams]);

    const transactionQuery = useQueryFetch(
        ["transactions", user?.id ?? "guest"],
        API_ENDPOINTS.TRANSACTIONS,
        apiParams,
        { keepPreviousData: false }
    );
    const { create, update, remove, loading: mutateLoading, error: mutateError } =
        useMutate("transactions", {
            invalidateKeys: [
                ["transactions"],
                ["pos-dashboard"],
                ["ingredients"],
                ["ingredient-fetch-all"],
                ["ingredient-dashboard"],
                ["inventory-transactions"],
            ],
        });

    const postTransaction = async (params) => {
        const data = await create(API_ENDPOINTS.TRANSACTIONS, params);
        return { source: "server", data };
    };

    return {
        data: transactionQuery?.data || [],
        loading: transactionQuery.isPending || mutateLoading,
        error: transactionQuery.error || mutateError,

        postTransaction,
        patchTransaction: (id, data) => update(`${API_ENDPOINTS.TRANSACTIONS}${id}/`, data),
        deleteTransaction: (id) => remove(`${API_ENDPOINTS.TRANSACTIONS}${id}/`),
        refresh: () => transactionQuery.refetch(),
    };
}