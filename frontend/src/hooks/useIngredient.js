import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { IngredientApi } from "../api/IngredientApi";

export default function useIngredient(all = false) {
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

    const dashboardQuery = useQuery({
        queryKey: ["ingredient-dashboard"],
        queryFn: IngredientApi.fetchDashboard,
        placeholderData: (previous) => previous,
    });

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ["ingredients"] });
        queryClient.invalidateQueries({ queryKey: ["ingredient-dashboard"] });
    };

    const createMutation = useMutation({
        mutationFn: IngredientApi.create,
        onSuccess: invalidateAll,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) =>
            IngredientApi.update(id, data),
        onSuccess: invalidateAll,
    });

    const deleteMutation = useMutation({
        mutationFn: IngredientApi.delete,
        onSuccess: invalidateAll,
    });

    return {
        ingredientData: ingredientsQuery.data || [],
        ingredientDashboard: dashboardQuery.data || null,

        ingredientLoading:
            ingredientsQuery.isPending ||
            dashboardQuery.isPending ||
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending,

        ingredientError:
            ingredientsQuery.error ||
            dashboardQuery.error ||
            createMutation.error ||
            updateMutation.error ||
            deleteMutation.error,

        postIngredient: createMutation.mutateAsync,
        patchIngredient: (id, data) =>
            updateMutation.mutateAsync({ id, data }),
        deleteIngredient: deleteMutation.mutateAsync,

        refresh: () => {
            ingredientsQuery.refetch();
            dashboardQuery.refetch();
        },
    };
}
