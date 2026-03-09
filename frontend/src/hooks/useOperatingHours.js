import useQueryFetch from "./useQueryFetch";
import useMutate from "./useMutate";
import API_ENDPOINTS from "@/api/endpoints";

export default function useOperatingHours() {
    const query = useQueryFetch('opening-time', API_ENDPOINTS.OPENING_TIME);
    const { update, loading: mutateLoading, error: mutateError } = useMutate('opening-time');

    return {
        operatingHours: query.data || null,
        loading: query.isPending || mutateLoading,
        error: query.error || mutateError,
        updateOperatingHours: (data) => update(API_ENDPOINTS.OPENING_TIME, data),
    };
}
