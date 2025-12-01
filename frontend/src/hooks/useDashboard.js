import { useQuery } from "@tanstack/react-query";
import DashboardApi from "@/api/DashboardApi";

export default function useDashboard() {
    const queryKey = ["dashboard-analytics"];

    // Default structure ensures your UI doesn't crash while loading
    const defaultData = {
        total_void_amount: 0,
        total_successful_transactions: 0,
        total_products_sold: 0,
        avg_daily_transactions: 0,
        top_selling_products: [],
        sales_trend: []
    };

    const { 
        data: dashboardData = defaultData, 
        isLoading, 
        error,
        refetch 
    } = useQuery({
        queryKey: queryKey,
        queryFn: () => DashboardApi(),
        // Data remains fresh for 5 minutes. 
        // Use '0' if you want it to refresh every time the user visits the page.
        staleTime: 1000 * 60 * 5, 
        retry: 1, // Only retry once if it fails
    });

    return {
        // Data
        dashboardData,
        
        // Statuses
        dashboardLoading: isLoading,
        dashboardError: error ? { status: "error", detail: error.message || "Failed to load analytics" } : null,
        
        // Actions
        refreshDashboard: refetch
    };
}