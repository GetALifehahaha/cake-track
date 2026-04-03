import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OrderApi from "@/api/OrderApi";
// CHANGED: Use Expo Router hooks instead of react-router-dom
import { useLocalSearchParams, usePathname } from "expo-router"; 
import { useMemo } from "react";

export default function useOrder() {
    const queryClient = useQueryClient();
    // CHANGED: Expo equivalent of useSearchParams
    const params = useLocalSearchParams(); 
    // CHANGED: Expo equivalent of useLocation
    // const pathname = usePathname(); 

    // --- 1. Derive Filters ---
    // const currentParams = useMemo(() => {
    //     // useLocalSearchParams returns an object directly, no need for entries()
    //     return params;
    // }, [params]);

    // Parse URL for "queue" filter (similar logic to your web version)
    // const pathSegments = pathname.split('/').filter(Boolean);
    // const lastPart = pathSegments.pop();
    // const currentFilter = lastPart === 'queue' ? null : lastPart;

    // // Construct API Params
    // const rawParams = {
    //     status: currentFilter,
    //     created_at: currentParams.due_date,
    // };

    // Clean params
    // const apiParams = Object.entries(rawParams).reduce((acc, [key, value]) => {
    //     const isValid = value && value !== 'null' && value !== 'undefined';
    //     if (isValid) acc[key] = value;
    //     return acc;
    // }, {});

    // --- 2. GET: Fetch Orders ---
    const ordersQuery = useQuery({
        // queryKey: ['orders', apiParams], 
        // queryFn: () => OrderApi(apiParams),
        queryKey: ['orders'], 
        queryFn: () => OrderApi(),
        placeholderData: (previousData) => previousData, 
    });

    // --- 3. Mutations ---
    const onSuccessInvalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
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
        
        loading: ordersQuery.isLoading || 
                 createMutation.isPending || 
                 updateMutation.isPending || 
                 deleteMutation.isPending ||
                 batchUpdateMutation.isPending ||
                 hideMutation.isPending,

        error: ordersQuery.error || createMutation.error || updateMutation.error,

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

        refresh: () => ordersQuery.refetch(),
    };
}