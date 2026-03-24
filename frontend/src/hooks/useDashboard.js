import { useSearchParams } from "react-router-dom";
import useQueryFetch from './useQueryFetch'
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import API_ENDPOINTS from "@/api/endpoints";

export default function useDashboard() {
    
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const params = useMemo(() => ({
        frequency: searchParams.get('frequency') || undefined,
        start_date: searchParams.get('start_date') || undefined,
        end_date: searchParams.get('end_date') || undefined,
    }), [searchParams]);

    const posDashboardQuery = useQueryFetch('pos-dashboard', API_ENDPOINTS.POS_DASHBOARD, params, {
        staleTime: 60 * 60 * 1000,
    });

    const ordersDashboardQuery = useQueryFetch('orders-dashboard', API_ENDPOINTS.ORDERS_DASHBOARD, params, {
        staleTime: 60 * 60 * 1000,
    });

    return {
        /* POS Dashboard */
        posDashboardData: posDashboardQuery.data || [],
        ordersDashboardData: ordersDashboardQuery.data || [],

        loading: posDashboardQuery.isPending || ordersDashboardQuery.isPending,
        error: posDashboardQuery.error || ordersDashboardQuery.error,
        refreshReports: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['pos-dashboard'] }),
                queryClient.invalidateQueries({ queryKey: ['orders-dashboard'] }),
            ]);
            await Promise.all([posDashboardQuery.refetch(), ordersDashboardQuery.refetch()]);
        },
    };
}
