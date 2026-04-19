import { useMemo } from "react";
import API_ENDPOINTS from "@/api/endpoints";
import { useSearchParams } from "react-router-dom";
import useMutate from "./useMutate";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import useQueryFetch from "./useQueryFetch";

export default function useProduct({isArchived=false, extraParams = {}} = {}) {
    const [searchParams] = useSearchParams();

    const apiParams = useMemo(() => {
        const params = Object.fromEntries(searchParams.entries());

        Object.entries(extraParams || {}).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                return;
            }

            params[key] = String(value);
        });

        if (isArchived) {
            params.is_archived = true;
        }
        return params;
    }, [searchParams, isArchived, extraParams]);

    const productQuery = useQuery({
        queryKey: ["products", apiParams],
        queryFn: () => api.get(API_ENDPOINTS.PRODUCTS, { params: apiParams }).then((res) => res.data),
        staleTime: 5 * 60 * 1000
    });

    const productAllQuery = useQueryFetch(["products_all"], API_ENDPOINTS.PRODUCTS_ALL, {}, { keepPreviousData: false });

    const { create, update, remove, loading: mutateLoading, error: mutateError } = useMutate("products", {
        invalidateKeys: [["products"]]
    });

    return {
        data: productQuery?.data || { results: [], next: null, previous: null },
        loading: productQuery.isPending || mutateLoading,
        error: productQuery.error || mutateError,
        allProducts: productAllQuery?.data || [],
        postProduct: (params) => create(API_ENDPOINTS.PRODUCTS, params),
        patchProduct: (id, data) => update(`${API_ENDPOINTS.PRODUCTS}${id}/`, data),
        batchUnarchiveProduct: (data) => create(API_ENDPOINTS.PRODUCTS_UNARCHIVE, data),
        deleteProduct: (id) => remove(`${API_ENDPOINTS.PRODUCTS}${id}/`),
        refresh: () => productQuery.refetch()
    }
}