import { useQuery } from "@tanstack/react-query";
import DashboardApi from "@/api/DashboardApi";
// import OrderDashboardApi from "@/api/OrderDashboardApi"; // we won't call it for now

export default function useDashboard() {

    /** ---------- DEFAULT DATA ---------- **/
    const defaultDashboard = {
        total_void_amount: 0,
        total_successful_transactions: 0,
        total_products_sold: 0,
        avg_daily_transactions: 0,
        top_selling_products: [],
        sales_trend: []
    };

    const dummyOrderDashboard = {
        total_orders: 10,
        pending_orders: 2,
        completed_orders: 10,
        rejected_orders: 5
    };

    /** ---------- POS DASHBOARD QUERY ---------- **/
    const {
        data: dashboardData = defaultDashboard,
        isLoading: dashboardLoading,
        error: dashboardError,
        refetch: refreshDashboard
    } = useQuery({
        queryKey: ["dashboard-analytics"],
        queryFn: () => DashboardApi(),
        staleTime: 1000 * 60 * 5,
        retry: 1
    });

    /** ---------- ORDERS DASHBOARD DUMMY ---------- **/
    const orderDashboardData = dummyOrderDashboard;
    const orderDashboardLoading = false;
    const orderDashboardError = null;
    const refreshOrderDashboard = () => console.log("Order dashboard refreshed");

    /** ---------- RETURN COMBINED ---------- **/
    return {
        /* POS Dashboard */
        dashboardData,
        dashboardLoading,
        dashboardError: dashboardError
            ? { status: "error", detail: dashboardError.message }
            : null,

        /* Orders Dashboard (dummy) */
        orderDashboardData,
        orderDashboardLoading,
        orderDashboardError,

        /* Actions */
        refreshDashboard,
        refreshOrderDashboard
    };
}
