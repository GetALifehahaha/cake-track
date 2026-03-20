import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useBusinessDetails() {
    const businessDetailsQuery = useQueryFetch(
        "business-details",
        API_ENDPOINTS.BUSINESS_DETAILS,
        {}
    );

    const { create, update, remove, loading: mutateLoading, error: mutateError } =
        useMutate("business-details");

    return {
        data: businessDetailsQuery.data || {},

        loading: businessDetailsQuery.isPending || mutateLoading,

        error: businessDetailsQuery.error || mutateError,

        postBusinessDetails: (params) => create(API_ENDPOINTS.BUSINESS_DETAILS, params),

        patchBusinessDetails: (id, data) =>
            update(`${API_ENDPOINTS.BUSINESS_DETAILS}${id}/`, data),

        deleteBusinessDetails: (id) => remove(`${API_ENDPOINTS.BUSINESS_DETAILS}${id}/`),
    };
}
