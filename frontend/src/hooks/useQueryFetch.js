import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

const useQueryFetch = (key, url, params, options = {}) => {
    const { keepPreviousData = true, staleTime = 10 * 60 * 1000 } = options;
    const normalizedKey = Array.isArray(key) ? key : [key];

    return useQuery({
        queryKey: [...normalizedKey, { params }],
        queryFn: () => api.get(url, { params }).then(res => res.data),
        placeholderData: keepPreviousData ? (previousData => previousData) : undefined,
        staleTime,
    });
}

export default useQueryFetch