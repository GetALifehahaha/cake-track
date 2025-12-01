import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api"; // your axios instance

export default function useRecipe() {
    const queryClient = useQueryClient();
    const queryKey = ["recipes"];

    // 1. FETCH (Read all recipes)
    const { 
        data: recipeData = [], 
        isLoading: isReading, 
        error: readError,
        refetch 
    } = useQuery({
        queryKey,
        queryFn: () => api.get('/recipes/').then(res => res.data),
        staleTime: 1000 * 60,
    });

    // 2. CREATE (Post)
    const createMutation = useMutation({
        mutationFn: (params) => api.post('/recipes/', params).then(res => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    // 3. UPDATE (Patch)
    const updateMutation = useMutation({
        mutationFn: ({ id, params }) => api.patch(`/recipes/${id}/`, params).then(res => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    // 4. DELETE
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/recipes/${id}/`).then(res => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    // 5. COOK (POST to /recipes/:id/cook/)
    const cookMutation = useMutation({
        mutationFn: (id) => api.post(`/recipes/${id}/cook/`).then(res => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    // Helper to consolidate loading states
    const recipeLoading = isReading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || cookMutation.isPending;

    // Helper to consolidate errors
    const recipeError = readError || createMutation.error || updateMutation.error || deleteMutation.error || cookMutation.error;

    // Helper to consolidate success responses
    const recipeResponse = createMutation.isSuccess
        ? { status: "success", detail: "Recipe created successfully." }
        : updateMutation.isSuccess
        ? { status: "success", detail: "Recipe updated successfully." }
        : deleteMutation.isSuccess
        ? { status: "success", detail: "Recipe deleted successfully." }
        : cookMutation.isSuccess
        ? { status: "success", detail: "Recipe cooked successfully." }
        : null;

    return {
        // Data
        recipeData,

        // Statuses
        recipeLoading,
        recipeError: recipeError ? { status: "error", detail: recipeError.message || "An error occurred" } : null,
        recipeResponse,

        // Actions
        fetchRecipes: refetch,
        postRecipe: (params) => createMutation.mutateAsync(params),
        patchRecipe: (id, params) => updateMutation.mutateAsync({ id, params }),
        deleteRecipe: (id) => deleteMutation.mutateAsync(id),
        cookRecipe: (id) => cookMutation.mutateAsync(id),
        refresh: refetch,
    };
}
