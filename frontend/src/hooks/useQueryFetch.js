import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

const useQueryFetch = (key, url, params) => {
    return useQuery({
        queryKey: [key, {params}],
        queryFn: () => api.get(url, { params }).then(res => res.data),
        placeholderData: previousData => previousData,
        staleTime: 10 * 60 * 1000
    });
}

export default useQueryFetch