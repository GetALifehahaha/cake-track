import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OrderApi from "@/api/OrderApi";
// CHANGED: Use Expo Router hooks instead of react-router-dom
import { useLocalSearchParams, usePathname } from "expo-router"; 
import { useMemo } from "react";

export default function useOrder(options = {}) {
    const { includeHiddenOrders = false } = options;
    const queryClient = useQueryClient();
    // CHANGED: Expo equivalent of useSearchParams
    const params = useLocalSearchParams(); 

    // --- 2. GET: Fetch Orders ---
    const ordersQuery = useQuery({
        // queryKey: ['orders', apiParams], 
        // queryFn: () => OrderApi(apiParams),
        queryKey: ['orders'],
        queryFn: () => OrderApi(null, null, 'GET_ALL_PAGES'),
        placeholderData: (previousData) => previousData,
    });

    const hiddenOrdersQuery = useQuery({
        queryKey: ['orders', 'hidden'],
        queryFn: () => OrderApi(null, null, 'GET_HIDDEN_ALL_PAGES'),
        enabled: includeHiddenOrders,
        placeholderData: (previousData) => previousData,
    });

    // --- 3. Mutations ---
    const onSuccessInvalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['orders', 'hidden'] });
    };

    const createMutation = useMutation({
        mutationFn: (newOrderParams) => OrderApi(newOrderParams, null, "POST"),
        onSuccess: onSuccessInvalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, params }) => OrderApi(params, id, "PATCH"),
        onSuccess: onSuccessInvalidate,
    });

    const batchUpdateMutation = useMutation({
        mutationFn: (params) => OrderApi(params, null, "BATCH_UPDATE"),
        onSuccess: onSuccessInvalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => OrderApi(null, id, "DELETE"),
        onSuccess: onSuccessInvalidate,
    });

    const hideMutation = useMutation({
        mutationFn: (id) => OrderApi(null, id, "HIDE"),
        onSuccess: onSuccessInvalidate,
    });

    // --- 4. Return Interface ---
    return {
        data: ordersQuery.data || [],
        hiddenData: hiddenOrdersQuery.data || [],
        
        loading: ordersQuery.isLoading || 
                 hiddenOrdersQuery.isLoading ||
                 createMutation.isPending || 
                 updateMutation.isPending || 
                 deleteMutation.isPending ||
                 batchUpdateMutation.isPending ||
                 hideMutation.isPending,

        error: ordersQuery.error || hiddenOrdersQuery.error || createMutation.error || updateMutation.error,

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

        hideOrder: async (id) => {
            return hideMutation.mutateAsync(id);
        },

        refresh: async () => {
            const tasks = [ordersQuery.refetch()];
            if (includeHiddenOrders) {
                tasks.push(hiddenOrdersQuery.refetch());
            }
            await Promise.allSettled(tasks);
        },
    };
}