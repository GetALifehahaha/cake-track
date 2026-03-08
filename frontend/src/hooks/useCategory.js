import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useCategory() {
    const categoryQuery = useQueryFetch("categories", API_ENDPOINTS.CATEGORIES);
    const { create, update, remove, loading: mutateLoading, error: mutateError, response } =
        useMutate("categories");

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