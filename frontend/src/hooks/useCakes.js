import { useMemo } from "react";
import API_ENDPOINTS from "@/api/endpoints";
import { useSearchParams } from "react-router-dom";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useCakes({ isArchived = false } = {}) {
    const [searchParams] = useSearchParams();

    const apiParams = useMemo(() => {
        const params = Object.fromEntries(searchParams.entries());
        if (isArchived) {
            params.is_archived = true;
        }
        return params;
    }, [searchParams, isArchived]);

    const cakesQuery = useQueryFetch("cakes", API_ENDPOINTS.CAKES, apiParams);
    const { create, update, remove, loading: mutateLoading, error: mutateError } = useMutate("cakes");

    return {
        data: cakesQuery.data || [],

        loading: cakesQuery.isPending || mutateLoading,

        error: cakesQuery.error || mutateError,

        postCake: (params) => create(API_ENDPOINTS.CAKES, params),

        patchCake: (id, data) => update(`${API_ENDPOINTS.CAKES}${id}/`, data),

        deleteCake: (id) => remove(`${API_ENDPOINTS.CAKES}${id}/`),

        batchUnarchiveCake: (data) => create(API_ENDPOINTS.CAKES_UNARCHIVE, data),

        refresh: () => cakesQuery.refetch()
    };
}
