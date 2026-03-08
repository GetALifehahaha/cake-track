    import { useMemo } from "react";
    import API_ENDPOINTS from "@/api/endpoints";
    import { useSearchParams } from "react-router-dom";
    import useMutate from "./useMutate";
    import useQueryFetch from "./useQueryFetch";

    export default function useProduct({isArchived=false} = {}) {
        const [searchParams] = useSearchParams();

        const apiParams = useMemo(() => {
            const params = Object.fromEntries(searchParams.entries());
            if (isArchived) {
                params.is_archived = true;
            }
            return params;
        }, [searchParams, isArchived]);

        const productQuery = useQueryFetch("products", API_ENDPOINTS.PRODUCTS, apiParams);
        const { create, update, remove, loading: mutateLoading, error: mutateError } = useMutate("products");

        return {
            data: productQuery?.data || [],

            loading: productQuery.isPending || mutateLoading,

            error: productQuery.error || mutateError,

            postProduct: (params) => create(API_ENDPOINTS.PRODUCTS, params),

            patchProduct: (id, data) => update(`${API_ENDPOINTS.PRODUCTS}${id}/`, data),

            batchUnarchiveProduct: (data) => create(API_ENDPOINTS.PRODUCTS_UNARCHIVE, data),

            deleteProduct: (id) => remove(`${API_ENDPOINTS.PRODUCTS}${id}/`),

            refresh: () => productQuery.refetch()
        }
    }
