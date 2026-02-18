import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryApi } from "../api/CategoryApi";

export default function useCategory() {
    const queryClient = useQueryClient();

    const categoryQuery = useQuery({
        queryKey: ['categories'],
        queryFn: () => CategoryApi.fetchList(),
        placeholderData: (previous) => previous,
    });

    const onSuccessInvalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['categories'] });

    const createMutation = useMutation({
        mutationFn: (params) => CategoryApi.create(params),
        onSuccess: onSuccessInvalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => CategoryApi.update(id, data),
        onSuccess: onSuccessInvalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => CategoryApi.delete(id),
        onSuccess: onSuccessInvalidate,
    });

    return {
        categoryData: categoryQuery.data || [],
        
        categoryLoading:
            categoryQuery.isPending ||
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending,

        categoryError:
            categoryQuery.error ||
            createMutation.error ||
            updateMutation.error ||
            deleteMutation.error,

        categoryResponse: createMutation.data || updateMutation.data || deleteMutation.data,

        fetchCategories: () => categoryQuery.refetch(),
        refresh: () => categoryQuery.refetch(),
        
        postCategory: async (params) => createMutation.mutateAsync(params),
        patchCategory: async (id, data) => updateMutation.mutateAsync({ id, data }),
        deleteCategory: async (id) => deleteMutation.mutateAsync(id),
        updateCategory: async (id, data) => updateMutation.mutateAsync({ id, data }),
    };
}