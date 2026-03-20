import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export default function useDiscount() {
    const discountQuery = useQuery({
        queryKey: ["discounts"],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.DISCOUNTS);
            return response.data.results || response.data;
        },
        staleTime: 10 * 60 * 1000,
    });

    const { create, update, remove, loading: mutateLoading, error: mutateError, response } = useMutate("discounts", {
        invalidateKeys: [["discounts"]]
    });

    return {
        discountData: discountQuery.data || [],
        discountLoading: discountQuery.isPending || mutateLoading,
        discountError: discountQuery.error || mutateError,
        discountResponse: response,
        fetchDiscounts: () => discountQuery.refetch(),
        refresh: () => discountQuery.refetch(),
        postDiscount: (params) => create(API_ENDPOINTS.DISCOUNTS, params),
        patchDiscount: (id, data) => update(`${API_ENDPOINTS.DISCOUNTS}${id}/`, data),
        deleteDiscount: (id) => remove(`${API_ENDPOINTS.DISCOUNTS}${id}/`),
    };
}