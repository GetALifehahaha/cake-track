import { useSearchParams } from "react-router-dom";
import useQueryFetch from './useQueryFetch'
import { useMemo } from "react";

export default function useDashboard() {
    
    const [searchParams] = useSearchParams();
    const params = useMemo(() => ({
        frequency: searchParams.get('frequency') || undefined,
        start_date: searchParams.get('start_date') || undefined,
        end_date: searchParams.get('end_date') || undefined,
    }), [searchParams]);

    const posDashboardQuery = useQueryFetch('pos-dashboard', '/pos/dashboard/', params);

    const ordersDashboardQuery = useQueryFetch('orders-dashboard', '/orders/dashboard/', params);

    return {
        /* POS Dashboard */
        posDashboardData: posDashboardQuery.data || [],
        ordersDashboardData: ordersDashboardQuery.data || [],

        loading: posDashboardQuery.isPending || ordersDashboardQuery.isPending,
        error: posDashboardQuery.error || ordersDashboardQuery.error,
    };
}
