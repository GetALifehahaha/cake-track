import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { saveAllDiscounts, getLocalDiscounts } from "@/services/db";

export default function useDiscount() {
    const discountQuery = useQuery({
        queryKey: ["discounts"],
        queryFn: async () => {
            if (navigator.onLine) {
                try {
                    const response = await api.get(API_ENDPOINTS.DISCOUNTS);
                    const discounts = response.data.results || response.data;
                    await saveAllDiscounts(discounts);
                } catch (error) {
                    console.warn("Offline or network error, relying on local discount cache.");
                }
            }
            return await getLocalDiscounts();
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