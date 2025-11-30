import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OrderApi from "@/api/OrdersApi";
import { useLocation, useSearchParams } from "react-router-dom";
import { useMemo } from "react";

export default function useOrder() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // --- 1. Derive Filters (Same logic as before) ---
    const currentParams = useMemo(() => 
        Object.fromEntries(searchParams.entries()), 
    [searchParams]);

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastPart = pathSegments.pop();
    const currentFilter = lastPart === 'queue' ? null : lastPart;

    // Construct API Params
    const rawParams = {
        status: currentFilter,
        created_at: currentParams.due_date,
    };

    // Clean params (remove null/undefined strings)
    const apiParams = Object.entries(rawParams).reduce((acc, [key, value]) => {
        const isValid = value && value !== 'null' && value !== 'undefined';
        if (isValid) acc[key] = value;
        return acc;
    }, {});

    // --- 2. GET: Fetch Orders (useQuery) ---
    const ordersQuery = useQuery({
        // Unique key: whenever 'apiParams' changes, this query re-runs automatically
        queryKey: ['orders', apiParams], 
        queryFn: () => OrderApi(apiParams),
        // Optional: Keep previous data while fetching new filter (prevents UI flashing)
        placeholderData: (previousData) => previousData, 
        // Optional: Error handling logic if needed globally, usually handled in UI
    });

    // --- 3. Mutations (POST, PATCH, DELETE) ---

    // Generic helper to invalidate cache after success
    const onSuccessInvalidate = () => {
        // This triggers a refetch of the 'orders' query above
        queryClient.invalidateQueries({ queryKey: ['orders'] });
    };

    // CREATE (POST)
    const createMutation = useMutation({
        mutationFn: (newOrderParams) => OrderApi(newOrderParams, null, "POST"),
        onSuccess: onSuccessInvalidate,
    });

    // UPDATE (PATCH)
    const updateMutation = useMutation({
        mutationFn: ({ id, params }) => OrderApi(params, id, "PATCH"),
        onSuccess: onSuccessInvalidate,
    });

    // BATCH UPDATE
    const batchUpdateMutation = useMutation({
        mutationFn: (params) => OrderApi(params, null, "BATCH_UPDATE"),
        onSuccess: onSuccessInvalidate,
    });

    // DELETE
    const deleteMutation = useMutation({
        mutationFn: (id) => OrderApi(null, id, "DELETE"),
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