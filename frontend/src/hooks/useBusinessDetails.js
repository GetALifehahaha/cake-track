import { useMemo } from "react";
import { BusinessDetailsApi } from "@/api/BusinessDetailsApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function useBusinessDetails() {
    const queryClient = useQueryClient();

    const businessDetailsQuery = useQuery({
        queryKey: ['business-details'],
        queryFn: () => BusinessDetailsApi.fetchList(),
        placeholderData: (previous) => previous
    });

    const onSuccessInvalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['business-details'] });

    const createMutation = useMutation({
        mutationFn: (data) => BusinessDetailsApi.create(data),
        onSuccess: onSuccessInvalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => BusinessDetailsApi.update(id, data),
        onSuccess: onSuccessInvalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => BusinessDetailsApi.delete(id),
        onSuccess: onSuccessInvalidate,
    });

    return {
        data: businessDetailsQuery.data || [],

        loading:
            businessDetailsQuery.isPending ||
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending,

        error:
            businessDetailsQuery.error ||
            createMutation.error ||
            updateMutation.error ||
            deleteMutation.error,

        postBusinessDetails: async (params) => {
            return createMutation.mutateAsync(params);
        },

        patchBusinessDetails: async (id, data) => {
            return updateMutation.mutateAsync({ id, data });
        },

        deleteBusinessDetails: async (id) => {
            return deleteMutation.mutateAsync(id);
        },
    };
}
