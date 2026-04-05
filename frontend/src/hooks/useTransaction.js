import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";
import { useAuth } from "@/context/AuthContext";

export default function useTransaction() {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const registerPage = searchParams.get('register_page') || '1';
    const transactionPage = searchParams.get('transaction_page') || '1';

    const apiParams = useMemo(() => {
        const params = {};

        for (const [key, value] of searchParams.entries()) {
            if (key === 'page' || key === 'register_page' || key === 'transaction_page') {
                continue;
            }
            params[key] = value;
        }

        params.page = transactionPage;

        return params;
    }, [searchParams, transactionPage]);

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
    const registerMoneyQuery = useQueryFetch(
        ["transactions", "register-money", user?.id ?? "guest"],
        API_ENDPOINTS.TRANSACTIONS_REGISTER_MONEY,
        {},
        { keepPreviousData: false }
    );
    const deductionsQuery = useQueryFetch(
        ["transactions", "deductions", user?.id ?? "guest"],
        API_ENDPOINTS.TRANSACTIONS_DEDUCTIONS,
        {},
        { keepPreviousData: false }
    );
    const registerTransactionsQuery = useQueryFetch(
        ["transactions", "register-transactions", user?.id ?? "guest", registerPage],
        API_ENDPOINTS.TRANSACTIONS_REGISTER_TRANSACTIONS,
        { page: registerPage },
        { keepPreviousData: false }
    );

    const { create, update, remove, request, loading: mutateLoading, error: mutateError } =
        useMutate("transactions", {
            invalidateKeys: [
                ["transactions"],
                ["transactions", "pending"],
                ["discounts"],
                ["pos-dashboard"],
                ["products"],
                ["products_all"],
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
        setStartingMoney: (amount) =>
            request("post", API_ENDPOINTS.TRANSACTIONS_SET_STARTING_MONEY, { amount }),
        postDeduction: (payload) =>
            request("post", API_ENDPOINTS.TRANSACTIONS_DEDUCTIONS, payload),
        deleteTransaction: (id) => remove(`${API_ENDPOINTS.TRANSACTIONS}${id}/`),
        refresh: () => transactionQuery.refetch(),

        pendingData: pendingTransactionsQuery?.data || { results: [] },
        pendingLoading: pendingTransactionsQuery.isPending,
        pendingError: pendingTransactionsQuery.error,
        refreshPending: () => pendingTransactionsQuery.refetch(),

        registerMoney: registerMoneyQuery?.data || null,
        registerMoneyLoading: registerMoneyQuery.isPending,
        registerMoneyError: registerMoneyQuery.error,
        refreshRegisterMoney: () => registerMoneyQuery.refetch(),

        deductions: deductionsQuery?.data || [],
        deductionsLoading: deductionsQuery.isPending,
        deductionsError: deductionsQuery.error,
        refreshDeductions: () => deductionsQuery.refetch(),

        registerTransactions: registerTransactionsQuery?.data || { results: [], next: null, previous: null },
        registerTransactionsLoading: registerTransactionsQuery.isPending,
        registerTransactionsError: registerTransactionsQuery.error,
        refreshRegisterTransactions: () => registerTransactionsQuery.refetch(),
    };
}