import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UnitApi } from '@/api/UnitApi'; // Your API wrapper for units

export default function useUnits(){
    const queryClient = useQueryClient();

    const unitsQuery = useQuery({
        queryKey: ['units'],
        queryFn: () => UnitApi.fetchList(),
        placeholderData: (previous) => previous,
    });

    const onSuccessInvalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['units'] });

    const createMutation = useMutation({
        mutationFn: (data) => UnitApi.create(data),
        onSuccess: onSuccessInvalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => UnitApi.update(id, data),
        onSuccess: onSuccessInvalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => UnitApi.delete(id),
        onSuccess: onSuccessInvalidate,
    });

    return {
        data: unitsQuery.data || [],

        loading:
            unitsQuery.isPending ||
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending,

        error:
            unitsQuery.error ||
            createMutation.error ||
            updateMutation.error ||
            deleteMutation.error,

        postUnit: async (params) => createMutation.mutateAsync(params),
        patchUnit: async (id, data) => updateMutation.mutateAsync({ id, data }),
        deleteUnit: async (id) => deleteMutation.mutateAsync(id),
        refresh: () => unitsQuery.refetch(),
    };
};