import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useSize() {
    const sizeQuery = useQueryFetch("sizes", API_ENDPOINTS.SIZES);
    const { create, update, remove, loading: mutateLoading, error: mutateError, response } =
        useMutate("sizes");

    const rawError = sizeQuery.error || mutateError;

    return {
        sizeData: sizeQuery.data || [],
        sizeResponse: response || null,
        sizeLoading: sizeQuery.isPending || mutateLoading,
        sizeError: rawError
            ? { status: "error", detail: rawError.message || "Failed to process size." }
            : null,
        fetchSizes: () => sizeQuery.refetch(),
        postSize: (params) => create(API_ENDPOINTS.SIZES, params),
        patchSize: (id, params) => update(`${API_ENDPOINTS.SIZES}${id}/`, params),
        deleteSize: (id) => remove(`${API_ENDPOINTS.SIZES}${id}/`),
        refresh: () => sizeQuery.refetch(),
    };
}
