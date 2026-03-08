import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { saveAllCategories, getLocalCategories } from "@/services/db";

export default function useCategory() {
    const categoryQuery = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            if (navigator.onLine) {
                try {
                    const response = await api.get(API_ENDPOINTS.CATEGORIES);
                    const categories = response.data.results || response.data;
                    await saveAllCategories(categories);
                } catch (error) {
                    console.warn("Offline or network error, relying on local categories cache.");
                }
            }
            return await getLocalCategories();
        },
        staleTime: 10 * 60 * 1000,
    });

    const { create, update, remove, loading: mutateLoading, error: mutateError, response } = useMutate("categories", {
        invalidateKeys: [["categories"]]
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