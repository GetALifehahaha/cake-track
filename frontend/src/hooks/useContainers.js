import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useContainers() {
    const containersQuery = useQueryFetch("containers", API_ENDPOINTS.CONTAINERS);

    const { create, update, remove, loading: mutateLoading, error: mutateError } = useMutate(
        "containers",
        {
            invalidateKeys: [
                ["containers"],
                ["ingredients"],
                ["ingredient-fetch-all"],
                ["recipes"],
                ["orders"],
            ],
        },
    );

    return {
        containerData: containersQuery.data || [],
        containerLoading: containersQuery.isPending || mutateLoading,
        containerError: containersQuery.error || mutateError,

        postContainer: (params) => create(API_ENDPOINTS.CONTAINERS, params),
        patchContainer: (id, data) => update(`${API_ENDPOINTS.CONTAINERS}${id}/`, data),
        deleteContainer: (id) => remove(`${API_ENDPOINTS.CONTAINERS}${id}/`),

        refresh: () => containersQuery.refetch(),
    };
}
