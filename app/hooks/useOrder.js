import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OrderApi from "@/api/OrderApi";
// CHANGED: Use Expo Router hooks instead of react-router-dom
import { useLocalSearchParams, usePathname } from "expo-router"; 
import { useMemo } from "react";

export default function useOrder(options = {}) {
    const { includeArchivedOrders = false, includeHiddenOrders = false } = options;
    const shouldIncludeArchivedOrders = includeArchivedOrders || includeHiddenOrders;
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

    const archivedOrdersQuery = useQuery({
        queryKey: ['orders', 'archived'],
        queryFn: () => OrderApi(null, null, 'GET_ARCHIVED_ALL_PAGES'),
        enabled: shouldIncludeArchivedOrders,
        placeholderData: (previousData) => previousData,
    });

    // --- 3. Mutations ---
    const onSuccessInvalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['orders', 'archived'] });
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

    const archiveMutation = useMutation({
        mutationFn: (id) => OrderApi(null, id, "ARCHIVE"),
        onSuccess: onSuccessInvalidate,
    });

    // --- 4. Return Interface ---
    return {
        data: ordersQuery.data || [],
        archivedData: archivedOrdersQuery.data || [],
        hiddenData: archivedOrdersQuery.data || [],
        
        loading: ordersQuery.isLoading || 
                 archivedOrdersQuery.isLoading ||
                 createMutation.isPending || 
                 updateMutation.isPending || 
                 deleteMutation.isPending ||
                 batchUpdateMutation.isPending ||
                 archiveMutation.isPending,

        error: ordersQuery.error || archivedOrdersQuery.error || createMutation.error || updateMutation.error,

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

        archiveOrder: async (id) => {
            return archiveMutation.mutateAsync(id);
        },

        hideOrder: async (id) => {
            return archiveMutation.mutateAsync(id);
        },

        refresh: async () => {
            const tasks = [ordersQuery.refetch()];
            if (shouldIncludeArchivedOrders) {
                tasks.push(archivedOrdersQuery.refetch());
            }
            await Promise.allSettled(tasks);
        },
    };
}