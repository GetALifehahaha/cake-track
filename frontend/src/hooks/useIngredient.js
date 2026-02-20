import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { IngredientApi } from "../api/IngredientApi";

export default function useIngredient() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    const apiParams = useMemo(() => {
        const params = Object.fromEntries(searchParams.entries());

        return params;
    }, [searchParams]);

    const ingredientsQuery = useQuery({
        queryKey: ["ingredients", JSON.stringify(apiParams)],
        queryFn: () => IngredientApi.fetchList(apiParams),
        placeholderData: (previous) => previous,
    });

    const fetchAllIngredients = useQuery({
        queryKey: ["ingredient-fetch-all"],
        queryFn: () => IngredientApi.fetchAll(),
    });
    
    const dashboardQuery = useQuery({
        queryKey: ["ingredient-dashboard"],
        queryFn: IngredientApi.fetchDashboard,
        placeholderData: (previous) => previous,
    });

    const invalidateAllInventoryData = () => {
        queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        queryClient.invalidateQueries({ queryKey: ['ingredient-fetch-all'] });
        queryClient.invalidateQueries({ queryKey: ['ingredient-dashboard'] });
        // If you have a separate history query key, add it here as well
        queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
    };

    const createMutation = useMutation({
        mutationFn: IngredientApi.create,
        onSuccess: invalidateAllInventoryData,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) =>
            IngredientApi.update(id, data),
        onSuccess: invalidateAllInventoryData,
    });

    const deleteMutation = useMutation({
        mutationFn: IngredientApi.delete,
        onSuccess: invalidateAllInventoryData,
    });

    const stockOutAllExpiredMutation = useMutation({
        mutationFn: IngredientApi.stockOutAllExpired,
        onSuccess: invalidateAllInventoryData
    })

    return {
        ingredientData: ingredientsQuery.data || [],
        ingredientDashboard: dashboardQuery.data || null,

        ingredientLoading:
            ingredientsQuery.isPending ||
            dashboardQuery.isPending ||
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending ||
            fetchAllIngredients.isPending,

        ingredientError:
            ingredientsQuery.error ||
            dashboardQuery.error ||
            createMutation.error ||
            updateMutation.error ||
            deleteMutation.error ||
            fetchAllIngredients.error,

        ingredientAll: fetchAllIngredients.data || [],

        postIngredient: createMutation.mutateAsync,
        patchIngredient: (id, data) =>
            updateMutation.mutateAsync({ id, data }),
        deleteIngredient: deleteMutation.mutateAsync,
        stockOutAllExpiredIngredient: stockOutAllExpiredMutation.mutateAsync,

        refresh: () => {
            ingredientsQuery.refetch();
            dashboardQuery.refetch();
        },
    };
}
