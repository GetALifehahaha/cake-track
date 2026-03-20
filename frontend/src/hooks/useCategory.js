import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export default function useCategory(options = {}) {
    const { includeDisabled = false } = options;

    const categoryQuery = useQuery({
        queryKey: ["categories", includeDisabled ? "all" : "active"],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.CATEGORIES, {
                params: includeDisabled ? { include_disabled: true } : undefined,
            });
            const categories = response.data.results || response.data;
            if (includeDisabled) return categories;
            return categories.filter((category) => !category?.is_disabled);
        },
        staleTime: 10 * 60 * 1000,
    });

    const { create, update, remove, loading: mutateLoading, error: mutateError, response } = useMutate("categories", {
        invalidateKeys: [["categories", "all"], ["categories", "active"], ["products"]]
    });

    return {
        categoryData: categoryQuery.data || [],
        categoryLoading: categoryQuery.isPending || mutateLoading,
        categoryError: categoryQuery.error || mutateError,
        categoryResponse: response,
        fetchCategories: () => categoryQuery.refetch(),
        refresh: () => categoryQuery.refetch(),
        postCategory: (params) => create(API_ENDPOINTS.CATEGORIES, params),
        patchCategory: (id, data) => update(`${API_ENDPOINTS.CATEGORIES}${id}/`, data),
        deleteCategory: (id) => remove(`${API_ENDPOINTS.CATEGORIES}${id}/`),
        updateCategory: (id, data) => update(`${API_ENDPOINTS.CATEGORIES}${id}/`, data),
    };
}