import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useIngredient() {
    const [searchParams] = useSearchParams();

    const apiParams = useMemo(() => {
        const params = Object.fromEntries(searchParams.entries());

        return params;
    }, [searchParams]);

    const ingredientsQuery = useQueryFetch("ingredients", API_ENDPOINTS.INGREDIENTS, apiParams);
    const fetchAllIngredients = useQueryFetch("ingredient-fetch-all", API_ENDPOINTS.INGREDIENTS_ALL);
    const dashboardQuery = useQueryFetch("ingredient-dashboard", API_ENDPOINTS.INGREDIENTS_DASHBOARD);
    const { create, update, remove, loading: mutateLoading, error: mutateError } = useMutate(
        "ingredients",
        {
            invalidateKeys: [
                ["ingredients"],
                ["ingredient-fetch-all"],
                ["ingredient-dashboard"],
                ["inventory-transactions"],
                ["recipes"],
            ],
        },
    );

    return {
        ingredientData: ingredientsQuery.data || [],
        ingredientDashboard: dashboardQuery.data || null,

        ingredientLoading:
            ingredientsQuery.isPending ||
            dashboardQuery.isPending ||
            mutateLoading ||
            fetchAllIngredients.isPending,

        ingredientError:
            ingredientsQuery.error ||
            dashboardQuery.error ||
            mutateError ||
            fetchAllIngredients.error,

        ingredientAll: fetchAllIngredients.data || [],

        postIngredient: (params) => create(API_ENDPOINTS.INGREDIENTS, params),
        patchIngredient: (id, data) => update(`${API_ENDPOINTS.INGREDIENTS}${id}/`, data),
        deleteIngredient: (id) => remove(`${API_ENDPOINTS.INGREDIENTS}${id}/`),
        stockOutAllExpiredIngredient: () => create(API_ENDPOINTS.INGREDIENTS_STOCK_OUT_EXPIRED),

        refresh: () => {
            ingredientsQuery.refetch();
            dashboardQuery.refetch();
            fetchAllIngredients.refetch();
        },
    };
}

