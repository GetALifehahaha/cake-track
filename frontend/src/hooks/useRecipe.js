import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipeApi } from '@/api/RecipeApi';
import { useSearchParams } from 'react-router-dom';

export default function useRecipe(params = {}){
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const q = searchParams.get('q');

    const apiParams = { ...params, ...(q ? { q } : {}) };

    const recipeQuery = useQuery({
        queryKey: ['recipes', apiParams],
        queryFn: () => RecipeApi.fetchList(apiParams),
        placeholderData: (previous) => previous,
    });

    const onSuccessInvalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['recipes'] });

    const createMutation = useMutation({
        mutationFn: (data) => RecipeApi.create(data),
        onSuccess: onSuccessInvalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => RecipeApi.update(id, data),
        onSuccess: onSuccessInvalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => RecipeApi.delete(id),
        onSuccess: onSuccessInvalidate,
    });

    return {
        // Automatically extracts results if the API is paginated
        data: recipeQuery?.data || [],

        loading:
            recipeQuery.isPending ||
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending,

        error:
            recipeQuery.error ||
            createMutation.error ||
            updateMutation.error ||
            deleteMutation.error,

        postRecipe: async (data) => createMutation.mutateAsync(data),
        patchRecipe: async (id, data) => updateMutation.mutateAsync({ id, data }),
        deleteRecipe: async (id) => deleteMutation.mutateAsync(id),
        refresh: () => recipeQuery.refetch(),
    };
};