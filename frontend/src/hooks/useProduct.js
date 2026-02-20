    import { useMemo } from "react";
    import { ProductApi } from "@/api/ProductApi";
    import { useParams, useSearchParams } from "react-router-dom";
    import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

    export default function useProduct({isArchived=false} = {}) {
        const [searchParams] = useSearchParams();
        const queryClient = useQueryClient();

        const apiParams = useMemo(() => {
            const params = Object.fromEntries(searchParams.entries());
            if (isArchived) {
                params.is_archived = true;
            }
            return params;
        }, [searchParams, isArchived]);

        const productQuery = useQuery({
            queryKey: ['products', JSON.stringify(apiParams)],
            queryFn: () => ProductApi.fetchList(apiParams),
            placeholderData: (previous) => previous
        })

        const onSuccessInvalidate = () => queryClient.invalidateQueries({queryKey: ['products']});

        const createMutation = useMutation({
            mutationFn: (data) => ProductApi.create(data),
            onSuccess: onSuccessInvalidate,
        })

        const updateMutation = useMutation({
            mutationFn: ({id, data}) => ProductApi.update(id, data),
            onSuccess: onSuccessInvalidate,
        })

        const deleteMutation = useMutation({
            mutationFn: (id) => ProductApi.delete(id),
            onSuccess: onSuccessInvalidate,
        })

        const batchUnarchiveMutation = useMutation({
            mutationFn: (params) => ProductApi.batchUnarchive(params),
            onSuccess: onSuccessInvalidate,
        })

        return {
            data: productQuery?.data || [],

            loading: productQuery.isPending || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,

            error: productQuery.error || createMutation.error || updateMutation.error || deleteMutation.error,

            postProduct: async (params) => {
                return createMutation.mutateAsync(params);
            },

            patchProduct: async (id, data) => {
                return updateMutation.mutateAsync({id, data});
            },

            batchUnarchiveProduct: async (data) => {
                return batchUnarchiveMutation.mutateAsync(data)
            },

            deleteProduct: async (id) => {
                return deleteMutation.mutateAsync(id);
            },

            refresh: () => productQuery.refetch()
        }
    }
