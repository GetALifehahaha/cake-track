import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { OrdersApi } from "@/api/OrdersApi";

export default function useOrder() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const currentParams = useMemo(() => 
        Object.fromEntries(searchParams.entries()), 
    [searchParams]);

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastPart = pathSegments.pop();
    const currentFilter = lastPart === 'queue' ? null : lastPart;

    const rawParams = {
        status: currentFilter,
        created_at: currentParams.due_date,
    };

    const apiParams = Object.entries(rawParams).reduce((acc, [key, value]) => {
        const isValid = value && value !== 'null' && value !== 'undefined';
        if (isValid) acc[key] = value;
        return acc;
    }, {});

    const ordersQuery = useQuery({
        queryKey: ['orders', apiParams], 
        queryFn: () => OrdersApi.fetchList(apiParams),
        placeholderData: (previousData) => previousData, 
    });

    const onSuccessInvalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
    };

    const createMutation = useMutation({
        mutationFn: (newOrderParams) => OrdersApi.create(newOrderParams),
        onSuccess: onSuccessInvalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, params }) => OrdersApi.update(id, params),
        onSuccess: onSuccessInvalidate,
    });

    // BATCH UPDATE
    const batchUpdateMutation = useMutation({
        mutationFn: (params) => OrdersApi.batchUpdate(params),
        onSuccess: onSuccessInvalidate,
    });

    // DELETE
    const deleteMutation = useMutation({
        mutationFn: (id) => OrdersApi.delete(id),
        onSuccess: onSuccessInvalidate,
    });

    // --- 4. Return Interface ---
    // We map React Query's internal state to match your previous hook's API
    // so you don't have to rewrite your UI components too much.

    return {
        // Data
        data: ordersQuery.data || [], // Default to empty array if loading/undefined
        
        // Combined Loading State (Fetching OR Mutating)
        loading: ordersQuery.isLoading || 
                 createMutation.isPending || 
                 updateMutation.isPending || 
                 deleteMutation.isPending ||
                 batchUpdateMutation.isPending,

        // Errors (You can pick specific errors or general ones)
        error: ordersQuery.error || createMutation.error || updateMutation.error,

        // Actions
        // We wrap these to match your old signature (except fetchOrders is removed as it's automatic now)
        
        postOrder: async (params) => {
            return createMutation.mutateAsync(params);
        },
        
        patchOrder: async (id, params) => {
            return updateMutation.mutateAsync({ id, params });
        },

        batchUpdateOrders: async (params) => {
            return batchUpdateMutation.mutateAsync(params);
        },
        
        deleteOrder: async (id) => {
            return deleteMutation.mutateAsync(id);
        },

        // Manual refresh (rarely needed, but available)
        refresh: () => ordersQuery.refetch(),
    };
}