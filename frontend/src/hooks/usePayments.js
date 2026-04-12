import API_ENDPOINTS from "@/api/endpoints";
import useQueryFetch from "./useQueryFetch";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export default function usePayments() {
    const [searchParams] = useSearchParams();

    const apiParams = useMemo(
        () => Object.fromEntries(searchParams.entries()),
        [searchParams],
    );

    const paymentsQuery = useQueryFetch("payment-history", API_ENDPOINTS.PAYMENT_HISTORY, apiParams);

    return {
        data: paymentsQuery?.data || { count: 0, next: null, previous: null, results: [] },
        loading: paymentsQuery.isPending,
        error: paymentsQuery.error,
        refresh: () => paymentsQuery.refetch(),
    };
}
