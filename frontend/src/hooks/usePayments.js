import API_ENDPOINTS from "@/api/endpoints";
import useQueryFetch from "./useQueryFetch";

export default function usePayments(params = {}) {
    const paymentsQuery = useQueryFetch("payment-history", API_ENDPOINTS.PAYMENT_HISTORY, params);

    return {
        data: paymentsQuery?.data || [],
        loading: paymentsQuery.isPending,
        error: paymentsQuery.error,
        refresh: () => paymentsQuery.refetch(),
    };
}
