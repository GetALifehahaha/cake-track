import { useLocation, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import useQueryFetch from "./useQueryFetch";
import useMutate from "./useMutate";

export default function useOrder() {
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const currentParams = useMemo(() =>
        Object.fromEntries(searchParams.entries()),
    [searchParams]);

    const lastPart = location.pathname.split('/').filter(Boolean).pop();
    const currentFilter = lastPart === 'queue' ? null : lastPart;

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

    const ordersQuery = useQueryFetch('orders', '/orders/orders/', apiParams);
    const { create, update, remove, loading: mutateLoading, error: mutateError } = useMutate('orders');

    const blockedDatesQuery = useQueryFetch('blocked-dates', '/orders/blocked-dates/');
    const { create: blockDates, remove: unblockDates, loading: blockedMutateLoading, error: blockedMutateError } = useMutate('blocked-dates');

    return {
        data: ordersQuery.data || [],

        loading: ordersQuery.isPending || mutateLoading,
        error:   ordersQuery.error   || mutateError,

        postOrder:         (params)     => create('/orders/orders/', params),
        patchOrder:        (id, params) => update(`/orders/orders/${id}/`, params),
        batchUpdateOrders: (params)     => create('/orders/orders/batch-update/', params),
        deleteOrder:       (id)         => remove(`/orders/orders/${id}/`),

        refresh: () => ordersQuery.refetch(),

        blockedDates:        blockedDatesQuery.data || [],
        blockedDatesLoading: blockedDatesQuery.isPending || blockedMutateLoading,
        blockedDatesError:   blockedDatesQuery.error    || blockedMutateError,

        blockDates:   (dates) => blockDates('/orders/blocked-dates/', dates.map(date => ({ date }))),
        // unblockDates: (id) => console.log({dates: id}),
        unblockDates: (id) => unblockDates('/orders/blocked-dates/', {data: id}),
    };
}