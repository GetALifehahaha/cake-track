import { useQuery } from "@tanstack/react-query";
import {DashboardApi} from "@/api/DashboardApi";
import { useSearchParams } from "react-router-dom";
// import OrderDashboardApi from "@/api/OrderDashboardApi"; // we won't call it for now

export default function useDashboard() {
    
    const [searchParams] = useSearchParams();
    const params = {frequency: searchParams.get('frequency'), month: searchParams.get('month')} // --> daily, weekly, or monthly

    const dummyOrderDashboard = {
        total_orders: 10,
        pending_orders: 2,
        completed_orders: 10,
        rejected_orders: 5
    };

    const dashboardQuery = useQuery({
        queryKey: ['dashboard', params],
        queryFn: () => DashboardApi.fetchList(params),
        placeholderData: (previousData) => previousData
    });

    /** ---------- ORDERS DASHBOARD DUMMY ---------- **/
    const orderDashboardData = dummyOrderDashboard;
    const orderDashboardLoading = false;
    const orderDashboardError = null;
    const refreshOrderDashboard = () => console.log("Order dashboard refreshed");

    /** ---------- RETURN COMBINED ---------- **/
    return {
        /* POS Dashboard */
        dashboardData: dashboardQuery.data || [],
        dashboardLoading: dashboardQuery.isPending,
        dashboardError: dashboardQuery.error,

        /* Orders Dashboard (dummy) */
        orderDashboardData,
        orderDashboardLoading,
        orderDashboardError,

        /* Actions */
        refreshDashboard: () => dashboardQuery.refetch(),
        refreshOrderDashboard
    };
}
