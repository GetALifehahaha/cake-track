import API_ENDPOINTS from "@/api/endpoints";
import { useSearchParams } from 'react-router-dom';
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useRecipe(params = {}){
    const [searchParams] = useSearchParams();
    const q = searchParams.get('q');

    const apiParams = { ...params, ...(q ? { q } : {}) };

    const recipeQuery = useQueryFetch("recipes", API_ENDPOINTS.RECIPES, apiParams);
    const { create, update, remove, request, loading: mutateLoading, error: mutateError } =
        useMutate("recipes", {
            invalidateKeys: [
                ["recipes"],
                ["ingredients"],
                ["ingredient-fetch-all"],
                ["ingredient-dashboard"],
                ["inventory-transactions"],
            ],
        });

    return {
        // Automatically extracts results if the API is paginated
        data: recipeQuery?.data || [],

        loading:
            recipeQuery.isPending ||
            mutateLoading,

        error: recipeQuery.error || mutateError,

        postRecipe: (data) => create(API_ENDPOINTS.RECIPES, data),
        patchRecipe: (id, data) => update(`${API_ENDPOINTS.RECIPES}${id}/`, data),
        deleteRecipe: (id) => remove(`${API_ENDPOINTS.RECIPES}${id}/`),
        cookRecipe: (payload) => request("post", `${API_ENDPOINTS.RECIPES}cook/`, payload),
        refresh: () => recipeQuery.refetch(),
    };
};