import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useDiscount() {
    const discountQuery = useQueryFetch("discounts", API_ENDPOINTS.DISCOUNTS);
    const { create, update, remove, loading: mutateLoading, error: mutateError, response } =
        useMutate("discounts");

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