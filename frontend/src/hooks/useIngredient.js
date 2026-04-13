import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useIngredient(options = {}) {
    const {
        usePaginatedInventory = false,
        includeAllIngredients = true,
    } = options;

    const [searchParams] = useSearchParams();

    const apiParams = useMemo(() => {
        const params = Object.fromEntries(searchParams.entries());

        return params;
    }, [searchParams]);

    const ingredientsEndpoint = usePaginatedInventory
        ? API_ENDPOINTS.INGREDIENTS_PAGINATED
        : API_ENDPOINTS.INGREDIENTS;
    const ingredientsKey = usePaginatedInventory ? "ingredients-paginated" : "ingredients";

    const ingredientsQuery = useQueryFetch(ingredientsKey, ingredientsEndpoint, apiParams);
    const fetchAllIngredients = useQueryFetch("ingredient-fetch-all", API_ENDPOINTS.INGREDIENTS_ALL, undefined, {
        enabled: includeAllIngredients,
    });
    const dashboardQuery = useQueryFetch("ingredient-dashboard", API_ENDPOINTS.INGREDIENTS_DASHBOARD);
    const { create, update, remove, loading: mutateLoading, error: mutateError } = useMutate(
        "ingredients",
        {
            invalidateKeys: [
                ["ingredients"],
                ["ingredients-paginated"],
                ["ingredient-fetch-all"],
                ["ingredient-dashboard"],
                ["inventory-transactions"],
                ["recipes"],
                ["products"],
                ["products_all"],
                ["cakes"],
                ["orders"],
                ["orders-dashboard"],
                ["orders-overview"],
                ["transactions"],
                ["pos-dashboard"],
                ["admin-notifications-orders-dashboard"],
                ["admin-notifications-ingredients-all"],
                ["admin-notifications-refund-requests"],
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
            (includeAllIngredients && fetchAllIngredients.isPending),

        ingredientError:
            ingredientsQuery.error ||
            dashboardQuery.error ||
            mutateError ||
            (includeAllIngredients ? fetchAllIngredients.error : null),

        ingredientAll: includeAllIngredients ? (fetchAllIngredients.data || []) : [],

        postIngredient: (params) => create(API_ENDPOINTS.INGREDIENTS, params),
        patchIngredient: (id, data) => update(`${API_ENDPOINTS.INGREDIENTS}${id}/`, data),
        deleteIngredient: (id) => remove(`${API_ENDPOINTS.INGREDIENTS}${id}/`),
        stockOutAllExpiredIngredient: () => create(API_ENDPOINTS.INGREDIENTS_STOCK_OUT_EXPIRED),

        refresh: () => {
            ingredientsQuery.refetch();
            dashboardQuery.refetch();
            if (includeAllIngredients) {
                fetchAllIngredients.refetch();
            }
        },
    };
}

