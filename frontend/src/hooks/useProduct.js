import { useMemo } from "react";
import API_ENDPOINTS from "@/api/endpoints";
import { useSearchParams } from "react-router-dom";
import useMutate from "./useMutate";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { getLocalProducts, saveAllProducts } from "@/services/db";

export default function useProduct({isArchived=false} = {}) {
    const [searchParams] = useSearchParams();

    const apiParams = useMemo(() => {
        const params = Object.fromEntries(searchParams.entries());
        if (isArchived) {
            params.is_archived = true;
        }
        return params;
    }, [searchParams, isArchived]);

    const productQuery = useQuery({
        queryKey: ["products", apiParams],
        queryFn: async () => {
            const page = parseInt(apiParams.page || 1);
            const limit = 15; // Set your preferred page limit
            const category = apiParams.categories__name;
            const q = apiParams.q;

            if (navigator.onLine) {
                try {
                    // Fetch all products without pagination to cache them. 
                    // Adjust limit parameter to ensure you grab the entire catalog.
                    const response = await api.get('/pos/products/get_all/');
                    const allProducts = response.data.results || response.data;
                    await saveAllProducts(allProducts);
                } catch (error) {
                    console.warn("Failed to sync products. Serving from local cache.", error);
                }
            }

            // Always serve from the local IndexedDB cache to guarantee offline availability and fast local pagination
            return await getLocalProducts({ page, limit, category, q });
        },
        staleTime: 5 * 60 * 1000
    });

    const { create, update, remove, loading: mutateLoading, error: mutateError } = useMutate("products", {
        invalidateKeys: [["products"]]
    });

    return {
        data: productQuery?.data || { results: [], next: null, previous: null },
        loading: productQuery.isPending || mutateLoading,
        error: productQuery.error || mutateError,
        postProduct: (params) => create(API_ENDPOINTS.PRODUCTS, params),
        patchProduct: (id, data) => update(`${API_ENDPOINTS.PRODUCTS}${id}/`, data),
        batchUnarchiveProduct: (data) => create(API_ENDPOINTS.PRODUCTS_UNARCHIVE, data),
        deleteProduct: (id) => remove(`${API_ENDPOINTS.PRODUCTS}${id}/`),
        refresh: () => productQuery.refetch()
    }
}