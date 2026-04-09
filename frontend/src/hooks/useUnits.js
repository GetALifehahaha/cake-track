import API_ENDPOINTS from "@/api/endpoints";
import useQueryFetch from "./useQueryFetch";

export default function useUnits(){
    const unitsQuery = useQueryFetch("units", API_ENDPOINTS.UNITS);

    return {
        data: unitsQuery.data || [],

        loading: unitsQuery.isPending,

        error: unitsQuery.error,

        refresh: () => unitsQuery.refetch(),
    };
};