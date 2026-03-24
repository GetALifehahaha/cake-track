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
    const pendingTransactionsQuery = useQueryFetch(
        ["transactions", "pending", user?.id ?? "guest"],
        API_ENDPOINTS.TRANSACTIONS,
        { is_completed: false, is_void: false },
        { keepPreviousData: false }
    );
    const daySessionQuery = useQueryFetch(
        ["transactions", "day-session", user?.id ?? "guest"],
        API_ENDPOINTS.TRANSACTIONS_DAY_SESSION,
        {},
        { keepPreviousData: false }
    );

    const { create, update, remove, request, loading: mutateLoading, error: mutateError } =
        useMutate("transactions", {
            invalidateKeys: [
                ["transactions"],
                ["transactions", "pending"],
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
        completeTransaction: (id) => request("post", `${API_ENDPOINTS.TRANSACTIONS}${id}/complete/`),
        openDaySession: (openingAmount) =>
            request("post", API_ENDPOINTS.TRANSACTIONS_OPEN_DAY, { opening_amount: openingAmount }),
        closeDaySession: (removedAmount) =>
            request("post", API_ENDPOINTS.TRANSACTIONS_CLOSE_DAY, { removed_amount: removedAmount }),
        deleteTransaction: (id) => remove(`${API_ENDPOINTS.TRANSACTIONS}${id}/`),
        refresh: () => transactionQuery.refetch(),

        pendingData: pendingTransactionsQuery?.data || { results: [] },
        pendingLoading: pendingTransactionsQuery.isPending,
        pendingError: pendingTransactionsQuery.error,
        refreshPending: () => pendingTransactionsQuery.refetch(),

        daySession: daySessionQuery?.data || null,
        daySessionLoading: daySessionQuery.isPending,
        daySessionError: daySessionQuery.error,
        refreshDaySession: () => daySessionQuery.refetch(),
    };
}