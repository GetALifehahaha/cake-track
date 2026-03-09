import { useLocation, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import API_ENDPOINTS from "@/api/endpoints";
import useQueryFetch from "./useQueryFetch";
import useMutate from "./useMutate";

export default function useOrder() {
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const currentParams = useMemo(() =>
        Object.fromEntries(searchParams.entries()),
    [searchParams]);

    const lastPart = location.pathname.split('/').filter(Boolean).pop();
    const currentFilter = lastPart === 'cake-orders' ? null : lastPart;

    const apiParams = useMemo(() => {
        const raw = {
            status: currentFilter,
            created_at: currentParams.due_date,
            q: currentParams.q
        };

        return Object.fromEntries(
            Object.entries(raw).filter(([, v]) => v && v !== 'null' && v !== 'undefined')
        );
    }, [currentFilter, currentParams.due_date, currentParams.q]);

    const ordersQuery = useQueryFetch('orders', API_ENDPOINTS.ORDERS, apiParams);
    const { create, update, remove, loading: mutateLoading, error: mutateError } = useMutate('orders');

    const blockedDatesQuery = useQueryFetch('blocked-dates', API_ENDPOINTS.BLOCKED_DATES);
    const {
        create: createBlockedDates,
        remove: deleteBlockedDates,
        loading: blockedMutateLoading,
        error: blockedMutateError,
    } = useMutate('blocked-dates');

    return {
        data: ordersQuery.data || [],

        loading: ordersQuery.isPending || mutateLoading,
        error:   ordersQuery.error   || mutateError,

        postOrder:         (params)     => create(API_ENDPOINTS.ORDERS, params),
        patchOrder:        (id, params) => update(`${API_ENDPOINTS.ORDERS}${id}/`, params),
        batchUpdateOrders: (params)     => create(API_ENDPOINTS.ORDERS_BATCH_UPDATE, params),
        deleteOrder:       (id)         => remove(`${API_ENDPOINTS.ORDERS}${id}/`),

        refresh: () => ordersQuery.refetch(),

        blockedDates:        blockedDatesQuery.data || [],
        blockedDatesLoading: blockedDatesQuery.isPending || blockedMutateLoading,
        blockedDatesError:   blockedDatesQuery.error    || blockedMutateError,

        blockDates: (dates) =>
        createBlockedDates(API_ENDPOINTS.BLOCKED_DATES, dates.map((date) => ({ date }))),
        unblockDates: (id) => deleteBlockedDates(API_ENDPOINTS.BLOCKED_DATES, { data: id }),
    };
}