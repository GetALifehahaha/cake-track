import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DiscountApi } from "../api/DiscountApi";

export default function useDiscount() {
    const queryClient = useQueryClient();

    const discountQuery = useQuery({
        queryKey: ['discounts'],
        queryFn: () => DiscountApi.fetchList(),
        placeholderData: (previous) => previous,
    });

    const onSuccessInvalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['discounts'] });

    const createMutation = useMutation({
        mutationFn: (params) => DiscountApi.create(params),
        onSuccess: onSuccessInvalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => DiscountApi.update(id, data),
        onSuccess: onSuccessInvalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => DiscountApi.delete(id),
        onSuccess: onSuccessInvalidate,
    });

    return {
        discountData: discountQuery.data || [],

        discountLoading:
            discountQuery.isPending ||
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending,

        discountError:
            discountQuery.error ||
            createMutation.error ||
            updateMutation.error ||
            deleteMutation.error,
        
        discountResponse: createMutation.data || updateMutation.data || deleteMutation.data,

        fetchDiscounts: () => discountQuery.refetch(),
        refresh: () => discountQuery.refetch(),

        postDiscount: async (params) => createMutation.mutateAsync(params),
        patchDiscount: async (id, data) => updateMutation.mutateAsync({ id, data }),
        deleteDiscount: async (id) => deleteMutation.mutateAsync(id),
    };
}