import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export default function useDiscount({ all = false } = {}) {
    const [searchParams] = useSearchParams();

    const apiParams = useMemo(() => {
        if (all) return { all: true };
        return Object.fromEntries(searchParams.entries());
    }, [all, searchParams]);

    const discountQuery = useQuery({
        queryKey: ["discounts", apiParams],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.DISCOUNTS, { params: apiParams });
            return response.data;
        },
        staleTime: 10 * 60 * 1000,
    });

    const queryData = discountQuery.data;
    const discountList = Array.isArray(queryData)
        ? queryData
        : (queryData?.results || []);

    const discountPagination = Array.isArray(queryData)
        ? { next: null, previous: null, count: queryData.length }
        : {
            next: queryData?.next || null,
            previous: queryData?.previous || null,
            count: queryData?.count ?? 0,
        };

    const { create, update, remove, loading: mutateLoading, error: mutateError, response } = useMutate("discounts", {
        invalidateKeys: [["discounts"]]
    });

    return {
        discountData: discountList,
        discountPagination,
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