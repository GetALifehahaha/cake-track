import { useMemo } from "react";
import API_ENDPOINTS from "@/api/endpoints";
import { useSearchParams } from "react-router-dom";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useCashier() {
    const [searchParams] = useSearchParams();
    const q = searchParams.get('q');

    const apiParams = useMemo(() => ({ ...(q ? { q } : {}) }), [q]);
    const cashiersQuery = useQueryFetch("cashiers", API_ENDPOINTS.USERS, apiParams);
    const { create, update, remove, loading: mutateLoading, error: mutateError } = useMutate("cashiers");

    return {
        data: cashiersQuery.data || [],

        loading: cashiersQuery.isPending || mutateLoading,

        error: cashiersQuery.error || mutateError,

        postCashier: (params) => create(API_ENDPOINTS.USERS_REGISTER, params),

        patchCashier: (id, params) => update(`${API_ENDPOINTS.USERS}${id}/`, params),

        deleteCashier: (id) => remove(`${API_ENDPOINTS.USERS}${id}/`),

        activateAccount: (data) => create(API_ENDPOINTS.USERS_ACTIVATE, data),

        refresh: () => cashiersQuery.refetch(),
    }
}