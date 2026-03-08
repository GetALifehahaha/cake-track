import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useUnits(){
    const unitsQuery = useQueryFetch("units", API_ENDPOINTS.UNITS);
    const { create, update, remove, loading: mutateLoading, error: mutateError } =
        useMutate("units");

    return {
        data: unitsQuery.data || [],

        loading: unitsQuery.isPending || mutateLoading,

        error: unitsQuery.error || mutateError,

        postUnit: (params) => create(API_ENDPOINTS.UNITS, params),
        patchUnit: (id, data) => update(`${API_ENDPOINTS.UNITS}${id}/`, data),
        deleteUnit: (id) => remove(`${API_ENDPOINTS.UNITS}${id}/`),
        refresh: () => unitsQuery.refetch(),
    };
};