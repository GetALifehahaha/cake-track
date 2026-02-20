import { useMemo } from "react";
import { CakeApi } from "@/api/CakeApi";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCakes({ isArchived = false } = {}) {
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const apiParams = useMemo(() => {
        const params = Object.fromEntries(searchParams.entries());
        if (isArchived) {
            params.is_archived = true;
        }
        return params;
    }, [searchParams, isArchived]);

    const cakesQuery = useQuery({
        queryKey: ['cakes', JSON.stringify(apiParams)],
        queryFn: () => CakeApi.fetchList(apiParams),
        placeholderData: (previous) => previous
    });

    const onSuccessInvalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['cakes'] });

    const createMutation = useMutation({
        mutationFn: (data) => CakeApi.create(data),
        onSuccess: onSuccessInvalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => CakeApi.update(id, data),
        onSuccess: onSuccessInvalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => CakeApi.delete(id),
        onSuccess: onSuccessInvalidate,
    });

    const batchUnarchiveMutation = useMutation({
        mutationFn: (params) => CakeApi.batchUnarchive(params),
        onSuccess: onSuccessInvalidate,
    });

    return {
        data: cakesQuery.data || [],

        loading:
            cakesQuery.isPending ||
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending,

        error:
            cakesQuery.error ||
            createMutation.error ||
            updateMutation.error ||
            deleteMutation.error,

        postCake: async (params) => {
            return createMutation.mutateAsync(params);
        },

        patchCake: async (id, data) => {
            return updateMutation.mutateAsync({ id, data });
        },

        deleteCake: async (id) => {
            return deleteMutation.mutateAsync(id);
        },

        batchUnarchiveCake: async (data) => {
            return batchUnarchiveMutation.mutateAsync(data);
        },

        refresh: () => cakesQuery.refetch()
    };
}
